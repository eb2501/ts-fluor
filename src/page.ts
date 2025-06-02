import { Clear } from "./clear";
import { Read } from "./read";
import { Write } from "./write";
import { Node } from "./node";
import { View } from "./view";
import { State } from "./state";

function isFunction<T>(value: T | (() => T)): value is () => T {
    return typeof value === "function";
}

export class Page {
    protected cell<T>(arg: T | (() => T)): Write<T> & Clear {
        if (isFunction(arg)) {
            return new Node(arg);
        } else {
            return new Node(() => arg);
        }
    }

    protected calc<T>(getFn: () => T): Read<T> & Clear & State {
        return new Node(getFn);
    }

    protected view<T>(getFn: () => T): Read<T>;
    protected view<T>(getFn: () => T, setFn: (value: T) => void): Write<T>;
    protected view<T>(getFn: () => T, clearFn: () => void): Read<T> & Clear;
    protected view<T>(getFn: () => T, setFn: (value: T) => void, clearFn: () => void): Write<T> & Clear;

    protected view<T>(
        getFn: () => T,
        setFn?: (value: T) => void,
        clearFn?: () => void
    ): Write<T> & Clear {
        return new View(getFn, setFn, clearFn);
    }
}
