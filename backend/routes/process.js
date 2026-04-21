const express = require('express');
const router = express.Router();
const multer = require('multer');
const pLimit = require('p-limit');
const crypto = require('crypto');
const axios = require('axios');
const { parseCSV } = require('../services/csvParser');
const { analyzePDF, analyzePDFBuffer, extractMetaFromPDF, convertDriveLink } = require('../services/pdfAnalyzer');
const { getCached, setCache } = require('../services/cache');
const FacultyReport = require('../models/FacultyReport');
const { authMiddleware } = require('./middleware');
const { log } = require('../services/logger');

// CSV upload: 5MB limit
const csvUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// PDF upload: up to 50 files, 20MB each
const pdfUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 50 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed'));
  }
});

// ─── CSV UPLOAD — just parse links, don't process yet ──────────────────────
router.post('/upload-csv', authMiddleware, csvUpload.single('csv'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No CSV file uploaded' });

    const entries = parseCSV(req.file.buffer);
    if (entries.length === 0) return res.status(400).json({ error: 'No valid Drive links found in CSV' });

    // Return just the links — don't create DB records yet
    res.json({
      message: `Found ${entries.length} PDF links`,
      links: entries.map(e => e.pdfLink),
      total: entries.length
    });
    // Log CSV upload
    log(req.user.id, 'csv_upload', `CSV uploaded with ${entries.length} PDF links`, { total: entries.length }, 'success');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PROCESS ONE PDF by Drive link (called when HOD clicks OK) ─────────────
router.post('/process-one', authMiddleware, async (req, res) => {
  // Set longer timeout for AI processing
  req.setTimeout(120000);
  res.setTimeout(120000);
  try {
    const { pdfLink, sno } = req.body;
    if (!pdfLink) return res.status(400).json({ error: 'No PDF link provided' });

    // Check cache first
    const cacheKey = `pdf_${pdfLink}`;
    const metaCacheKey = `meta_${pdfLink}`;
    let result = getCached(cacheKey);
    let meta = getCached(metaCacheKey);

    if (!result || !meta) {
      // Download and analyze
      const response = await axios.get(convertDriveLink(pdfLink), {
        responseType: 'arraybuffer', timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 5
      });
      const buffer = Buffer.from(response.data);

      [result, meta] = await Promise.all([
        analyzePDFBuffer(buffer),
        extractMetaFromPDF(buffer)
      ]);

      setCache(cacheKey, result);
      setCache(metaCacheKey, meta);
    }

    // Save to DB
    const report = await FacultyReport.create({
      hodId: req.user.id,
      facultyName: meta.facultyName || '',
      subjectCode: meta.subjectCode || '',
      programme: meta.programme || '',
      semester: meta.semester || '',
      pdfLink,
      driveLink: pdfLink,
      appreciation: result.appreciation,
      commentsNeedingAttention: result.commentsNeedingAttention,
      appreciationCount: result.appreciationCount,
      attentionCount: result.attentionCount,
      ffiScore: result.ffiScore ?? meta.ffiScore ?? null,
      status: 'processed',
      analyzedAt: result.analyzedAt
    });

    res.json({ report, sno });
    // Log successful PDF processing
    log(req.user.id, 'pdf_processed',
      `PDF processed: ${report.facultyName || 'Unknown'} (${report.subjectCode || 'N/A'}) — FFI: ${report.ffiScore ?? 'N/A'}`,
      { reportId: report._id, facultyName: report.facultyName, ffiScore: report.ffiScore, sno },
      'success'
    );
  } catch (err) {
    console.error('[process-one]', err.message);
    res.status(500).json({ error: err.message });
  }
});

// ─── PROCESSING STATUS POLL ─────────────────────────────────────────────────
router.post('/status', authMiddleware, async (req, res) => {
  try {
    const { reportIds } = req.body;
    const reports = await FacultyReport.find({ _id: { $in: reportIds } })
      .select('facultyName subjectCode status appreciationCount attentionCount errorMessage');

    const total = reports.length;
    const processed = reports.filter(r => r.status === 'processed').length;
    const errors = reports.filter(r => r.status === 'error').length;

    res.json({ total, processed, errors, pending: total - processed - errors, reports });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── SCAN PDFs — extract metadata only, no DB save ─────────────────────────
router.post('/scan-pdfs', authMiddleware, pdfUpload.array('pdfs', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No PDF files provided' });
    }

    const results = await Promise.all(
      req.files.map(async (file) => {
        try {
          const meta = await extractMetaFromPDF(file.buffer);
          if (!meta.facultyName) {
            meta.facultyName = file.originalname.replace(/\.pdf$/i, '').replace(/[_\-]/g, ' ').trim();
          }
          return { filename: file.originalname, ...meta, error: null };
        } catch (err) {
          return {
            filename: file.originalname,
            facultyName: file.originalname.replace(/\.pdf$/i, '').replace(/[_\-]/g, ' ').trim(),
            subjectCode: '', programme: '', semester: '',
            error: err.message
          };
        }
      })
    );

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DIRECT PDF UPLOAD + ANALYZE ────────────────────────────────────────────
router.post('/upload-pdfs', authMiddleware, pdfUpload.array('pdfs', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No PDF files uploaded' });
    }

    let metadata = [];
    try { metadata = req.body.metadata ? JSON.parse(req.body.metadata) : []; } catch {}

    const reportDocs = req.files.map((file, idx) => {
      const meta = metadata[idx] || {};
      return {
        hodId: req.user.id,
        facultyName: meta.facultyName || '',  // will be filled from PDF
        subjectCode: meta.subjectCode || '',
        programme: meta.programme || '',
        semester: meta.semester || '',
        pdfLink: `uploaded:${file.originalname}`,
        driveLink: meta.driveLink || '',
        status: 'pending'
      };
    });

    const reports = await FacultyReport.insertMany(reportDocs);

    const limit = pLimit(5);
    const processTasks = reports.map((report, idx) =>
      limit(async () => {
        const fileBuffer = req.files[idx].buffer;
        const cacheKey = `pdf_buf_${crypto.createHash('md5').update(fileBuffer).digest('hex')}`;
        let result = getCached(cacheKey);
        let pdfMeta = null;

        if (!result) {
          try {
            // Extract both analysis AND metadata from the PDF buffer
            [result, pdfMeta] = await Promise.all([
              analyzePDFBuffer(fileBuffer),
              extractMetaFromPDF(fileBuffer)
            ]);
            setCache(cacheKey, result);
            setCache(`meta_buf_${cacheKey}`, pdfMeta);
          } catch (err) {
            await FacultyReport.findByIdAndUpdate(report._id, { status: 'error', errorMessage: err.message });
            return;
          }
        } else {
          pdfMeta = getCached(`meta_buf_${cacheKey}`) || {};
        }

        await FacultyReport.findByIdAndUpdate(report._id, {
          ...result,
          facultyName: pdfMeta.facultyName || report.facultyName || '',
          subjectCode: pdfMeta.subjectCode || report.subjectCode || '',
          programme: pdfMeta.programme || report.programme || '',
          semester: pdfMeta.semester || report.semester || '',
          ffiScore: result.ffiScore ?? pdfMeta.ffiScore ?? null,
          status: 'processed'
        });
      })
    );

    Promise.all(processTasks).catch(console.error);

    res.json({
      message: `Processing ${reports.length} PDF(s) in background`,
      reportIds: reports.map(r => r._id),
      total: reports.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
