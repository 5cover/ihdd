import { pascalize } from "./util";

export default class QualifiedName {
    readonly schemaName: string;
    readonly relationName: string;

    constructor(schemaName: string, relationName: string) {
        this.schemaName = schemaName;
        this.relationName = relationName;
    }

    static parse(qualifiedName: string, fallbackSchemaName?: string) {
        const [s1, s2] = qualifiedName.split('.', 2);
        const schema = s2 === undefined ? fallbackSchemaName : s1;
        const relation = s2 ?? s1;
        if (schema === undefined || relation === undefined) {
            throw new SyntaxError(`Invalid qualified name: ${qualifiedName}`);
        }
        return new QualifiedName(schema, relation);
    }

    format() {
        return `${pascalize(this.schemaName)}.${pascalize(this.relationName)}`;
    }

    equals(other: this) {
        return this.relationName === other.relationName && this.schemaName === other.schemaName;
    }

    compareTo(other: this) {
        return this.schemaName.localeCompare(other.schemaName)
            || this.relationName.localeCompare(other.relationName);
    }
}
