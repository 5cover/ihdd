export const siteBaseUrl = '/ihdd';

export async function loadHtml(path: string) {
    return new DOMParser().parseFromString(await (await fetch(path)).text(), 'text/html').documentElement
}

export function requireElementById(id: string) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new Error(`Missing element ID ${id}`);
    }
    return el;
}

export function notnull<T>(arg: T | null, msg: string) {
    if (arg === null) {
        throw new Error(msg);
    }
    return arg;
}

export function acce<K extends keyof HTMLElementTagNameMap>(parent: HTMLElement, childTagName: K) {
    return parent.appendChild(document.createElement(childTagName));
}
