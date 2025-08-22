
import type { Ticket } from "./ticket"
import type { Get, Mem } from "./basic"
import { cell, node } from "."

export class OneWayPipe<T, S extends T = T> implements Ticket {
  private readonly source: Get<S>
  private readonly target: Mem<T>
  private readonly enabled = cell(true)
  
  private readonly sourceCache = node(() => {
    this.enabled()
    return this.source()
  })

  private readonly sourceListener = (cached: boolean) => {
    if (!cached) {
      setTimeout(() => this.sync(), 0)
    }
  }

  constructor(source: Get<S>, target: Mem<T>) {
    this.source = source
    this.target = target
    this.sourceCache.addListener(this.sourceListener)
    this.sourceListener(false)
  }

  burn() {
    if (this.enabled()) {
      this.sourceCache.removeListener(this.sourceListener)
      this.enabled(false)
    }
  }

  private sync() {
    if (this.enabled()) {
      const value = this.sourceCache()
      if (value !== this.target()) {
        this.target(value)
      }
    }
  }
}

///////


export class TwoWayPipe<T> implements Ticket {
  private readonly source: Mem<T>
  private readonly target: Mem<T>
  private readonly enabled = cell(true)
  private sourceChanged = false

  private readonly sourceCache = node(() => {
    this.enabled()
    return this.source()
  })
  private readonly targetCache = node(() => {
    this.enabled()
    return this.target()
  })

  private readonly sourceListener = (cached: boolean) => {
    if (!cached) {
      this.sourceChanged = true
      setTimeout(() => this.sync(), 0)
    }
  }

  private readonly targetListener = (cached: boolean) => {
    if (!cached) {
      setTimeout(() => this.sync(), 0)
    }
  }

  constructor(source: Mem<T>, target: Mem<T>) {
    this.source = source
    this.target = target
    this.sourceCache.addListener(this.sourceListener)
    this.targetCache.addListener(this.targetListener)
    this.sourceListener(false)
  }

  burn() {
    if (this.enabled()) {
      this.sourceCache.removeListener(this.sourceListener)
      this.targetCache.removeListener(this.targetListener)
      this.enabled(false)
    }
  }

  private sync() {
    if (this.enabled()) {
      if (this.sourceChanged) {
        const value = this.sourceCache()
        if (value !== this.targetCache()) {
          this.target(value)
        }
        this.sourceChanged = false
      } else {
        const value = this.targetCache()
        if (value !== this.sourceCache()) {
          this.source(value)
        }
      }
    }
  }
}
