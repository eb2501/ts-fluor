import { Clear } from "./clear";
import { Write } from "./write";


export class View<T> implements Write<T>, Clear {
    private readonly getFn: () => T;
    private readonly setFn?: (value: T) => void;
    private readonly clearFn?: () => void;

    constructor(getFn: () => T, setFn?: (value: T) => void, clearFn?: () => void) {
        this.getFn = getFn;
        this.setFn = setFn;
        this.clearFn = clearFn;
    }

    get(): T {
        return this.getFn();
    }

    set(value: T): void {
        if (this.setFn) {
            this.setFn(value);
        } else {
            throw new Error("Set function is not defined");
        }
    }

    clear(): void {
        if (this.clearFn) {
            this.clearFn();
        } else {
            throw new Error("Clear function is not defined");
        }
    }
}
