import * as XLSX from "xlsx-js-style";
import { requireElementById, pascalize, isIdentifier, isObject, isString, isBool, isArray, isStringOrObject } from "./util";
import { emptyCell, style, sheet_styleRowsAndColumns, textCell, sheetLinkCell } from "./style";
import { EXAMPLE_FILE_URL, attributeTableColumns, referencesTableColumns } from "./const";

// Element retrievals
// If an element is only used once, it is acceptable not to put in a constant if it is retrieved immediately (so we get an error immediately if the id is not found)

// todo: multiple references to the same offer : make it an array
// todo: composed pk
// todo: prefefiend domains

const inputFile = requireElementById('input-file') as HTMLInputElement;
const buttonClearFile = requireElementById('button-clear-file') as HTMLButtonElement;
const buttonLoadExample = requireElementById('button-load-example') as HTMLButtonElement;
const textareaInput = requireElementById('textarea-input') as HTMLTextAreaElement;
const buttonGenerate = requireElementById('button-generate') as HTMLButtonElement;
const pError = requireElementById('p-error') as HTMLParagraphElement;
const inputTextToPascalize = requireElementById('input-text-to-pascalize') as HTMLInputElement;
const inputPascalizedText = requireElementById('input-pascalized-text') as HTMLInputElement;

// Initial state

updateButtonGenerateDisabled();

// Event listeners


window.addEventListener('error', e => {
    pError.textContent ??= e.message;
});

buttonClearFile.addEventListener('click', () => {
    inputFile.value = '';
    inputFile.files = null;
    buttonClearFile.disabled = true;
    updateButtonGenerateDisabled();
});

inputFile.addEventListener('input', () => {
    buttonClearFile.disabled = false;
    updateButtonGenerateDisabled();
});

textareaInput.addEventListener('input', updateButtonGenerateDisabled);

buttonLoadExample.addEventListener('click', () => void (async () => {
    buttonLoadExample.disabled = true;
    try {
        const exampleFile = await fetch(EXAMPLE_FILE_URL);
        textareaInput.value = await exampleFile.text();
        updateButtonGenerateDisabled();
    } finally {
        buttonLoadExample.disabled = false;
    }
})());

buttonGenerate.addEventListener('click', () => void (async () => {
    buttonGenerate.disabled = true;
    try {
        pError.textContent = null;
        let dd: unknown;
        try {
            dd = JSON.parse(await getDataDictionary());
        } catch (e) {
            if (e instanceof Error) throwError(e.message);
            throw e;
        }

        const wb = XLSX.utils.book_new();

        if (!isObject(dd)) throwError();
        for (const [inSchemaName, schema] of Object.entries(dd)) {
            if (!isObject(schema)) throwError();

            const schemaName = pascalize(inSchemaName);
            for (const [inRelationName, relation] of Object.entries(schema).sort(([a,], [b,]) => a.localeCompare(b))) {
                if (!isObject(relation)) throwError();

                const relationName = pascalize(inRelationName);
                const fullName = `${schemaName}.${relationName}`;
                const kind = decodeKind(value(relation, 'kind', isObject) ?? throwError());

                const data = [
                    [textCell('Dictionnaire des Données', style.h1)],
                    [textCell(fullName, kind.abstract ? style.fullName : style.fullNameAbstract)],
                    [textCell(kind.name, style.kind), ...(kind.inherits ? [textCell('Hérite de', style.kindRight), sheetLinkCell(pascalize(kind.inherits), style.kind)] : [])],
                    attributeTableColumns.map(c => textCell(c.name, style.th)),
                    attributeTableColumns.map(c => c.desc ? textCell(c.desc, style.thDesc) : emptyCell(style.thDesc)),
                    ...Object.entries(value(relation, 'attrs', isObject) ?? throwError())
                        .sort(([, attrA], [, attrB]) => {
                            if (!isObject(attrA) || !isObject(attrB)) throwError();
                            const isA = value(attrA, 'is', isArray) ?? [];
                            const isB = value(attrB, 'is', isArray) ?? [];
                            return +isRequired(isB) - +isRequired(isA);
                        })
                        .map(([attrName, attr]) => {
                            if (!isObject(attr)) throwError();
                            const is = value(attr, 'is', isArray) ?? [];
                            const computedBy = isComputed(is);
                            const constraints = value(attr, 'constraints', isArray)?.join('\n') ?? '';
                            const remarks = [value(attr, 'remarks', isString)];
                            if (is.includes('pk')) remarks.push('Clé primaire');
                            if (is.includes('unique')) remarks.push('Unqiue');
                            return [
                                textCell(attrName, style.td),
                                textCell(value(attr, 'description', isString) ?? '', style.td),
                                textCell(value(attr, 'type', isString) ?? throwError(), style.td),
                                textCell(computedBy ? 'Déduite/calculée' : 'Élémentaire', style.td),
                                textCell(decodeDomain(value(attr, 'domain', isStringOrObject) ?? ''), style.td),
                                textCell(isDefaultValue(is) ?? '', style.td),
                                textCell(isRequired(is) ? 'Oui' : 'Non', style.td),
                                textCell(computedBy ? computedBy + '\n' + constraints : constraints, style.td),
                                textCell(remarks.join('\n'), style.td),
                            ];
                        }),
                ];
                const merges: XLSX.Range[] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
                    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
                    { s: { r: 2, c: 2 }, e: { r: 2, c: 8 } },
                ];


                const desc = value(relation, 'description', isString);
                if (desc) {
                    data.push(
                        [],
                        [textCell('Description', style.h3)],
                        [textCell(desc, style.description)],
                    );
                    merges.push(
                        { s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: 8 } }
                    );
                }

                const refs = Object.entries(value(relation, 'references', isObject) ?? {});
                // todo.. union opposite references (all relations that reference this one)
                if (refs.length > 0) {
                    data.push(
                        [],
                        [textCell('Navigation', style.h3)],
                        referencesTableColumns.map(c => textCell(c.name, style.th)),
                        referencesTableColumns.map(c => c.desc ? textCell(c.desc, style.thDesc) : emptyCell(style.thDesc)),
                        ...refs.map(([inRefName, ref]) => {
                            if (!isObject(ref)) throwError();
                            return [
                                sheetLinkCell(pascalize(inRefName), style.td),
                                textCell(value(ref, 'description', isString) ?? '', style.td),
                                textCell(value(ref, 'name', isString) ?? '', style.td), // todo: have some way to signal that this is a link
                                textCell(value(ref, 'qualifier', isString) ?? '', style.td),
                            ];
                        }),
                    );
                }

                const ws = XLSX.utils.aoa_to_sheet(data, { WTF: true });
                ws['!merges'] = merges;
                sheet_styleRowsAndColumns(ws);
                XLSX.utils.book_append_sheet(wb, ws, fullName);
            }
        }
        XLSX.writeFile(wb, 'data dictionary.xlsx');
    } finally {
        buttonGenerate.disabled = false;
    }
})());

