import invariant from "tiny-invariant"
import { finalizer } from "./finalizer"
import { type Cache, type Listener } from "./cache"
import { type Ticket } from "./ticket"
import { getCurrentMode, withMode } from "./mode"


type Caller = WeakRef<NodeReactor<any>>

///////

interface Callee {
    _addCaller(caller: Caller): void
    _removeCaller(caller: Caller): void
}

///////

let currentContext: Set<Callee> | null = null

///////

export function snapshot<T>(fn: () => T): T {
  const previousContext = currentContext
  currentContext = null
  try {
    if (getCurrentMode() === "once") {
      return withMode("snapshot", fn)
    } else {
      return fn()
    }
  } finally {
    currentContext = previousContext
  }
}

///////

abstract class Reactor implements Cache {
  private listeners: Set<Listener> | null = null

  protected notify(cached: boolean): void {
    withMode("locked", () => {
      this.listeners?.forEach((listener) => {
        try {
          listener(cached)
        } catch (error) {
          console.error("Error in listener:", error)
        }
      })
    })
  }

  abstract readonly cached: boolean

  addListener(listener: Listener): void {
    if (this.listeners === null) {
      this.listeners = new Set()
    }
    if (this.listeners.has(listener)) {
      throw new Error("Listener already added")
    }
    this.listeners.add(listener)
  }

  removeListener(listener: Listener): void {
    if ((this.listeners === null) || (!this.listeners.has(listener))) {
      throw new Error("Listener not found")
    }
    this.listeners.delete(listener)
    if (this.listeners.size === 0) {
      this.listeners = null
    }
  }
}

///////

export class CellReactor<T> extends Reactor implements Callee {
  private callers = new Set<Caller>()
  private value: T

  constructor(value: T) {
    super()
    this.value = value
    this.callers = new Set()
  }

  getValue(): T {
    return withMode("calc", () => {
      if (currentContext) {
        currentContext.add(this)
      }
      return this.value
    })
  }

  _invalidate(): void {
    const callers = this.callers
    this.callers = new Set()
    callers.forEach((ref) => {
      const caller = ref.deref()
      if (caller) {
        caller._invalidate()
      }
    })
  }

  setValue(value: T): void {
    withMode("free", () => {
      this._invalidate()
      this.value = value
    })
  }

  get cached() {
    return true
  }

  _addCaller(caller: Caller): void {
    invariant(!this.callers.has(caller))
    this.callers.add(caller)
  }

  _removeCaller(caller: Caller): void {
    this.callers.delete(caller)
  }
}

///////

class ReactorTicket implements Ticket {
  private readonly caller: Caller
  private readonly callees: Callee[]

  constructor(caller: Caller, callees: Callee[]) {
    this.caller = caller
    this.callees = callees
  }

  burn(): void {
    this.callees.forEach((callee) =>
      callee._removeCaller(this.caller)
    )
  }
}

///////

export class NodeReactor<T> extends Reactor implements Callee {
  private readonly self: Caller = new WeakRef(this)
  private readonly callees: Callee[] = []
  private readonly getFn: () => T
  private callers: Set<Caller> | null
  private value: T | null

  constructor(getFn: () => T) {
    super()
    this.getFn = getFn
    this.value = null
    this.callers = null
    finalizer.register(
      this.self,
      new ReactorTicket(this.self, this.callees),
    )
  }

  getValue(): T {
    return withMode("calc", () => {
      if (this.callers === null) {
        const previousContext = currentContext
        currentContext = new Set<Callee>()
        try {
          this.value = this.getFn()
          currentContext.forEach((callee) => {
            callee._addCaller(this.self)
            this.callees.push(callee)
          })
        } finally {
          currentContext = previousContext
        }
        this.callers = new Set()
        this.notify(true)
      }
      if (currentContext) {
        currentContext.add(this)
      }
      return this.value as T
    })
  }

  _invalidate(): void {
    invariant(this.callers !== null)
    const callers = this.callers
    this.callers = null
    callers.forEach((ref) => {
      const caller = ref.deref()
      if (caller) {
        caller._invalidate()
      }
    })
    this.callees.forEach((callee) => callee._removeCaller(this.self))
    this.callees.length = 0
    this.value = null
    this.notify(false)
  }

  get cached(): boolean {
    return this.callers !== null
  }

  _addCaller(caller: Caller): void {
    invariant((this.callers !== null) && (!this.callers.has(caller)))
    this.callers.add(caller)
  }

  _removeCaller(caller: Caller): void {
    if (this.callers !== null) {
      this.callers.delete(caller)
    }
  }
}

///////

export class OnceReactor<T> extends Reactor {
  private getFn: (() => T) | null
  private value: T | null

  constructor(getFn: () => T) {
    super()
    this.getFn = getFn
    this.value = null
  }

  getValue(): T {
    if (this.getFn === null) {
      invariant(this.value !== null)
      return this.value
    } else {
      invariant(this.value === null)
      return withMode("once", () => {
        invariant(this.getFn !== null)
        this.value = this.getFn()
        this.getFn = null
        this.notify(true)
        return this.value
      })
    }
  }

  get cached(): boolean {
    return this.getFn === null
  }
}
