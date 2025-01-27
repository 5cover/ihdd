export default class QualifiedName {
    schemaName: string;
    relationName: string;

    constructor(schemaName: string, relationName: string) {
        this.schemaName = schemaName;
        this.relationName = relationName;
    }

    static parse(qualifiedName: string, fallbackSchemaName: string) {
        const s = qualifiedName.split('.', 2), nameOrSchema = s[0], name = s[1];
        if (nameOrSchema === undefined) throw new SyntaxError(`Invalid qualified name: ${qualifiedName}`);
        return new QualifiedName(
            name === undefined ? fallbackSchemaName : nameOrSchema,
            name ?? nameOrSchema,
        );
    }

    format() {
        return `${this.schemaName}.${this.relationName}`;
    }
}