requireElementById('button-pascalize').addEventListener('click', () => inputPascalizedText.value = pascalize(inputTextToPascalize.value));

// "Update" function

function updateButtonGenerateDisabled() {
    buttonGenerate.disabled = !textareaInput.value && !inputFile.value;
}

// Utility functions

async function getDataDictionary(): Promise<string> {
    if (textareaInput.value) {
        return textareaInput.value;
    }
    const f = inputFile.files?.item(0);
    if (f) {
        return await f.text();
    }
    throwError('no data');
}

function decodeKind(kind: object): {
    abstract: boolean,
    name: string,
    inherits?: string;
} {
    const [k, v] = Object.entries(kind)[0] as [string, unknown] ?? throwError();
    if (!isObject(v)) throwError();
    switch (k) {
        case 'association': {
            return {
                abstract: false,
                name: `Classe d'association entre ${value(v, 'left', isIdentifier) ?? throwError()} et ${value(v, 'right', isIdentifier) ?? throwError()}`
            };
        } case 'class': {
            const abstract = value(v, 'abstract', isBool) ?? false;
            return {
                abstract,
                name: 'Classe' + (abstract ? ' abstraite' : ''),
                inherits: value(v, 'inherits', isString),
            };
        }
        default:
            throwError();
    }
}

function decodeDomain(domain: string | object) {
    if (typeof domain === 'string') return domain;
    const inf = '\u221E';
    const minIncl = value(domain, 'min_incl', isBool) ? '[' : ']',
        min = value(domain, 'min', isString) ?? inf,
        max = value(domain, 'max', isString) ?? inf,
        maxIncl = value(domain, 'max_incl', isBool) ? ']' : '[';
    return minIncl + min + ';' + max + maxIncl;
}

function isRequired(is: unknown[]) {
    return is.includes('required') || is.includes('pk');
}

function isComputed(is: unknown[]): string | undefined {
    for (const trait of is) {
        if (!isObject(trait)) continue;
        const v = value(trait, 'computed', isString);
        if (v) return v;
    }
    return undefined;
}

function isDefaultValue(is: unknown[]): string | undefined {
    for (const trait of is) {
        if (!isObject(trait)) continue;
        const v = value(trait, 'default', isString);
        if (v) return v;
    }
    return undefined;
}

function value<K extends string, V>(obj: object, key: K, guard: (v: unknown) => v is V): V | undefined {
    if (key in obj) {
        const v = (obj as Record<K, unknown>)[key];
        return guard(v) ? v : throwError();
    }
    return undefined;
}

function throwError(msg?: string): never {
    throw new Error(pError.textContent = 'invalid data dictionary: ' + (msg ?? 'match input against JSON schema for details'));
}

