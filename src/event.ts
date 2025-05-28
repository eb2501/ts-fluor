import { Ticket } from "./ticket";

export type Listener<E> = (event: E) => void;

export interface Source<E> {
    add(listener: Listener<E>): Ticket;
}

class NotifierTicket<E> implements Ticket {
    private readonly registry: Notifier<E>;
    private readonly listener: Listener<E>;

    constructor(registry: Notifier<E>, listener: Listener<E>) {
        this.registry = registry;
        this.listener = listener;
    }

    burn(): void {
        this.registry._remove(this.listener);
    }
}

export class Notifier<E> implements Source<E> {
    private readonly listeners: Map<Listener<E>, number> = new Map();

    add(listener: Listener<E>): Ticket {
        this.listeners.set(listener, (this.listeners.get(listener) || 0) + 1);
        return new NotifierTicket(this, listener);
    }

    _remove(listener: Listener<E>): void {
        const count = this.listeners.get(listener);
        if (count === undefined) {
            throw new Error(`Listener not found in registry: ${listener}`);
        }
        if (count > 1) {
            this.listeners.set(listener, count - 1);
        } else {
            this.listeners.delete(listener);
        }
    }

    notify(event: E): void {
        this.listeners.forEach((value, key) => {
            try {
                key(event);
            } catch (error) {
                console.error(`Error in listener: ${error}`);
            }
        });
    }
}
