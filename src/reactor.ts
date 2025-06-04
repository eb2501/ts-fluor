import invariant from "../node_modules/tiny-invariant/dist/tiny-invariant"
import { Clear } from "./clear"
import { finalizer } from "./finalizer"
import { Graph, GraphListener, GraphState } from "./graph"
import { Ticket } from "./ticket"
import { Write } from "./write"


type ReactorCaller = WeakRef<Clear>

///

interface ReactorCallee {
    addCaller(caller: ReactorCaller): boolean
    removeCaller(caller: ReactorCaller): void
}

///

let context: Set<ReactorCallee> | null = null

///

class ReactorTicket implements Ticket {
    private readonly caller: ReactorCaller
    private readonly callees: ReactorCallee[]

    constructor(caller: ReactorCaller, callees: ReactorCallee[]) {
        this.caller = caller
        this.callees = callees
    }

    burn(): void {
        this.callees.forEach((callee) => callee.removeCaller(this.caller))
    }
}

///

class ListenerTicket<T> implements Ticket {
    private readonly reactor: Reactor<T>
    private readonly listener: GraphListener

    constructor(reactor: Reactor<T>, listener: GraphListener) {
        this.reactor = reactor
        this.listener = listener
    }

    burn(): void {
        this.reactor.removeListener(this.listener)
    }
}

///

function isFunction<T>(value: T | (() => T)): value is () => T {
    return typeof value === "function"
}

///

let freeze = false

///

export class Reactor<T> implements Write<T>, Clear, Graph, ReactorCallee {
    private readonly self: ReactorCaller = new WeakRef(this)
    private readonly callees: ReactorCallee[] = []
    private readonly source: T | (() => T)
    private callers: Set<ReactorCaller> | null = null
    private _state: GraphState
    private value: T | null = null
    private listeners: Set<GraphListener> | null = null

    constructor(source: T | (() => T)) {
        this.source = source
        if (isFunction(source)) {
            this._state = "cleared"
        } else {
            this.value = source
            this.callers = new Set()
            this._state = "cached"
        }
        finalizer.register(
            this.self,
            new ReactorTicket(this.self, this.callees),
        )
    }

    private changeState(state: GraphState): void {
        const before = this._state
        this._state = state
        if (this.listeners) {
            invariant(!freeze)
            freeze = true
            this.listeners.forEach((listener) => {
                try {
                    listener(before, state)
                } catch (error) {
                    console.error("Error in listener:", error)
                }
            })
            freeze = false
        }
    }

    //
    // Write<T>
    //

    get(): T {
        if (freeze) {
            throw new Error("Cannot get while executing a listener")
        }
        switch (this._state) {
            case "caching":
                throw new Error("Cannot get while doing a get")

            case "cleared":
                if (isFunction(this.source)) {
                    const previousContext = context
                    context = new Set<ReactorCallee>()
                    this.changeState("caching")
                    try {
                        this.value = this.source();
                    } catch (error) {
                        context = previousContext;
                        this.changeState("cleared")
                        throw error
                    }
                    context.forEach((callee) => {
                        if (callee.addCaller(this.self)) {
                            this.callees.push(callee)
                        }
                    });
                    context = previousContext
                } else {
                    this.value = this.source
                }
                this.callers = new Set()
                this.changeState("cached")
                break;
        }
        if (context) {
            context.add(this)
        }
        return this.value as T;
    }

    private invalidate(): void {
        invariant(this.callers !== null)
        const callers = this.callers
        this.callers = null
        callers.forEach((ref) => {
            const caller = ref.deref()
            if (caller) {
                caller.clear()
            }
        })
        this.callees.forEach((callee) => callee.removeCaller(this.self))
        this.callees.length = 0
        this.value = null
    }

    set(value: T): void {
        if (freeze) {
            throw new Error("Cannot set while executing a listener")
        }
        switch (this._state) {
            case "cached":
                invariant(this.callers !== null)
                this.invalidate()
                this.value = value
                this.callers = new Set()
                break

            case "caching":
                throw new Error("Cannot set while doing a get")

            case "cleared":
                this.value = value
                this.callers = new Set()
                this.changeState("cached")
                break
        }
    }

    clear(): void {
        if (freeze) {
            throw new Error("Cannot clear while executing a listener")
        }
        switch (this._state) {
            case "cached":
                this.invalidate()
                if (isFunction(this.source)) {
                    this.changeState("cleared")
                } else {
                    this.value = this.source
                    this.callers = new Set()
                }
                break
            
            case "caching":
                throw new Error("Cannot clear while doing a get")
        }
    }

    //
    // Graph
    //

    get state(): GraphState {
        return this._state
    }

    addListener(listener: GraphListener): Ticket {
        if (this.listeners === null) {
            this.listeners = new Set()
        }
        if (this.listeners.has(listener)) {
            throw new Error("Listener already added")
        }
        this.listeners.add(listener)
        return new ListenerTicket(this, listener)
    }

    removeListener(listener: GraphListener): void {
        if (this.listeners === null) {
            throw new Error("Listener is unknown")
        }
        if (!this.listeners.has(listener)) {
            throw new Error("Listener is unknown")
        }
        this.listeners.delete(listener)
        if (this.listeners.size === 0) {
            this.listeners = null
        }
    }

    //
    // ReactorCallee
    //

    addCaller(caller: ReactorCaller): boolean {
        invariant(this.callers !== null)
        if (!this.callers.has(caller)) {
            this.callers.add(caller)
            return true
        } else {
            return false
        }
    }

    removeCaller(caller: ReactorCaller): void {
        if (this.callers !== null) {
            this.callers.delete(caller)
        }
    }
}
