import invariant from "../node_modules/tiny-invariant/dist/tiny-invariant"
import { Clear } from "./clear"
import { Write } from "./write"


export class View<T> implements Write<T>, Clear {
    private readonly getFn: () => T
    private readonly setFn?: (value: T) => void
    private readonly clearFn?: () => void

    constructor(getFn: () => T, setFn?: (value: T) => void, clearFn?: () => void) {
        this.getFn = getFn
        this.setFn = setFn
        this.clearFn = clearFn
    }

    get(): T {
        return this.getFn()
    }

    set(value: T): void {
        invariant(this.setFn !== undefined)
        this.setFn(value)
    }

    clear(): void {
        invariant(this.clearFn !== undefined)
        this.clearFn()
    }
}
