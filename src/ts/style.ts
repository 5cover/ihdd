const fontName = 'Calibri';
const fontSize = 11;

const cellBorder = { style: 'medium' };
const cellRect = { top: cellBorder, left: cellBorder, right: cellBorder, bottom: cellBorder };
const cellRectThickBottom = { top: cellBorder, left: cellBorder, right: cellBorder, bottom: { style: 'thick' } };

export const h1 = { font: { name: fontName, sz: fontSize + 5, bold: true } };
export const h2 = { font: { name: fontName, sz: fontSize + 2, bold: true } };
export const h3 = { font: { name: fontName, sz: fontSize, bold: true } };
export const kind = { font: { name: fontName, sz: fontSize + 2 } };
export const th = { font: { name: fontName, sz: fontSize, color: 'white' }, fill: { bgColor: { rgb: '2f5597' } }, border: cellRect };
export const subTh = { font: { name: fontName, sz: fontSize, italic: true }, fill: { bgColor: { rgb: 'b4c7e7' } }, border: cellRectThickBottom, alignment: { wrapText: true } };
export const regular = { font: { name: fontName, sz: fontSize } };
