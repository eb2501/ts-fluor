import { Callee } from "./callee";
import { Listener, Notifier, Source } from "./event";
import { Ticket } from "./ticket";
import { Write } from "./write";


export type CellEvent = "set" | "clear";

export class Cell<T> extends Callee implements Write<T>, Source<CellEvent> {
    private readonly notifier = new Notifier<CellEvent>()
    private readonly original: T;
    private cache: T;

    constructor(original: T) {
        super();
        this.original = original;
        this.cache = original;
    }

    get(): T {
        this.hit();
        return this.cache;
    }

    set(value: T): void {
        this.cache = value;
        super.clear();
        this.notifier.notify("set");
    }

    clear(): void {
        this.cache = this.original;
        super.clear();
        this.notifier.notify("clear");
    }

    add(listener: Listener<CellEvent>): Ticket {
        return this.notifier.add(listener);
    }
}
