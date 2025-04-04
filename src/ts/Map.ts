type PrimitiveType = string | number | bigint | boolean | undefined | symbol | null;
export class ObjectMap<TKey, TValue, TPrimKey extends PrimitiveType> implements Map<TKey, TValue> {
    readonly #ktop;
    readonly #ptok;
    readonly #map;
    constructor(keyToPrim: (key: TKey) => TPrimKey, primToKey: (primKey: TPrimKey) => TKey) {
        this.#ktop = keyToPrim;
        this.#ptok = primToKey;
        this.#map = new Map<TPrimKey, TValue>();
    }
    get size(): number {
        return this.#map.size;
    }
    clear(): void {
        this.#map.clear();
    }
    delete(key: TKey): boolean {
        return this.#map.delete(this.#ktop(key));
    }
    forEach(callbackfn: (value: TValue, key: TKey, map: Map<TKey, TValue>) => void, thisArg?: unknown): void {
        this.#map.forEach((v, k) => callbackfn.call(thisArg === undefined ? this : thisArg, v, this.#ptok(k), this));
    }
    get(key: TKey): TValue | undefined {
        return this.#map.get(this.#ktop(key));
    }
    has(key: TKey): boolean {
        return this.#map.has(this.#ktop(key));
    }
    set(key: TKey, value: TValue): this {
        this.#map.set(this.#ktop(key), value);
        return this;
    }
    *entries(): MapIterator<[TKey, TValue]> {
        for (const [k, v] of this.#map.entries()) {
            yield [this.#ptok(k), v];
        }
    }
    *keys(): MapIterator<TKey> {
        for (const k of this.#map.keys()) {
            yield this.#ptok(k);
        }
    }
    values(): MapIterator<TValue> {
        return this.#map.values();
    }
    [Symbol.iterator](): MapIterator<[TKey, TValue]> {
        return this.entries();
    }
    get [Symbol.toStringTag](): string {
        return this.#map[Symbol.toStringTag];
    }
}