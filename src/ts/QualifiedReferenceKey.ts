import QualifiedName from "./QualifiedName";

export default class QualifiedReferenceKey {
    readonly to: QualifiedName;
    readonly name?: string;

    constructor(to: QualifiedName, name?: string) {
        this.to = to;
        this.name = name;
    }

    toPrim(): string {
        return `${this.to.schemaName}\0${this.to.relationName}${this.name === undefined ? '' : '\0' + this.name}`;
    }

    static fromPrim(prim: string) {
        const [schemaName, relationName, name] = prim.split('\0', 3);
        if (schemaName === undefined || relationName === undefined) throw new SyntaxError();
        return new this(new QualifiedName(schemaName, relationName), name);
    }

    compareTo(other: this) {
        return this.to.compareTo(other.to) || (this.name ?? '').localeCompare(other.name ?? '')
    }

}
