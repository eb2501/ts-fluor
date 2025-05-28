import { Callee, _context } from "./callee";
import { Ticket } from "./ticket";

class FinalizerTicket implements Ticket {
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
    private readonly callees: Callee[] = [];
    private readonly ref = new WeakRef(this);

    constructor() {
        super();
        registry.register(
            this.ref,
            new FinalizerTicket(this.ref, this.callees),
        );
    }

    protected apply(fn: () => void): void {
        const callees = new Set<Callee>();
        _context.push(callees);
        try {
            fn();
            callees.forEach((callee) => {
                if (!callee._callers.has(this.ref)) {
                    callee._callers.add(this.ref);
                    this.callees.push(callee);
                }
            });
        } finally {
            _context.pop();
        }
    }
    
    clear(): void {
        super.clear();
        this.callees.forEach((callee) => callee._callers.delete(this.ref));
        this.callees.length = 0;
    }
}
