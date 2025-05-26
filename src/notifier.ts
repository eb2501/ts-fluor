
export class Ticket {
    private readonly notifier: any;
    private readonly listener: any;

    constructor(notifier: any, listener: any) {
        this.notifier = notifier;
        this.listener = listener;
    }

    public cancel(): void {
        this.notifier.unregister(this.listener);
    }
}


export class Notifier<E> {
    public readonly listeners: Map<(event: E) => void, number> = new Map();

    register(listener: (event: E) => void): Ticket {
        this.listeners.set(listener, (this.listeners.get(listener) || 0) + 1);
        return new Ticket(this, listener);
    }

    unregister(listener: (event: E) => void): void {
        const count = this.listeners.get(listener);
        if (count !== undefined) {
            if (count > 1) {
                this.listeners.set(listener, count - 1);
            } else {
                this.listeners.delete(listener);
            }
        }
    }

    dispatch(event: E): void {
        this.listeners.forEach((value, key) => {
            try {
                key(event);
            } catch (error) {
                console.error("Error in listener:", error);
            }
        });
    }
}
