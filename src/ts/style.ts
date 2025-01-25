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
    h2: { font: { name: fontName, sz: fontSize + 2, bold: true } },
    kind: { font: { name: fontName, sz: fontSize + 2 } },
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
} satisfies Record<string, Style>;
const styleRegular = { font: { name: fontName, sz: fontSize } };

export function textCell(value: string, style?: object): XLSX.CellObject {
    return { v: value, t: 's', s: style ?? styleRegular };
}

export function emptyCell(style?: object): XLSX.CellObject {
    return { 't': 's', s: style ?? styleRegular };
}

export function sheet_styleRowsAndColumns(ws: XLSX.WorkSheet) {
    const ref = decodeRef(ws);
    if (ref === null) return;

    const pos = { r: 0, c: 0 };

    ws['!rows'] = [];
    for (pos.r = ref.s.r; pos.r < ref.e.r; ++pos.r) {
        let maxFontSize = styleRegular.font.sz;
        let maxLineCount = 1;
        let rowContainsWrapTextCell = false;

        for (pos.c = ref.s.c; pos.c <= ref.e.c; ++pos.c) {
            // cell must not be part of > 1 row merge
            const merge = sheet_getContainingMerge(ws, pos);
            if (merge !== null && merge.s.r <= merge.e.r) continue;

            const cell = ws[XLSX.utils.encode_cell(pos)] as XLSX.CellObject | undefined;
            const style = cell?.s as Style | undefined;

            if (style?.alignment?.wrapText) {
                rowContainsWrapTextCell = true;
                break;
            }

            const sz = style?.font.sz;
            if (sz !== undefined && maxFontSize < sz) maxFontSize = sz;

            const nlines = lineCount(cell?.v?.toString() ?? '');
            if (maxLineCount < nlines) maxLineCount = nlines;
        }
        // Do not hardcode a width for rows containing wrapText cells.
        ws['!rows'].push({ hpt: rowContainsWrapTextCell ? undefined : maxLineCount * maxFontSize * lineHeight });
    }

    ws['!cols'] = [];
    for (pos.c = ref.s.c; pos.c <= ref.e.c; ++pos.c) {
        let maxWidthMDW = 0;
        for (pos.r = ref.s.r; pos.r <= ref.e.r; ++pos.r) {
            // cell must not be part of > 1 column merge
            const merge = sheet_getContainingMerge(ws, pos);
            if (merge !== null && merge.s.c < merge.e.c) continue;

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

function sheet_getContainingMerge(ws: XLSX.WorkSheet, pos: XLSX.CellAddress) {
    for (const merge of ws['!merges'] ?? []) {
        if (merge.s.c <= pos.c && pos.c <= merge.e.c
            && merge.s.r <= pos.r && pos.r <= merge.e.r) {
            return merge;
        }
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
