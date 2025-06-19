import { IAggregatedField } from "./interfaces";

export class Dictionary<K extends string | number | symbol, V> {
    private items: Record<K, V> = {} as Record<K, V>;

    /**
     * Sets a key-value pair in the dictionary.
     * @param key - The unique key.
     * @param value - The associated value.
     */
    set(key: K, value: V): void {
        this.items[key] = value;
    }

    /**
     * Retrieves the value associated with a key.
     * @param key - The key to look up.
     * @returns The value or `undefined` if not found.
     */
    get(key: K): V | undefined {
        return this.items[key];
    }

    /**
     * Checks if the dictionary contains a specific key.
     * @param key - The key to check.
     * @returns `true` if the key exists, otherwise `false`.
     */
    has(key: K): boolean {
        return Object.prototype.hasOwnProperty.call(this.items, key);
    }

    /**
     * Deletes a key-value pair from the dictionary.
     * @param key - The key to remove.
     * @returns `true` if the key was deleted, otherwise `false`.
     */
    delete(key: K): boolean {
        if (this.has(key)) {
            delete this.items[key];
            return true;
        }
        return false;
    }

    /**
     * Returns all keys in the dictionary.
     * @returns An array of keys.
     */
    keys(): K[] {
        return Object.keys(this.items) as K[];
    }

    /**
     * Returns all values in the dictionary.
     * @returns An array of values.
     */
    values(): V[] {
        return Object.keys(this.items).map(key => this.items[key as K]);
    }


    /**
     * Returns an array of key-value pairs.
     * @returns An array of `[key, value]` tuples.
     */
    entries(): [K, V][] {
        return this.keys().map(key => [key, this.items[key]]);
    }

    /**
     * Clears all entries in the dictionary.
     */
    clear(): void {
        this.items = {} as Record<K, V>;
    }

    /**
     * Gets the number of entries in the dictionary.
     * @returns The count of stored key-value pairs.
     */
    get size(): number {
        return this.keys().length;
    }

    /**
     * Returns a sorted array of entries based on keys.
     * @param ascending - Whether to sort in ascending order (`true` by default).
     * @returns A sorted array of `[key, value]` tuples.
     */
    sortedEntries(ascending: boolean = true): [K, V][] {
        return this.entries().sort(([keyA], [keyB]) =>
            ascending ? keyA.toString().localeCompare(keyB.toString()) : keyB.toString().localeCompare(keyA.toString())
        );
    }

    /**
     * Serializes the dictionary into a JSON string.
     * @param pretty - Whether to format with indentation (`false` by default).
     * @returns A JSON representation of the dictionary.
     */
    toJSON(pretty: boolean = false): string {
        return JSON.stringify(this.items, null, pretty ? 2 : 0);
    }

    /**
     * Iterator to allow looping over dictionary entries using `for...of`.
     */
    *[Symbol.iterator](): IterableIterator<[K, V]> {
        for (const entry of this.entries()) {
            yield entry;
        }
    }
}

export type SummaryDictionary = Dictionary<string, IAggregatedField[]>;
