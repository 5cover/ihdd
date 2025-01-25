import * as XLSX from "xlsx-js-style";
import { requireElementById, pascalize } from "./util";
import { stubCell, style, textCell } from "./style";

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

interface Column {
    name: string,
    desc?: string,
};

const attributeTableColumns: Column[] = [
    { name: 'Nom' },
    { name: 'Description' },
    { name: 'Type' },
    { name: 'Nature', desc: 'Elémentaire ou déduite/calculée' },
    { name: 'Domaine' },
    { name: 'Valeur défaut', desc: 'Liste des valeurs ou intervalle' },
    { name: 'Obligatoire' },
    { name: 'Contraintes/règles de calcul', desc: 'Exemples : {dateExp > dateCom}/prixTTC = prixHT * TVA' },
    { name: 'Remarques' },
];

buttonGenerate.addEventListener('click', () => {
    const wb = XLSX.utils.book_new();

    if (!isObject(dataDictionary)) throwError();

    for (const [inSchemaName, schema] of Object.entries(dataDictionary)) {
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
                attributeTableColumns.map(c => c.desc ? textCell(c.desc, style.thDesc) : stubCell),
            ];
            const ws = XLSX.utils.aoa_to_sheet(data, { WTF: true });
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
    throw new Error(pInputError.textContent = `invalid data dictionary: see schema for details`);
}

function isObject(x: unknown): x is object {
    return x !== null && typeof x === 'object';
}

const isIdentifier = isString;

function isString(x: unknown): x is string {
    return typeof x === 'string';
}
