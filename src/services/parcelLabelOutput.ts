import qrcode from 'qrcode-generator';
import { ParcelLabelContent } from '../utils/parcelLabel.ts';

// One raster at 300 dpi feeds the preview, the print and the PDF, so all three always match.
const LABEL_WIDTH = 1200;
const LABEL_HEIGHT = 1800;
const PAGE_WIDTH_PT = 288; // 4 in
const PAGE_HEIGHT_PT = 432; // 6 in

const LEFT = 60;
const RIGHT = LABEL_WIDTH - 60;
const CONTENT_WIDTH = RIGHT - LEFT;
const BLACK = '#000000';
const WHITE = '#ffffff';

const font = (size: number, weight = 700) => `${weight} ${size}px "Plus Jakarta Sans", Arial, sans-serif`;

const writeText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  style: string,
  align: CanvasTextAlign = 'left'
) => {
  ctx.font = style;
  ctx.textAlign = align;
  ctx.fillText(text, x, y);
};

// Shrinks a single line until it fits, for names and references that must stay on one line
const fitFont = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, size: number, minSize: number) => {
  let current = size;
  ctx.font = font(current);
  while (current > minSize && ctx.measureText(text).width > maxWidth) {
    current -= 2;
    ctx.font = font(current);
  }
  return font(current);
};

const truncate = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number) => {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end).trimEnd()}…`).width > maxWidth) end -= 1;
  return `${text.slice(0, end).trimEnd()}…`;
};

// Fits one line by shrinking it, then shortening it, so nothing can cross the label border
const writeFitted = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  size: number,
  minSize: number,
  align: CanvasTextAlign = 'left'
) => {
  const style = fitFont(ctx, text, maxWidth, size, minSize);
  writeText(ctx, truncate(ctx, text, maxWidth), x, y, style, align);
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) => {
  const lines: string[] = [];
  let line = '';

  for (const word of text.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);

  if (lines.length <= maxLines) return lines.map((entry) => truncate(ctx, entry, maxWidth));
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = truncate(ctx, `${kept[maxLines - 1]} ${lines[maxLines]}`, maxWidth);
  return kept;
};

const drawDivider = (ctx: CanvasRenderingContext2D, y: number, thickness = 4) => {
  ctx.fillStyle = BLACK;
  ctx.fillRect(LEFT, y, CONTENT_WIDTH, thickness);
};

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Could not load ${src}`));
    image.src = src;
  });

// Thermal printers have no gold, so the logo is reduced to solid black with its white S
const drawLogo = async (ctx: CanvasRenderingContext2D, x: number, y: number, height: number) => {
  const image = await loadImage('/logo.png');
  const width = Math.round((image.naturalWidth / image.naturalHeight) * height);

  const scratch = document.createElement('canvas');
  scratch.width = width;
  scratch.height = height;
  const scratchCtx = scratch.getContext('2d', { willReadFrequently: true });
  if (!scratchCtx) return 0;

  scratchCtx.drawImage(image, 0, 0, width, height);
  const pixels = scratchCtx.getImageData(0, 0, width, height);
  for (let i = 0; i < pixels.data.length; i += 4) {
    const isShape = pixels.data[i + 3] > 110;
    const tone = isShape && pixels.data[i + 2] < 170 ? 0 : 255;
    pixels.data[i] = pixels.data[i + 1] = pixels.data[i + 2] = tone;
    pixels.data[i + 3] = isShape ? 255 : 0;
  }
  scratchCtx.putImageData(pixels, 0, 0);
  ctx.drawImage(scratch, x, y);
  return width;
};

// Modules are whole pixels with the standard four-module quiet zone, so edges stay sharp
const drawQrCode = (ctx: CanvasRenderingContext2D, value: string, x: number, y: number, size: number) => {
  const qr = qrcode(0, 'M');
  qr.addData(value);
  qr.make();

  const modules = qr.getModuleCount();
  const scale = Math.floor(size / (modules + 8));
  const drawn = scale * (modules + 8);
  const offsetX = x + Math.floor((size - drawn) / 2) + scale * 4;
  const offsetY = y + Math.floor((size - drawn) / 2) + scale * 4;

  ctx.fillStyle = BLACK;
  for (let row = 0; row < modules; row += 1) {
    for (let column = 0; column < modules; column += 1) {
      if (qr.isDark(row, column)) ctx.fillRect(offsetX + column * scale, offsetY + row * scale, scale, scale);
    }
  }
};

const drawField = (ctx: CanvasRenderingContext2D, title: string, value: string, x: number, y: number, width: number) => {
  if (!value) return;
  writeText(ctx, title, x, y, font(26, 600));
  writeFitted(ctx, value, x, y + 38, width, 40, 26);
};

