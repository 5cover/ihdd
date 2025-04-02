import * as XLSX from "xlsx-js-style";
import { requireElementById, pascalize } from "./util";
import { emptyCell, style, sheet_styleRowsAndColumns, textCell, sheetLinkCell } from "./style";
import { EXAMPLE_FILE_URL, attributeTableColumns, referencesTableColumns } from "./const";
import QualifiedName from "./QualifiedName";
import { Domain, Kind, Trait } from "./types";
import QualifiedReferenceKey from "./QualifiedReferenceKey";
import { DataDictionary } from "./DataDictionary";

// Element retrievals
// If an element is only used once, it is acceptable not to put in a constant if it is retrieved immediately (so we get an error immediately if the id is not found)

// todo: composed pk
// todo: prefefiend domains
// todo: auto add references for associations
// todo: check validity of entity names in in associations>left/right, inherits, references>to

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
        const dd = await getDataDictionary();

        const wb = XLSX.utils.book_new();

        for (const [schemaName, schema] of Object.entries(dd.schemas)) {
            for (const [relationName, relation] of Object.entries(schema).sort(([a,], [b,]) => a.localeCompare(b))) {
                const qualName = new QualifiedName(schemaName, relationName);

                const kind = decodeKind(relation.kind) ?? throwError('could not decode kind in ' + qualName.format());

                const data = [
                    [textCell('Dictionnaire des Données', style.h1)],
                    [textCell(qualName.format(), kind.abstract ? style.fullNameAbstract : style.fullName,
                    )],
                    [textCell(kind.name, style.kind), ...(kind.inherits ? [
                        textCell('Hérite de', style.kindRight),
                        sheetLinkCell(dd.parseQualifiedName(kind.inherits, schemaName).format(), style.kind)] : [])],
                    attributeTableColumns.map(c => textCell(c.name, style.th)),
                    attributeTableColumns.map(c => c.desc ? textCell(c.desc, style.thDesc) : emptyCell(style.thDesc)),
                    ...Object.entries(relation.attrs)
                        .sort(([, attrA], [, attrB]) => {
                            const isA = attrA.is ?? [];
                            const isB = attrB.is ?? [];
                            return +isRequired(isB) - +isRequired(isA);
                        })
                        .map(([attrName, attr]) => {
                            const is = attr.is ?? [];
                            const computedBy = isComputed(is);
                            const constraints = attr.constraints?.join('\n') ?? '';
                            const remarks = attr.remarks === undefined ? [] : [attr.remarks];
                            if (is.includes('pk')) remarks.push('Clé primaire');
                            if (is.includes('unique')) remarks.push('Unqiue');
                            return [
                                textCell(attrName, style.td),
                                textCell(attr.description ?? '', style.td),
                                textCell(attr.type ?? throwError(), style.td),
                                textCell(computedBy ? 'Déduite/calculée' : 'Élémentaire', style.td),
                                textCell(decodeDomain(attr.domain ?? ''), style.td),
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


                if (relation.description) {
                    data.push(
                        [],
                        [textCell('Description', style.h3)],
                        [textCell(relation.description, style.description)],
                    );
                    merges.push(
                        { s: { r: data.length - 1, c: 0 }, e: { r: data.length - 1, c: 8 } }
                    );
                }

                const refs = dd.getReferences(relation, schemaName);
                // add opposite references (all relations that reference this one)
                for (const [schemaName2, schema2] of Object.entries(dd.schemas)) {
                    for (const [relationName2, relation2] of Object.entries(schema2)) {
                        for (const ref2Key of dd.getReferences(relation2, schemaName2).keys()) {
                            if (ref2Key.to.equals(qualName)) {
                                const key = new QualifiedReferenceKey(new QualifiedName(schemaName2, relationName2), ref2Key.name);
                                if (!refs.has(key)) refs.set(key, {});
                            }
                        }
                    }
                }

                if (refs.size > 0) {
                    data.push(
                        [],
                        [textCell('Navigation', style.h3)],
                        referencesTableColumns.map(c => textCell(c.name, style.th)),
                        referencesTableColumns.map(c => c.desc ? textCell(c.desc, style.thDesc) : emptyCell(style.thDesc)),
                        ...Array.from(refs.entries())
                            .sort((a, b) => a[0].compareTo(b[0]))
                            .map(([key, ref]) => [
                                sheetLinkCell(key.to.format(), style.td),
                                textCell(ref.description ?? '', style.td),
                                textCell(key.name ?? '', style.td), // todo: have some way to signal that this is a link
                                textCell(ref.qualifier ?? '', style.td),
                            ]),
                    );
                }

                const ws = XLSX.utils.aoa_to_sheet(data, { WTF: true });
                ws['!merges'] = merges;
                sheet_styleRowsAndColumns(ws);
                XLSX.utils.book_append_sheet(wb, ws, qualName.format());
            }
        }
        XLSX.writeFile(wb, 'data dictionary.xlsx');
    } catch (e) {
        if (e instanceof Error) setError(e.message);
        throw e;
    } finally {
        buttonGenerate.disabled = false;
    }
})());

requireElementById('button-pascalize').addEventListener('click', () => inputPascalizedText.value = pascalize(inputTextToPascalize.value));

async function getDataDictionary(): Promise<DataDictionary> {
    let dds;
    if (textareaInput.value) {
        dds = textareaInput.value;
    }
    else {
        const f = inputFile.files?.item(0);
        if (f) dds = await f.text();
        else throwError('no data');
    }

    return new DataDictionary(JSON.parse(dds));
}

// "Update" function

function updateButtonGenerateDisabled() {
    buttonGenerate.disabled = !textareaInput.value && !inputFile.value;
}

// Utility functions

function decodeKind(kind: Kind): {
    abstract: boolean,
    name: string,
    inherits?: string;
} | undefined {
    if (kind.association !== undefined) {
        return {
            abstract: false,
            name: `Classe d'association entre ${kind.association.left} et ${kind.association.right}`
        };
    } else if (kind.class !== undefined) {
        const abstract = kind.class.abstract ?? false;
        return {
            abstract,
            name: 'Classe' + (abstract ? ' abstraite' : ''),
            inherits: kind.class.inherits,
        };
    }

    return undefined;
}

function decodeDomain(domain: Domain) {
    if (typeof domain === 'string') return domain;
    const inf = '\u221E';
    const minIncl = domain.min !== undefined && domain.min_incl ? '[' : ']',
        min = domain.min ?? inf,
        max = domain.max ?? inf,
        maxIncl = domain.max !== undefined && domain.max_incl ? ']' : '[';
    return minIncl + min + ';' + max + maxIncl;
}

function isRequired(is: Trait[]) {
    return is.includes('required') || is.includes('pk');
}

function isComputed(is: Trait[]): string | undefined {
    for (const trait of is) {
        if (typeof trait === 'object' && 'computed' in trait) return trait.computed;
    }
    return undefined;
}

function isDefaultValue(is: Trait[]): string | undefined {
    for (const trait of is) {
        if (typeof trait === 'object' && 'default' in trait) return trait.default;
    }
    return undefined;
}

function throwError(msg?: string): never {
    throw new Error(msg);
}

function setError(msg?: string) {
    pError.textContent = 'invalid data dictionary: ' + (msg ?? 'match input against JSON schema for details');
}