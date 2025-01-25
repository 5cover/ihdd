import * as XLSX from "xlsx-js-style";
import { requireElementById, pascalize } from "./util";
import { emptyCell, style, sheet_styleRowsAndColumns, textCell } from "./style";
import { EXAMPLE_FILE_URL, attributeTableColumns } from "./const";

const inputFile = requireElementById('input-file') as HTMLInputElement;
const textareaInput = requireElementById('textarea-input') as HTMLTextAreaElement;
const buttonGenerate = requireElementById('button-generate') as HTMLButtonElement;
const pError = requireElementById('p-error') as HTMLParagraphElement;

const inputTextToPascalize = requireElementById('input-text-to-pascalize') as HTMLInputElement;
const inputPascalizedText = requireElementById('input-pascalized-text') as HTMLInputElement;

requireElementById('button-pascalize').addEventListener('click', () => inputPascalizedText.value = pascalize(inputTextToPascalize.value));
requireElementById('button-load-example').addEventListener('click', () => void (async () => {
    const exampleFile = await fetch(EXAMPLE_FILE_URL);
    textareaInput.value = await exampleFile.text();
    buttonGenerate.disabled = false;
})());

window.addEventListener('error', ev => {
    pError.textContent = ev.message;
});

textareaInput.addEventListener('input', () => buttonGenerate.disabled = Boolean(textareaInput.value));

inputFile.addEventListener('input', () => buttonGenerate.disabled = Boolean(inputFile?.files));

async function getDataDictionary(): Promise<unknown> {
    if (textareaInput.value) {
        return JSON.parse(textareaInput.value);
    }
    const f = inputFile.files?.item(0);
    if (f) {
        return JSON.parse(await f.text());
    }
    throwError();
}

buttonGenerate.addEventListener('click', () => {
    const dd = getDataDictionary();
    const wb = XLSX.utils.book_new();

    if (!isObject(dd)) throwError();
    for (const [inSchemaName, schema] of Object.entries(dd)) {
        if (!isObject(schema)) throwError();

        const schemaName = pascalize(inSchemaName);
        for (const [inEntityName, entity] of Object.entries(schema)) {
            if (!isObject(entity) || !('kind' in entity)) throwError();

            const entityName = pascalize(inEntityName);
            const fullName = `${schemaName}.${entityName}`;
            const data = [
                [textCell('Dictionnaire des Données', style.h1)],
                [textCell(fullName, style.h2)],
                [textCell(nameKind(entity.kind), style.kind)],
                attributeTableColumns.map(c => textCell(c.name, style.th)),
                attributeTableColumns.map(c => c.desc ? textCell(c.desc, style.thDesc) : emptyCell(style.thDesc)),
            ];
            const ws = XLSX.utils.aoa_to_sheet(data, { WTF: true });
            ws['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
            ];
            sheet_styleRowsAndColumns(ws);
            XLSX.utils.book_append_sheet(wb, ws, fullName);
        }
    }

    XLSX.writeFile(wb, 'data dictionary.xlsx');
});

function nameKind(kind: unknown) {
    if (!isObject(kind)) throwError();
    const [k, v] = Object.entries(kind)[0] as [string, unknown] ?? throwError();
    if (!isObject(v)) throwError();
    switch (k) {
        case 'association': {
            const left = 'left' in v && isIdentifier(v.left) ? v.left : throwError();
            const right = 'right' in v && isIdentifier(v.right) ? v.right : throwError();
            return `Classe d'association entre ${left} et ${right}`;
        } case 'class':
            return 'Classe'
                + ('abstract' in v && v.abstract ? ' abstraite' : '')
                + ('inherits' in v ? isString(v.inherits) ? ' enfant de ' + v.inherits : throwError() : '');
        default:
            throwError();
    }
}

function throwError(): never {
    throw new Error(`invalid data dictionary: see schema for details`);
}

function isObject(x: unknown): x is object {
    return x !== null && typeof x === 'object';
}

const isIdentifier = isString;

function isString(x: unknown): x is string {
    return typeof x === 'string';
}
