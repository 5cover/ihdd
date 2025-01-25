import { requireElementById, textCell, pascalize } from "./util";
import * as style from "./style";

const inputFile = requireElementById('input-file') as HTMLInputElement;
const pInputError = requireElementById('p-input-error') as HTMLParagraphElement;
const buttonGenerate = requireElementById('button-generate') as HTMLButtonElement;

const inputTextToPascalize = requireElementById('input-text-to-pascalize') as HTMLInputElement;
const inputPascalizedText = requireElementById('input-pascalized-text') as HTMLInputElement;
requireElementById('button-pascalize').addEventListener('click', () => inputPascalizedText.value = pascalize(inputTextToPascalize.value));

let dataDictionary: unknown = null;

inputFile.addEventListener('change', () => void (async () => {
    const f = inputFile.files?.item(0);
    if (!f) return;
    dataDictionary = JSON.parse(await f.text());
    buttonGenerate.disabled = false;
})());

buttonGenerate.addEventListener('click', () => void (async () => {
    const XLSX = await importXLSX();

    const wb = XLSX.utils.book_new();

    if (!validateObject(dataDictionary)) return;
    for (const [inSchemaName, schema] of Object.entries(dataDictionary)) {
        const schemaName = pascalize(inSchemaName);
        if (!validateObject(schema)) return;
        for (const [inEntityName, entity] of Object.entries(schema)) {
            const entityName = pascalize(inEntityName);
            const fullName = `${schemaName}.${entityName}`;
            if (!validateObject(entity)) return;
            const data = [
                [textCell('Dictionnaire des Données', style.h1)],
                [textCell(fullName, style.h2)]];
            const ws = XLSX.utils.aoa_to_sheet(data, { WTF: true });
            XLSX.utils.book_append_sheet(wb, ws, fullName);
        }
    }

    XLSX.writeFile(wb, 'data dictionary.xlsx');
})());

/*buttonMagic.addEventListener("click", () => {
    // STEP 1: Create a new workbook
    const wb = XLSX.utils.book_new();

    // STEP 2: Create data rows and styles
    const row = [
        { v: "Courier: 24", t: "s", s: { font: { name: "Courier", sz: 24 } } },
        { v: "bold & color", t: "s", s: { font: { bold: true, color: { rgb: "FF0000" } } } },
        { v: "fill: color", t: "s", s: { fill: { fgColor: { rgb: "E9E9E9" } } } },
        { v: "line\nbreak", t: "s", s: { alignment: { wrapText: true } } },
    ];

    // STEP 3: Create worksheet with rows; Add worksheet to workbook
    const ws = XLSX.utils.aoa_to_sheet([row]);
    XLSX.utils.book_append_sheet(wb, ws, "Styled Sheet");

    // STEP 4: Write Excel file to browser
    XLSX.writeFile(wb, "StyledExcel.xlsx");
});*/

function setError(msg: string) {
    pInputError.textContent = `invalid data dictionary (${msg})`;
}

function validateObject(x: unknown): x is object {
    if (x === null) {
        setError('expected object, got null');
        return false;
    }
    if (typeof x !== 'object') {
        setError(`expected object, got ${typeof x}`);
        return false;
    }
    return true;
}

type XLSX = typeof import('xlsx-js-style');
let _xlsx: XLSX | null = null;
async function importXLSX(): Promise<XLSX> {
    return (_xlsx ??= await import('xlsx-js-style').then(xlsx => {
        requireElementById('span-sheet-js-version').textContent = xlsx.version;
        return xlsx.default;
    })) as XLSX;
}