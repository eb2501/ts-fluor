import { Caller } from "./caller";
import { Clear } from "./clear";
import { Notifier, Ticket } from "./notifier";
import { Read } from "./read";


type NodeEvent = "cache" | "clear";


export class Node<T> extends Caller implements Read<T>, Clear {
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
            this.notifier.dispatch("cache");
        }
        return this.value as T;
    }

    clear(): void {
        this.cached = false;
        this.value = null;
        super.clear();
        this.notifier.dispatch("clear");
    }

    register(listener: (event: NodeEvent) => void): Ticket {
        return this.notifier.register(listener);
    }
}
