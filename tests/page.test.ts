import { describe, expect, it } from "vitest"
import { getCurrentMode, type Mode } from "../src/core/mode"
import { cell, node, Page } from "../src/core/page"

describe("Cell", () => {
  it("statically should behave like read/write properties", () => {
    const x = cell(42)
        
    // We should get the same initial value
    expect(x()).toBe(42)

    // We can set a new value, and we'll get it back
    x(100)
    expect(x()).toBe(100)
  })
})

describe("Nodes", () => {
  it("Should behave like dynamic cells, except read-only", () => {
    let t = 12
    const x = node(() => t + 1)
        
    // Initially we need to evaluate the function to get the value
    expect(x()).toBe(13)

    // If we change the value of t, the cell should not be affected as the value
    // is cached already
    t = 20
    expect(x()).toBe(13)
  })

  it("Should be sensitive to all the caches they depend on (and only those)", () => {
    const x = cell(42)
    const y = cell(1)
    const z = node(() => x() + y())
    const t = cell(23)

    // The value is as expected
    expect(z()).toBe(43)

    // Changing x should impact z
    x(100)
    expect(z()).toBe(101)
        
    // Changing y should also impact z
    y(2)
    expect(z()).toBe(102)

    // Changing t should not impact z
    t(50)
    expect(z()).toBe(102)
  })

  it("Chains behaves transparently", () => {
    const x = cell(42)
    const y = node(() => x() + 1)
    const z = node(() => y() * 3)

    // The value is as expected
    expect(z()).toBe(129)

    // Changing x should impact z through y
    x(100)
    expect(z()).toBe(303)
  })

  it("Dependencies should be dynamic", () => {
    const flag = cell(true)
    const x = cell(42)
    const y = cell(12)
    const z = node(
      () => flag() ? x() + y() : x() + 1
    )

    // The value is as expected
    expect(z()).toBe(54)

    // Changing x or y should impact z
    x(100)
    expect(z()).toBe(112)
    y(50)
    expect(z()).toBe(150)

    // Changing flag should also impact z
    flag(false)
    expect(z()).toBe(101)

    // Changing x should impact z again
    x(130)
    expect(z()).toBe(131)

    // ... but now z doesn't depend on y anymore
    y(20)
    expect(z()).toBe(131)
  })
})

describe("Mode", () => {
  it("Within a listener, we're in locked mode and we cannot interact with the graph", () => {
    const x = node(() => 32)
    const y = cell(48)

    let mode: Mode | null = null
    let aFlag = false
    let bFlag = false

    x.addListener((loaded) => {
      mode = getCurrentMode()

      try {
        y()
      } catch (error) {
        aFlag = true
      }

      try {
        y(100)
      } catch (error) {
        bFlag = true
      }
    })
    x()

    expect(mode).toBe("locked")
    expect(aFlag).toBe(true)
    expect(bFlag).toBe(true)
  })
})

describe("Graph", () => {
  it("Nodes can have their state inspected", () => {
    const x = cell(42)
    const y = node(() => x() + 1)

    const events: boolean[] = []
    y.addListener((loaded) => events.push(loaded))

    // Initially the calc is in the "clear" state
    expect(y.isCached).toBe(false)

    // Getting the value involves the calc to be evaluated and then cached
    y()
    expect(y.isCached).toBe(true)
    expect(events).toEqual([true])
    events.length = 0

    // Getting the value again doesn't change the state
    y()
    expect(y.isCached).toBe(true)
    expect(events).toEqual([])
  })

  it("Listeners have their exceptions swallowed", () => {
    const x = node(() => 42)

    let aFlag = false
    let bFlag = false
    x.addListener(() => {
      aFlag = true
      throw new Error("Test error")
    })
    x.addListener(() => {
      bFlag = true
      throw new Error("Another test error")
    })

    // Both listeners should be called, and the cell should be in the "caching" state
    expect(x()).toBe(42)
    expect(aFlag).toBe(true)
    expect(bFlag).toBe(true)
    expect(x.isCached).toBe(true)
  })

  it("Listeners can be added and removed dynamically", () => {
    const x = cell(42)
    const y = node(() => x() + 1)

    let flag = false
    const listener = (cached: boolean) => {
      flag = true
    }

    // Adding a listener shouldn't call it
    y.addListener(listener)
    expect(flag).toBe(false)

    // Getting x value should call the listener
    y()
    expect(flag).toBe(true)
    x(12)
    flag = false

    // Removing the listener should prevent it from being called
    y.removeListener(listener)
    y()
    expect(flag).toBe(false)
  })
    
  it("Listeners cannot do any operation on the graph", () => {
    const x = cell(42)
    const y = node(() => x() + 1)
    const z = cell(true)

    let flag = false

    // The listener should raise at the get, so flag shouldn't be set
    const l1 = (cached: boolean) => {
      x()
      flag = true
    }
    y.addListener(l1)
    y()
    expect(flag).toBe(false)
    y.removeListener(l1)
    x(12)

    // The listener should raise at the set, so flag shouldn't be set
    const l2 = (cached: boolean) => {
      z(false)
      flag = true
    }
    y.addListener(l2)
    y()
    expect(flag).toBe(false)
  })

  it("Listeners cannot be registered twice on the same target", () => {
    const x = node(() => 42)

    const listener = () => {}
    x.addListener(listener)
    expect(() => x.addListener(listener)).toThrow()
  })

  it("Listener is called on node when a dependency is set", () => {
    const x = cell(1)
    const y = cell(2)
    const z = node(() => x() + y())

    let called = false
    z.addListener(() => { called = true })

    // Access once to cache
    z()
    called = false
        
    // Change a dependency
    x(10)
    expect(called).toBe(true)
  })
})

describe("Use Cases", () => {
  it("Indirection should work as expected", () => {
    class Test1 {
      readonly x = cell(42)
      readonly y = node(() => this.x() + 1)
    }

    class Test2 {
      readonly o = cell<Test1 | null>(null)
      readonly z = node(() => {
        const obj = this.o()
        if (obj) {
          return obj.y() * 2
        } else {
          return 0
        }
      })
    }

    const obj1 = new Test1()
    const obj2 = new Test2()

    // Initially, the value of z should be 0 since o is null
    expect(obj2.z()).toBe(0)

    // Setting o to page1 should update z based on page1's y
    obj2.o(obj1)
    expect(obj2.z()).toBe(86)

    // Changing page1's x should impact z through y
    obj1.x(100)
    expect(obj2.z()).toBe(202)

    // Clearing page1's x should reset y and thus z
    obj2.o(new Test1())
    expect(obj2.z()).toBe(86)

    // Setting page1's x to a new value should update z again
    obj1.x(50)
    expect(obj2.z()).toBe(86)
  })
})
