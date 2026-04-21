/**
 * Extract Google Drive links from a CSV file.
 * - Each row = one PDF link (even if same link appears multiple times)
 * - Hard cap: max 50 links per batch
 * - Skips empty/invalid rows
 */
function parseCSV(buffer) {
  const MAX_BATCH = 50;
  const text = buffer.toString('utf8');
  const links = [];

  // Match any Google Drive file link
  const regex = /https?:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)[^\s,"\n]*/g;
  let match;

  while ((match = regex.exec(text)) !== null && links.length < MAX_BATCH) {
    const url = match[0].trim();
    links.push(url);
  }

  if (links.length === MAX_BATCH) {
    console.warn(`[CSV] Batch capped at ${MAX_BATCH} links`);
  }

  return links.map(url => ({ pdfLink: url }));
}

module.exports = { parseCSV };
