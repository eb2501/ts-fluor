import { Clear } from "./clear";
import { Caller } from "./caller";

export const _context: Set<Callee>[] = [];

export class Callee implements Clear {
    _callers: Set<WeakRef<Caller>> = new Set();

    protected hit(): void {
        if (_context.length > 0) {
            _context[_context.length - 1].add(this);
        }
    }

    clear(): void {
        const callers = this._callers;
        this._callers = new Set();
        callers.forEach((ref) => {
            const caller = ref.deref();
            if (caller) {
                caller.clear();
            }
        });
    }
}