// A courier needs the whole address, so the text shrinks to fit before anything is cut
const drawAddress = (ctx: CanvasRenderingContext2D, lines: string[], top: number, bottom: number) => {
  const sizes = [42, 38, 34, 30, 28];

  for (const size of sizes) {
    const lineHeight = Math.round(size * 1.3);
    const maxLines = Math.floor((bottom - top) / lineHeight);
    ctx.font = font(size, 600);
    const wrapped = lines.flatMap((line) => wrapText(ctx, line, CONTENT_WIDTH, maxLines));
    const isLastSize = size === sizes[sizes.length - 1];
    if (wrapped.length > maxLines && !isLastSize) continue;

    wrapped.slice(0, maxLines).forEach((line, index) => {
      writeText(ctx, line, LEFT, top + index * lineHeight, font(size, 600));
    });
    return;
  }
};

export const renderParcelLabel = async (content: ParcelLabelContent) => {
  await Promise.allSettled([document.fonts.load(font(40, 700)), document.fonts.load(font(26, 600))]);

  const canvas = document.createElement('canvas');
  canvas.width = LABEL_WIDTH;
  canvas.height = LABEL_HEIGHT;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not available');

  ctx.fillStyle = WHITE;
  ctx.fillRect(0, 0, LABEL_WIDTH, LABEL_HEIGHT);
  ctx.textBaseline = 'top';

  ctx.fillStyle = BLACK;
  ctx.fillRect(30, 30, LABEL_WIDTH - 60, 6);
  ctx.fillRect(30, LABEL_HEIGHT - 36, LABEL_WIDTH - 60, 6);
  ctx.fillRect(30, 30, 6, LABEL_HEIGHT - 60);
  ctx.fillRect(LABEL_WIDTH - 36, 30, 6, LABEL_HEIGHT - 60);

  // Header
  const logoWidth = await drawLogo(ctx, LEFT, 58, 124).catch(() => 0);
  ctx.fillStyle = BLACK;
  const brandX = LEFT + (logoWidth ? logoWidth + 26 : 0);
  writeFitted(ctx, content.storeName.toUpperCase(), brandX, 88, RIGHT - 300 - brandX, 68, 36);
  writeText(ctx, 'PARCEL LABEL', RIGHT, 72, font(34), 'right');
  if (content.orderNumber) writeFitted(ctx, content.orderNumber, RIGHT, 122, 280, 32, 22, 'right');
  drawDivider(ctx, 200, 6);

  // Recipient
  writeText(ctx, 'SHIP TO', LEFT, 226, font(28, 600));
  let y = 268;
  if (content.recipientName) {
    const nameStyle = fitFont(ctx, content.recipientName, CONTENT_WIDTH, 66, 46);
    ctx.font = nameStyle;
    const nameLines = wrapText(ctx, content.recipientName, CONTENT_WIDTH, 2);
    const lineHeight = nameLines.length > 1 ? 58 : 84;
    nameLines.forEach((line) => {
      writeText(ctx, line, LEFT, y, nameStyle);
      y += lineHeight;
    });
    if (nameLines.length > 1) y += 8;
  }
  if (content.recipientPhone) {
    writeFitted(ctx, content.recipientPhone, LEFT, y, CONTENT_WIDTH, 46, 32);
    y += 66;
  }
  drawAddress(ctx, content.addressLines, y, 706);
  drawDivider(ctx, 716);

  // Order details
  const columnWidth = (CONTENT_WIDTH - 40) / 2;
  const secondColumn = LEFT + columnWidth + 40;
  drawField(ctx, 'ORDER ID', content.orderNumber, LEFT, 738, columnWidth);
  drawField(ctx, 'ORDER DATE', content.orderDate, secondColumn, 738, columnWidth);
  drawField(ctx, 'PAYMENT', content.paymentMethod, LEFT, 838, columnWidth);
  drawField(ctx, 'QUANTITY', `${content.totalQuantity} ${content.totalQuantity === 1 ? 'item' : 'items'}`, secondColumn, 838, columnWidth);
  drawDivider(ctx, 938);

  // Contents
  writeText(ctx, 'CONTENTS', LEFT, 958, font(26, 600));
  const shown = content.items.length > 3 ? content.items.slice(0, 2) : content.items;
  ctx.font = font(32, 600);
  shown.forEach((item, index) => {
    const line = truncate(ctx, `${item.quantity} × ${item.name}`, CONTENT_WIDTH);
    writeText(ctx, line, LEFT, 998 + index * 46, font(32, 600));
  });
  const hidden = content.items.length - shown.length;
  if (hidden > 0) {
    writeText(ctx, `+ ${hidden} more ${hidden === 1 ? 'product' : 'products'}`, LEFT, 998 + shown.length * 46, font(32, 600));
  }
  drawDivider(ctx, 1150);

  // QR code and payment
  const qrSize = 450;
  drawQrCode(ctx, content.qrValue, LEFT - 16, 1172, qrSize);

  const boxX = LEFT + qrSize + 10;
  const boxWidth = RIGHT - boxX;
  ctx.fillStyle = BLACK;
  ctx.fillRect(boxX, 1186, boxWidth, 206);
  ctx.fillStyle = WHITE;
  writeFitted(ctx, content.collectionTitle, boxX + boxWidth / 2, 1216, boxWidth - 40, 48, 30, 'center');
  writeFitted(ctx, content.collectionDetail, boxX + boxWidth / 2, 1296, boxWidth - 40, 44, 28, 'center');

  ctx.fillStyle = BLACK;
  writeText(ctx, content.totalLabel, boxX, 1420, font(28, 600));
  writeFitted(ctx, content.total, boxX, 1458, boxWidth, 64, 36);
  writeText(ctx, 'PARCEL REF', boxX, 1544, font(26, 600));
  writeFitted(ctx, content.parcelId, boxX, 1580, boxWidth, 44, 30);

  drawDivider(ctx, 1648, 3);
  writeText(ctx, 'STEROSE internal parcel reference.', LEFT, 1668, font(28, 600));
  writeText(ctx, 'This is not a courier tracking number.', LEFT, 1708, font(28, 600));

  return canvas;
};

