// Draws a coordinate grid on the CSV PDF so we can see exact positions
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const axios = require('axios');

async function run() {
  const url = 'https://drive.google.com/uc?export=download&id=12foW0dOpr5WJGDGMVFBm13ffalmm0w-P';
  const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 30000, headers: { 'User-Agent': 'Mozilla/5.0' }, maxRedirects: 10 });
  const doc = await PDFDocument.load(res.data);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const red = rgb(1, 0, 0);
  const blue = rgb(0, 0, 1);
  const green = rgb(0, 0.6, 0);

  const pages = doc.getPages();
  const last = pages[pages.length - 1];
  const { width: W, height: H } = last.getSize();
  console.log('Page size:', W, 'x', H);

  // Draw horizontal lines every 10pt from y=0 to y=200, with Y label
  for (let y = 0; y <= 200; y += 10) {
    last.drawLine({ start: { x: 0, y }, end: { x: W, y }, thickness: y % 50 === 0 ? 1 : 0.3, color: y % 50 === 0 ? red : blue });
    last.drawText(String(y), { x: 2, y: y + 1, size: 5, font, color: red });
  }

  // Draw vertical lines every 50pt with X label
  for (let x = 0; x <= W; x += 50) {
    last.drawLine({ start: { x, y: 0 }, end: { x, y: 200 }, thickness: 0.5, color: green });
    last.drawText(String(x), { x: x + 1, y: 195, size: 5, font, color: green });
  }

  require('fs').writeFileSync('./grid-overlay.pdf', Buffer.from(await doc.save()));
  console.log('Saved grid-overlay.pdf — open it and look at the signature row to find exact Y and X coordinates');
}

run().catch(e => console.error(e.message));
