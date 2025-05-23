import { Callee } from "./callee";

class Ticket {
    private readonly ref: WeakRef<Caller>;
    private readonly callees: Callee[];

    constructor(ref: WeakRef<Caller>, callees: Callee[]) {
        this.ref = ref;
        this.callees = callees;
    }

    burn(): void {
        this.callees.forEach((callee) => callee._callers.delete(this.ref));
    }
}

///////

const registry = new FinalizationRegistry<Ticket>((ticket) => ticket.burn());

///////

export class Caller extends Callee {
    public readonly ref = new WeakRef(this);
    private readonly _callees: Callee[] = [];

    constructor() {
        super();
        registry.register(
            this.ref,
            new Ticket(this.ref, this._callees),
        );
    }

    clear(): void {
        super.clear();
        this._callees.forEach((callee) => callee._callers.delete(this.ref));
        this._callees.length = 0;
    }

    protected link(callee: Callee): void {
        if (!callee._callers.has(this.ref)) {
            callee._callers.add(this.ref);
            this._callees.push(callee);
        }
    }
}
