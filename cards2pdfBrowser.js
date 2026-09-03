export function generateCardPDFs(images) {
  const { jsPDF } = window.jspdf;

  const cols = 3;
  const rows = 3;
  const batchSize = cols * rows;

  const pageW = 8.5 * 72;
  const pageH = 11 * 72;

  const CARD_W = 2.5 * 72;
  const CARD_H = 3.5 * 72;

  const marginX = 0;
  const marginY = 0;

  const totalGridW = cols * CARD_W + (cols - 1) * marginX;
  const totalGridH = rows * CARD_H + (rows - 1) * marginY;

  const startX = (pageW - totalGridW) / 2;
  const startY = (pageH - totalGridH) / 2;

  const totalBatches = Math.ceil(images.length / batchSize);

  for (let b = 0; b < totalBatches; b++) {
    const batch = images.slice(b * batchSize, (b + 1) * batchSize);

    const doc = new jsPDF({
      unit: "pt",
      format: [pageW, pageH]
    });

    batch.forEach((img, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const x0 = startX + col * (CARD_W + marginX);
      const y0 = startY + row * (CARD_H + marginY);

      const tempImg = new Image();
      tempImg.src = img.dataUrl;

      tempImg.onload = () => {
        const scaleX = CARD_W / tempImg.width;
        const scaleY = CARD_H / tempImg.height;
        const scale = Math.min(scaleX, scaleY);

        const drawW = tempImg.width * scale;
        const drawH = tempImg.height * scale;

        const offsetX = x0 + (CARD_W - drawW) / 2;
        const offsetY = y0 + (CARD_H - drawH) / 2;

        doc.addImage(img.dataUrl, "PNG", offsetX, offsetY, drawW, drawH);

        if (idx === batch.length - 1) {
          doc.save(`cards_sheet_${b + 1}.pdf`);
        }
      };
    });
  }
}
