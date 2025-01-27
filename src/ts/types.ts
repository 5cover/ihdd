
export interface Relation {
    kind: Kind,
    attrs: Record<string, Attribute>,
    description?: string,
    references?: Reference[],
}

export type Kind = { 'association'?: KindAssociation, 'class'?: KindClass; };

export interface KindAssociation {
    left: string,
    right: string,
}

export interface KindClass {
    inherits?: string,
    abstract?: boolean,
}

export interface Attribute {
    is: Trait[],
    type: string,
    constraints: string[],
    remarks?: string,
    description?: string,
    domain?: Domain;
}

export type Trait = (string | { 'default': string; } | { 'computed': string; });

export type Domain = string | { min_incl?: boolean, min?: string, max?: string, max_incl?: boolean, };

export interface Reference {
    to: string,
    description?: string,
    name?: string,
    qualifier?: string,
}

export interface QualifiedReference {
    description?: string;
    qualifier?: string;
}

