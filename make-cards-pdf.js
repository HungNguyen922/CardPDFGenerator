const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');

const INPUT_DIR = './cards';

// PDF page size: Letter (8.5 x 11 inches)
const pageW = 8.5 * 72;
const pageH = 11 * 72;

const cols = 3;
const rows = 3;

// Card size: 2.5 x 3.5 inches
const CARD_W = 2.5 * 72;
const CARD_H = 3.5 * 72;

const marginX = 0;
const marginY = 0;

// Center grid
const totalGridW = cols * CARD_W + (cols - 1) * marginX;
const totalGridH = rows * CARD_H + (rows - 1) * marginY;

const startX = (pageW - totalGridW) / 2;
const startY = (pageH - totalGridH) / 2;

async function generatePDF(batchFiles, batchIndex) {
  const doc = new jsPDF({
    unit: 'pt',
    format: [pageW, pageH]
  });

  for (let idx = 0; idx < batchFiles.length; idx++) {
    const file = batchFiles[idx];
    const filePath = path.join(INPUT_DIR, file);

    const imageData = fs.readFileSync(filePath).toString('base64');
    const ext = path.extname(file).toLowerCase();

    let format = 'PNG';
    if (ext === '.jpg' || ext === '.jpeg') {
      format = 'JPEG';
    }

    const dataUrl = `data:image/${format.toLowerCase()};base64,${imageData}`;
    const props = doc.getImageProperties(dataUrl);

    const col = idx % cols;
    const row = Math.floor(idx / cols);

    const x0 = startX + col * (CARD_W + marginX);
    const y0 = startY + row * (CARD_H + marginY);

    const scaleX = CARD_W / props.width;
    const scaleY = CARD_H / props.height;
    const scale = Math.min(scaleX, scaleY);

    const drawW = props.width * scale;
    const drawH = props.height * scale;

    const offsetX = x0 + (CARD_W - drawW) / 2;
    const offsetY = y0 + (CARD_H - drawH) / 2;

    doc.addImage(dataUrl, format, offsetX, offsetY, drawW, drawH);

    console.log(`Added: ${file}`);
  }

  const outputName = `cards_sheet_${batchIndex + 1}.pdf`;
  doc.save(outputName);
  console.log(`Saved PDF: ${outputName}`);
}

async function main() {
  const allFiles = fs.readdirSync(INPUT_DIR)
    .filter(file => /\.(png|jpg|jpeg)$/i.test(file));

  if (allFiles.length === 0) {
    console.log('No images found in ./cards');
    return;
  }

  const batchSize = cols * rows; // 9
  const totalBatches = Math.ceil(allFiles.length / batchSize);

  for (let i = 0; i < totalBatches; i++) {
    const batchFiles = allFiles.slice(i * batchSize, (i + 1) * batchSize);
    await generatePDF(batchFiles, i);
  }

  console.log('All PDFs generated.');
}

main().catch(console.error);
