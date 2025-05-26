import { Callee } from "./callee";
import { Clear } from "./clear";
import { Notifier, Ticket } from "./notifier";
import { Write } from "./write";


type CellEvent = "set" | "clear";


export class Cell<T> extends Callee implements Write<T> {
    private readonly notifier = new Notifier<CellEvent>()
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
        this.notifier.dispatch("set");
    }

    clear(): void {
        this.cache = this.original;
        super.clear();
        this.notifier.dispatch("clear");
    }

    register(listener: (event: CellEvent) => void): Ticket {
        return this.notifier.register(listener);
    }
}
