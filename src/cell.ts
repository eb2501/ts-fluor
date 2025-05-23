import { Callee } from "./callee";
import { Clear } from "./clear";
import { Write } from "./write";


export class Cell<T> extends Callee implements Write<T> {
    private readonly original: T;
    private cache: T;

    constructor(original: T) {
        super();
        this.original = original;
        this.cache = original;
    }

    get(): T {
        return this.cache;
    }

    set(value: T): void {
        this.cache = value;
        super.clear();
    }

    clear(): void {
        this.set(this.original);
    }
}
