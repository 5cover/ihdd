import * as XLSX from 'xlsx-js-style';

const fontName = 'Calibri';
const fontSize = 11;
const lineHeight = 1.414;

const styleRegular = { font: { name: fontName, sz: fontSize } };

const cellBorder = { style: 'medium' };
const cellRect = { top: cellBorder, left: cellBorder, right: cellBorder, bottom: cellBorder };
const cellRectThickBottom = { top: cellBorder, left: cellBorder, right: cellBorder, bottom: { style: 'thick' } };

export interface Style {
    font: {
        name: string,
        sz: number,
        bold?: boolean,
        italic?: boolean,
        color?: string;
    },
    fill?: object,
    border?: object,
    alignment?: object,
};

export const style = {
    h1: { font: { name: fontName, sz: fontSize + 5, bold: true } },
    h2: { font: { name: fontName, sz: fontSize + 2, bold: true } },
    kind: { font: { name: fontName, sz: fontSize + 2 } },
    h3: { font: { name: fontName, sz: fontSize, bold: true } },
    th: { font: { name: fontName, sz: fontSize, color: 'white' }, fill: { bgColor: { rgb: '2f5597' } }, border: cellRect },
    thDesc: { font: { name: fontName, sz: fontSize, italic: true }, fill: { bgColor: { rgb: 'b4c7e7' } }, border: cellRectThickBottom, alignment: { wrapText: true } },
} satisfies Record<string, Style>;

export function textCell(value: string, style?: object): XLSX.CellObject {
    return { v: value, t: 's', s: style ?? styleRegular };
}

export const stubCell: XLSX.CellObject = { 't': 'z', };

export function styleRows(ws: XLSX.WorkSheet) {
    const ref = decodeRef(ws);
    if (ref === null) return;
    ws['!rows'] = [];
    for (let r = ref.s.r; r < ref.e.r; ++r) {
        let maxFontSize = styleRegular.font.sz;
        for (let c = ref.s.c; c < ref.e.c; ++r) {
            const sz = ((ws[XLSX.utils.encode_cell({ r: r, c: c })] as XLSX.CellObject | undefined)?.s as Style | undefined)?.font.sz;
            if (sz !== undefined && sz > maxFontSize) maxFontSize = sz;
        }
        ws['!rows'].push({ hpt: maxFontSize * lineHeight });
    }
}


function decodeRef(ws: XLSX.WorkSheet) {
    // Utility functions and functions that handle sheets should test for the presence of the !ref field. If the !ref is omitted or is not a valid range, functions should treat the sheet as empty.
    const r = XLSX.utils.decode_range(ws['!ref'] ?? '');
    return r.e.c == -1 || r.e.r == -1 || r.s.c == -1 || r.s.r == -1 ? null : r;
}
