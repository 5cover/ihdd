export const siteBaseUrl = '/ihdd';

export function requireElementById(id: string) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new Error(`Missing element ID ${id}`);
    }
    return el;
}

export function pascalize(s: string) {
    // Converts from snake_case to PascalCase
    // - Replace the first non-underscore character by its uppercase version.
    // - Replace undescores followed by a non-underscore character by the uppercase version of that character (replacing both characters by one, effectively removing the undercore)
    return s.replace(/(^|_)([^_])/g, (_, _prefix, letter) => (letter as string).toUpperCase());
}

export function isObject(x: unknown): x is object {
    return x !== null && typeof x === 'object';
}

export const isIdentifier = isString;

export function isString(x: unknown): x is string {
    return typeof x === 'string';
}

export function isTrue(x: unknown): x is true {
    return typeof x === 'boolean' && x;
}

export function isArray(x: unknown): x is unknown[] {
    return x instanceof Array;
}