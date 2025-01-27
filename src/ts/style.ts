import * as XLSX from 'xlsx-js-style';

const fontName = 'Calibri';
const fontSize = 11;
const lineHeight = 1.414;
const columnWidth = 1.4;

const cellBorder = { style: 'hair' };
const cellRect = { top: cellBorder, left: cellBorder, right: cellBorder, bottom: cellBorder };
const cellRectThickBottom = { top: cellBorder, left: cellBorder, right: cellBorder, bottom: { style: 'medium' } };

export interface Style {
    font: {
        name: string,
        sz: number,
        bold?: boolean,
        italic?: boolean,
        color?: object;
    },
    fill?: object,
    border?: object,
    alignment?: {
        vertical?: 'top' | 'center' | 'bottom',
        horizontal?: 'left' | 'center' | 'right',
        wrapText?: boolean,
        textRotation?: number;
    },
};

export const style = {
    h1: { font: { name: fontName, sz: fontSize + 5, bold: true } },
    fullName: { font: { name: fontName, sz: fontSize + 2, bold: true } },
    fullNameAbstract: { font: { name: fontName, sz: fontSize + 2, bold: true, italic: true } },
    kind: { font: { name: fontName, sz: fontSize + 2 } },
    kindRight: { font: { name: fontName, sz: fontSize + 2 }, alignment: { horizontal: 'right' } },
    h3: { font: { name: fontName, sz: fontSize, bold: true } },
    th: {
        font: { name: fontName, sz: fontSize, bold: true, color: { rgb: 'ffffff' } },
        fill: { fgColor: { rgb: '2f5597' } }, border: cellRect
    },
    thDesc: {
        font: { name: fontName, sz: fontSize, italic: true },
        fill: { fgColor: { rgb: 'b4c7e7' } }, border: cellRectThickBottom,
        alignment: { wrapText: true, vertical: 'top' }
    },
    td: { font: { name: fontName, sz: fontSize }, border: cellRect },
    abstract: { font: { name: fontName, sz: fontSize, italic: true } },
    description: { font: { name: fontName, sz: fontSize }, alignment: { vertical: 'center' } }
} satisfies Record<string, Style>;
const styleRegular = { font: { name: fontName, sz: fontSize } };

export function textCell(value: string, style?: Style): XLSX.CellObject {
    return { v: value, t: 's', s: style ?? styleRegular };
}

export function emptyCell(style?: Style): XLSX.CellObject {
    return { v: '', t: 's', s: style ?? styleRegular };
}

export function sheetLinkCell(sheetName: string, style?: Style): XLSX.CellObject {
    return { v: sheetName, t: 's', s: style ?? styleRegular, l: { Target: '#' + sheetName, Tooltip: `Lien vers la feuille ${sheetName}` } };
}

export function sheet_styleRowsAndColumns(ws: XLSX.WorkSheet) {
    const ref = decodeRef(ws);
    if (ref === null) return;

    const pos = { r: 0, c: 0 };

    ws['!rows'] = [];

    rows: for (pos.r = ref.s.r; pos.r <= ref.e.r; ++pos.r) {
        let maxHeight = styleRegular.font.sz;

        for (pos.c = ref.s.c; pos.c <= ref.e.c; ++pos.c) {
            const merge = sheet_getMerge(ws, pos);
            // cell must not be part of > 1 row merge
            if (merge !== null && merge.s.r < merge.e.r) {
                // skip to end of merge
                pos.r = merge.e.r;
                continue rows;
            }
            const addr = XLSX.utils.encode_cell(pos);
            const cell = ws[addr] as XLSX.CellObject | undefined;
            const style = cell?.s as Style | undefined;

            // Do not consider the height of wrapText cells
            //if (style?.alignment?.wrapText) continue;

            const height = (style ?? styleRegular).font.sz * lineCount(cell?.v?.toString() ?? '');
            if (maxHeight < height) maxHeight = height;
        }
        ws['!rows'].push({ hpt: maxHeight * lineHeight });
    }

    ws['!cols'] = [];
    cols: for (pos.c = ref.s.c; pos.c <= ref.e.c; ++pos.c) {
        let maxWidthMDW = 0;
        for (pos.r = ref.s.r; pos.r <= ref.e.r; ++pos.r) {
            const merge = sheet_getMerge(ws, pos);
            // cell must not be part of > 1 column merge
            if (merge !== null && merge.s.c < merge.e.c) {
                // skip to end of merge
                pos.c = merge.e.c;
                continue cols;
            }

            const cell = ws[XLSX.utils.encode_cell(pos)] as XLSX.CellObject | undefined;
            const style = cell?.s as Style | undefined;

            // Do not consider the width of wrapText cells in the column witdh (that's the whole point of wrapText)
            if (style?.alignment?.wrapText) continue;

            const value = cell?.v?.toString();
            if (!value) continue;
            const width = longestLineLength(value);
            if (width > maxWidthMDW) maxWidthMDW = width;
        }
        ws['!cols'].push({ wch: maxWidthMDW ? maxWidthMDW * columnWidth : undefined });
    }
}

function sheet_getMerge(ws: XLSX.WorkSheet, pos: XLSX.CellAddress) {
    for (const merge of ws['!merges'] ?? []) {
        if (pos === merge.s) return merge;
    }
    return null;
}


function longestLineLength(s: string): number {
    let maxLineLen = 0;
    let lineLen = 0;
    for (let i = 0; i < s.length; ++i) {
        if (s[i] == '\n') {
            if (maxLineLen < lineLen) maxLineLen = lineLen;
            lineLen = 0;
        } else {
            ++lineLen;
        }
    }
    return maxLineLen < lineLen ? lineLen : maxLineLen;
}

function lineCount(s: string): number {
    let lineCount = 1;
    for (let i = 0; i < s.length; lineCount += +('\n' === s[i++]));
    return lineCount;
}

function decodeRef(ws: XLSX.WorkSheet) {
    // Utility functions and functions that handle sheets should test for the presence of the !ref field. If the !ref is omitted or is not a valid range, functions should treat the sheet as empty.
    const r = XLSX.utils.decode_range(ws['!ref'] ?? '');
    return r.e.c == -1 || r.e.r == -1 || r.s.c == -1 || r.s.r == -1 ? null : r;
}
