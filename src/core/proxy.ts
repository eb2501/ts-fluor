import invariant from "tiny-invariant"
import { type Write } from "./write"


export class Proxy<T> implements Write<T> {
    private readonly getFn: () => T
    private readonly setFn?: (value: T) => void

    constructor(getFn: () => T, setFn?: (value: T) => void) {
        this.getFn = getFn
        this.setFn = setFn
    }

    get(): T {
        return this.getFn()
    }

    set(value: T): void {
        invariant(this.setFn !== undefined)
        this.setFn(value)
    }
}
