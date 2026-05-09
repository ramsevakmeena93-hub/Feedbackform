// Check page dimensions of the CSV PDF to calibrate signature position
const { PDFDocument } = require('pdf-lib');
const axios = require('axios');

async function check() {
  const url = 'https://drive.google.com/uc?export=download&id=12foW0dOpr5WJGDGMVFBm13ffalmm0w-P';
  console.log('Downloading CSV PDF...');
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 10 });
  const buf = Buffer.from(res.data);
  console.log('Response size:', buf.length, 'bytes');
  console.log('Is PDF:', buf.subarray(0,4).toString() === '%PDF');
  
  if (buf.subarray(0,4).toString() !== '%PDF') {
    console.log('NOT A PDF - first 200 chars:', buf.toString('utf8', 0, 200));
    return;
  }
  
  const doc = await PDFDocument.load(res.data);
  const pages = doc.getPages();
  console.log('Total pages:', pages.length);
  pages.forEach((p, i) => {
    const { width, height } = p.getSize();
    console.log(`Page ${i+1}: ${width.toFixed(0)} x ${height.toFixed(0)} pts`);
  });
  
  // Check last page - where signature row should be
  const last = pages[pages.length - 1];
  const { width: lW, height: lH } = last.getSize();
  console.log('\nLast page size:', lW.toFixed(0), 'x', lH.toFixed(0));
  console.log('Signature row should be at bottom ~8-55pt from bottom');
  console.log('Col1 end (45%):', Math.floor(lW * 0.45).toFixed(0));
  console.log('Col2 end (72%):', Math.floor(lW * 0.72).toFixed(0));
}

check().catch(e => console.error('Error:', e.message));
