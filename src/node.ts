import { Caller } from "./caller";
import { Clear } from "./clear";
import { Listener, Notifier, Source } from "./event";
import { Read } from "./read";
import { Ticket } from "./ticket";


export type NodeEvent = "cache" | "clear";


export class Node<T> extends Caller implements Read<T>, Source<NodeEvent> {
    private readonly notifier = new Notifier<NodeEvent>()
    private readonly getter: () => T;
    private cached: boolean = false;
    private value: T | null = null;

    constructor(getter: () => T) {
        super();
        this.getter = getter;
    }

    get(): T {
        this.hit();
        if (!this.cached) {
            this.apply(() => {
                this.value = this.getter();
                this.cached = true;
            });
            this.notifier.notify("cache");
        }
        return this.value as T;
    }

    clear(): void {
        this.cached = false;
        this.value = null;
        super.clear();
        this.notifier.notify("clear");
    }

    add(listener: Listener<NodeEvent>): Ticket {
        return this.notifier.add(listener);
    }
}
