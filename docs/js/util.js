export const siteBaseUrl = '/ihdd';
export async function loadHtml(path) {
    return new DOMParser().parseFromString(await (await fetch(path)).text(), 'text/html').documentElement;
}
export function requireElementById(id) {
    const el = document.getElementById(id);
    if (el === null) {
        throw new Error(`Missing element ID ${id}`);
    }
    return el;
}
export function notnull(arg, msg) {
    if (arg === null) {
        throw new Error(msg);
    }
    return arg;
}
export function acce(parent, childTagName) {
    return parent.appendChild(document.createElement(childTagName));
}
