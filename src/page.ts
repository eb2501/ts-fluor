import { Clear } from "./clear"
import { Read } from "./read"
import { Write } from "./write"
import { Reactor } from "./reactor"
import { View } from "./view"
import { State } from "./cache"

export class Page {
    protected cell<T>(source: T | (() => T)): Write<T> & Clear & State {
        return new Reactor(source)
    }

    protected node<T>(getFn: () => T): Read<T> & Clear & State {
        return new Reactor(getFn)
    }

    protected view<T>(getFn: () => T): Read<T>
    protected view<T>(getFn: () => T, setFn: (value: T) => void): Write<T>
    protected view<T>(getFn: () => T, clearFn: () => void): Read<T> & Clear
    protected view<T>(getFn: () => T, setFn: (value: T) => void, clearFn: () => void): Write<T> & Clear

    protected view<T>(
        getFn: () => T,
        setFn?: (value: T) => void,
        clearFn?: () => void
    ): Write<T> & Clear {
        return new View(getFn, setFn, clearFn);
    }
}
