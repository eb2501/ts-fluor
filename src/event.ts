export type EventListener<E> = (event: E) => void;

export interface EventDispatcher<E> {
    addListener(listener: EventListener<E>): void;
    removeListener(listener: EventListener<E>): void;
}

export class EventManager<E> implements EventDispatcher<E> {
    private readonly listeners: Map<EventListener<E>, number> = new Map();

    get empty(): boolean {
        return this.listeners.size === 0;
    }

    addListener(listener: EventListener<E>): void {
        this.listeners.set(listener, (this.listeners.get(listener) || 0) + 1);
    }

    removeListener(listener: EventListener<E>): void {
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
