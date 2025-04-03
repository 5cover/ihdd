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
        || c === '\ufeff';
}

export function time_ago(ts: number): string {
    const delta = Math.floor((Date.now() / 1000 - ts));
    if (delta < 60) return "maintenant";
    if (delta < 3600) {
        const mn = Math.floor(delta / 60);
        return 'il y a ' + quantify(mn, 'minute');
    };
    if (delta < 86400) {
        const hr = Math.floor(delta / 3600);
        return 'il y a ' + quantify(hr, 'heure');
    };
    const jr = Math.floor(delta / 86400);
    return 'il y a ' + quantify(jr, 'jour');
}

export function quantify(quantity: number, singular: string) {
    return `${quantity} ${quantity === 1 ? singular : singular + 's'}`;
}

export async function fetch_json(url: string): Promise<unknown> {
    return await (await fetch(url)).json();
}