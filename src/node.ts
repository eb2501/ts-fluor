import { Clear } from "./clear";
import { EventListener, EventManager, EventDispatcher } from "./event";
import { finalizer } from "./finalizer";
import { Ticket } from "./ticket";
import { Write } from "./write";


export type NodeEvent = "cache" | "clear";

///

type Caller = WeakRef<Clear>;

///

interface Callee {
    addCaller(caller: Caller): boolean;
    removeCaller(caller: Caller): void;
}

///

let context: Set<Callee> | null = null;

///

class NodeTicket implements Ticket {
    private readonly caller: Caller;
    private readonly callees: Callee[];

    constructor(caller: Caller, callees: Callee[]) {
        this.caller = caller;
        this.callees = callees;
    }

    burn(): void {
        this.callees.forEach((callee) => callee.removeCaller(this.caller));
    }
}

///

export class Node<T> implements Write<T>, Clear, EventDispatcher<NodeEvent>, Callee {
    private readonly self: Caller = new WeakRef(this);
    private callers: Set<Caller> | null = null;
    private readonly callees: Callee[] = [];
    private manager: EventManager<NodeEvent> | null = null;
    private readonly getFn: () => T;
    private value: T | null = null;

    constructor(getFn: () => T) {
        this.getFn = getFn;
        finalizer.register(
            this.self,
            new NodeTicket(this.self, this.callees),
        );
    }

    get(): T {
        if (context) {
            context.add(this);
        }
        if (!this.callers) {
            const original = context;
            context = new Set<Callee>();
            try {
                this.value = this.getFn();
                context.forEach((callee) => {
                    if (callee.addCaller(this.self)) {
                        this.callees.push(callee);
                    }
                });
                this.callers = new Set();
                if (this.manager) {
                    this.manager.notify("cache");
                }
            } finally {
                context = original;
            }
        }
        return this.value as T;
    }

    set(value: T): void {
        this.clear();
        this.value = value;
        this.callers = new Set();
    }

    clear(): void {
        if (this.callers) {
            const callers = this.callers;
            this.callers = null;
            callers.forEach((ref) => {
                const caller = ref.deref();
                if (caller) {
                    caller.clear();
                }
            });
            this.callees.forEach((callee) => callee.removeCaller(this.self));
            this.callees.length = 0;
            if (this.manager) {
                this.manager.notify("clear");
            }
        }
    }

    addListener(listener: EventListener<NodeEvent>): void {
        if (!this.manager) {
            this.manager = new EventManager<NodeEvent>();
        }
        this.manager.addListener(listener);
    }

    removeListener(listener: EventListener<NodeEvent>): void {
        if (!this.manager) {
            throw new Error("No listeners registered");
        }
        this.manager.removeListener(listener);
        if (this.manager.empty) {
            this.manager = null;
        }
    }

    addCaller(caller: Caller): boolean {
        if (this.callers === null) {
            this.callers = new Set();
        }
        if (!this.callers.has(caller)) {
            this.callers.add(caller);
            return true;
        } else {
            return false;
        }
    }

    removeCaller(caller: Caller): void {
        if (this.callers === null) {
            return;
        }
        this.callers.delete(caller);
    }
}
