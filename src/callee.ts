import { Clear } from "./clear";
import { Caller } from "./caller";

export class Callee implements Clear {
    _callers: Set<WeakRef<Caller>> = new Set();

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
