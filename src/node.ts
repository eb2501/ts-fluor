import { Callee } from "./callee";
import { Caller } from "./caller";
import { Clear } from "./clear";
import { Read } from "./read";

let callees: Set<Callee> | null = null;


export class Node<T> extends Caller implements Read<T>, Clear {
    private readonly getter: () => T;
    private cached: boolean = false;
    private value: T | null = null;

    constructor(getter: () => T) {
        super();
        this.getter = getter;
    }

    get(): T {
        if (callees) {
            callees.add(this);
        }
        if (!this.cached) {
            const backup = callees;
            callees = new Set();
            try {
                this.value = this.getter();
                this.cached = true;
                callees.forEach((callee) => this.link(callee));
            } finally {
                callees = backup;
            }
        }
        return this.value as T;
    }

    clear(): void {
        this.cached = false;
        this.value = null;
        super.clear();
    }
}