const toGrayscale = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas is not available');
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const gray = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0; i < gray.length; i += 1) gray[i] = data[i * 4];
  return gray;
};

const compress = async (bytes: Uint8Array) => {
  const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
};

// The label is one lossless image on a 4 x 6 in page, so a small hand-built PDF is enough
const buildPdf = (image: Uint8Array, width: number, height: number) => {
  const encoder = new TextEncoder();
  const parts: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;

  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? encoder.encode(part) : part;
    parts.push(bytes);
    length += bytes.length;
  };
  const addObject = (id: number, body: string, stream?: Uint8Array) => {
    offsets[id] = length;
    push(`${id} 0 obj\n${body}\n`);
    if (stream) {
      push('stream\n');
      push(stream);
      push('\nendstream\n');
    }
    push('endobj\n');
  };

  const drawing = encoder.encode(`q ${PAGE_WIDTH_PT} 0 0 ${PAGE_HEIGHT_PT} 0 0 cm /Label Do Q`);

  push('%PDF-1.4\n');
  addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
  addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  addObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH_PT} ${PAGE_HEIGHT_PT}] /Resources << /XObject << /Label 5 0 R >> >> /Contents 4 0 R >>`
  );
  addObject(4, `<< /Length ${drawing.length} >>`, drawing);
  addObject(
    5,
    `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode /Length ${image.length} >>`,
    image
  );

  const xrefStart = length;
  const entries = offsets.slice(1).map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`);
  push(`xref\n0 6\n0000000000 65535 f \n${entries.join('')}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`);

  return new Blob(parts as BlobPart[], { type: 'application/pdf' });
};

export const downloadLabelPdf = async (canvas: HTMLCanvasElement, fileName: string) => {
  const pdf = buildPdf(await compress(toGrayscale(canvas)), canvas.width, canvas.height);
  const url = URL.createObjectURL(pdf);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
};

const getPrintDocument = (imageUrl: string) => `<!doctype html>
<html>
  <head>
    <title>Parcel label</title>
    <style>
      @page { size: 4in 6in; margin: 0; }
      html, body { margin: 0; padding: 0; width: 4in; height: 6in; overflow: hidden; background: #fff; }
      img { display: block; width: 4in; height: 6in; }
    </style>
  </head>
  <body><img src="${imageUrl}" alt="Parcel label" /></body>
</html>`;

// A separate document keeps the admin screen out of the printout, and zero page margins
// remove the browser's own header and footer
export const printLabel = (canvas: HTMLCanvasElement) =>
  new Promise<void>((resolve, reject) => {
    const frame = document.createElement('iframe');
    frame.title = 'Parcel label print layout';
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';

    frame.onload = () => {
      const printWindow = frame.contentWindow;
      if (!printWindow) {
        frame.remove();
        reject(new Error('Print window is not available'));
        return;
      }
      printWindow.addEventListener('afterprint', () => frame.remove(), { once: true });
      setTimeout(() => frame.remove(), 120_000);
      printWindow.focus();
      printWindow.print();
      resolve();
    };

    frame.srcdoc = getPrintDocument(canvas.toDataURL('image/png'));
    document.body.appendChild(frame);
  });
