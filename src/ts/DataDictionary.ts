import { ObjectMap } from "./Map";
import QualifiedName from "./QualifiedName";
import { QualifiedReference, Relation } from "./types";
import QualifiedReferenceKey from "./QualifiedReferenceKey";


export class DataDictionary {
    readonly schemas: Record<string, Record<string, Relation>>;

    constructor(data: unknown) {
        this.schemas = data as typeof this.schemas;
    }

    parseQualifiedName(qualifiedName: string, fallbackSchemaName?: string) {
        const qualName = QualifiedName.parse(qualifiedName, fallbackSchemaName);
        const schema = this.schemas[qualName.schemaName];
        if (schema === undefined || schema[qualName.relationName] === undefined) {
            throw new Error(`invalid reference: ${qualifiedName} (${qualName.format()})`);
        }
        return qualName;
    };

    getReferences(relation: Relation, outerSchemaName: string): Map<QualifiedReferenceKey, QualifiedReference> {
        const refs = new ObjectMap<QualifiedReferenceKey, QualifiedReference, string>(k => k.toPrim(), k => QualifiedReferenceKey.fromPrim(k));
        for (const ref of relation.references ?? []) {
            refs.set(
                new QualifiedReferenceKey(this.parseQualifiedName(ref.to, outerSchemaName), ref.name),
                { description: ref.description, qualifier: ref.qualifier },
            );
        }
        return refs;
    }
}