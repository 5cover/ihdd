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

export function get_class(e: HTMLElement, cls: string) {
    const el = e.getElementsByClassName(cls).item(0);
    if (el === null) {
        throw new Error(`expected element of class ${cls} in ${e.tagName}`);
    }
    return el;
}

export function isWhitespace(c: string) {
    return c === ' '
        || c === '\n'
        || c === '\t'
        || c === '\r'
        || c === '\f'
        || c === '\v'
        || c === '\u00a0'
        || c === '\u1680'
        || c === '\u2000'
        || c === '\u200a'
        || c === '\u2028'
        || c === '\u2029'
        || c === '\u202f'
        || c === '\u205f'
        || c === '\u3000'
        || c === '\ufeff'
}
