import { describe, expect, it } from "vitest"
import { getCurrentMode, type Mode } from "../src/core/mode"
import { Page } from "../src/core/page"

describe("Cell", () => {
  it("statically should behave like read/write properties", () => {
    class TestPage extends Page {
      readonly x = this.cell(42)
    }
        
    const page = new TestPage()
        
    // We should get the same initial value
    expect(page.x()).toBe(42)

    // We can set a new value, and we'll get it back
    page.x(100)
    expect(page.x()).toBe(100)
  })
})

describe("Nodes", () => {
  it("Should behave like dynamic cells, except read-only", () => {
    let t = 12

    class TestPage extends Page {
      readonly x = this.node(() => t + 1)
    }
        
    const page = new TestPage()
        
    // Initially we need to evaluate the function to get the value
    expect(page.x()).toBe(13)

    // If we change the value of t, the cell should not be affected as the value
    // is cached already
    t = 20
    expect(page.x()).toBe(13)
  })

  it("Should be sensitive to all the caches they depend on (and only those)", () => {
    class TestPage extends Page {
      readonly x = this.cell(42)
      readonly y = this.cell(1)
      readonly z = this.node(() => this.x() + this.y())
      readonly t = this.cell(23)
    }

    const page = new TestPage()

    // The value is as expected
    expect(page.z()).toBe(43)

    // Changing x should impact z
    page.x(100)
    expect(page.z()).toBe(101)
        
    // Changing y should also impact z
    page.y(2)
    expect(page.z()).toBe(102)

    // Changing t should not impact z
    page.t(50)
    expect(page.z()).toBe(102)
  })

  it("Chains behaves transparently", () => {
    class TestPage extends Page {
      readonly x = this.cell(42)
      readonly y = this.node(() => this.x() + 1)
      readonly z = this.node(() => this.y() * 3)
    }

    const page = new TestPage()

    // The value is as expected
    expect(page.z()).toBe(129)

    // Changing x should impact z through y
    page.x(100)
    expect(page.z()).toBe(303)
  })

  it("Dependencies should be dynamic", () => {
    class TestPage extends Page {
      readonly flag = this.cell(true)
      readonly x = this.cell(42)
      readonly y = this.cell(12)
      readonly z = this.node(
        () => this.flag() ? this.x() + this.y() : this.x() + 1
      )
    }

    const page = new TestPage()

    // The value is as expected
    expect(page.z()).toBe(54)

    // Changing x or y should impact z
    page.x(100)
    expect(page.z()).toBe(112)
    page.y(50)
    expect(page.z()).toBe(150)

    // Changing flag should also impact z
    page.flag(false)
    expect(page.z()).toBe(101)

    // Changing x should impact z again
    page.x(130)
    expect(page.z()).toBe(131)

    // ... but now z doesn't depend on y anymore
    page.y(20)
    expect(page.z()).toBe(131)
  })
})

describe("Mode", () => {
  it("Within a listener, we're in locked mode and we cannot interact with the graph", () => {
    class TestPage extends Page {
      readonly x = this.node(() => 32)
      readonly y = this.cell(48)
    }

    const page = new TestPage()

    let mode: Mode | null = null
    let aFlag = false
    let bFlag = false

    page.x.addListener((loaded) => {
      mode = getCurrentMode()

      try {
        page.y()
      } catch (error) {
        aFlag = true
      }

      try {
        page.y(100)
      } catch (error) {
        bFlag = true
      }
    })
    page.x()

    expect(mode).toBe("locked")
    expect(aFlag).toBe(true)
    expect(bFlag).toBe(true)
  })
})

describe("Graph", () => {
  it("Nodes can have their state inspected", () => {
    class TestPage extends Page {
      readonly x = this.cell(42)
      readonly y = this.node(() => this.x() + 1)
    }

    const page = new TestPage()
    const events: boolean[] = []
    page.y.addListener((loaded) => events.push(loaded))

    // Initially the calc is in the "clear" state
    expect(page.y.isCached).toBe(false)

    // Getting the value involves the calc to be evaluated and then cached
    page.y()
    expect(page.y.isCached).toBe(true)
    expect(events).toEqual([true])
    events.length = 0

    // Getting the value again doesn't change the state
    page.y()
    expect(page.y.isCached).toBe(true)
    expect(events).toEqual([])
  })

  it("Listeners have their exceptions swallowed", () => {
    class TestPage extends Page {
      readonly x = this.node(() => 42)
    }

    let aFlag = false
    let bFlag = false
    const page = new TestPage()
    page.x.addListener(() => {
      aFlag = true
      throw new Error("Test error")
    })
    page.x.addListener(() => {
      bFlag = true
      throw new Error("Another test error")
    })

    // Both listeners should be called, and the cell should be in the "caching" state
    expect(page.x()).toBe(42)
    expect(aFlag).toBe(true)
    expect(bFlag).toBe(true)
    expect(page.x.isCached).toBe(true)
  })

  it("Listeners can be added and removed dynamically", () => {
    class TestPage extends Page {
      readonly x = this.cell(42)
      readonly y = this.node(() => this.x() + 1)
    }

    const page = new TestPage()

    let flag = false
    const listener = (cached: boolean) => {
      flag = true
    }

    // Adding a listener shouldn't call it
    page.y.addListener(listener)
    expect(flag).toBe(false)

    // Getting x value should call the listener
    page.y()
    expect(flag).toBe(true)
    page.x(12)
    flag = false

    // Removing the listener should prevent it from being called
    page.y.removeListener(listener)
    page.y()
    expect(flag).toBe(false)
  })
    
  it("Listeners cannot do any operation on the graph", () => {
    class TestPage extends Page {
      readonly x = this.cell(42)
      readonly y = this.node(() => this.x() + 1)
      readonly z = this.cell(true)
    }

    const page = new TestPage()

    let flag = false

    // The listener should raise at the get, so flag shouldn't be set
    const l1 = (cached: boolean) => {
      page.x()
      flag = true
    }
    page.y.addListener(l1)
    page.y()
    expect(flag).toBe(false)
    page.y.removeListener(l1)
    page.x(12)

    // The listener should raise at the set, so flag shouldn't be set
    const l2 = (cached: boolean) => {
      page.z(false)
      flag = true
    }
    page.y.addListener(l2)
    page.y()
    expect(flag).toBe(false)
  })

  it("Listeners cannot be registered twice on the same target", () => {
    class TestPage extends Page {
      readonly x = this.node(() => 42)
    }

    const page = new TestPage()
    const listener = () => {}
    page.x.addListener(listener)
    expect(() => page.x.addListener(listener)).toThrow()
  })

  it("Listener is called on node when a dependency is set", () => {
    class TestPage extends Page {
      readonly x = this.cell(1)
      readonly y = this.cell(2)
      readonly z = this.node(() => this.x() + this.y())
    }
    const page = new TestPage()
    let called = false
    page.z.addListener(() => { called = true })

    // Access once to cache
    page.z()
    called = false
        
    // Change a dependency
    page.x(10)
    expect(called).toBe(true)
  })
})

describe("Use Cases", () => {
  it("Indirection should work as expected", () => {
    class Test1Page extends Page {
      readonly x = this.cell(42);
      readonly y = this.node(() => this.x() + 1);
    }

    class Test2Page extends Page {
      readonly o = this.cell<Test1Page | null>(null)
      readonly z = this.node(() => {
        const obj = this.o();
        if (obj) {
          return obj.y() * 2;
        } else {
          return 0;
        }
      });
    }

    const page1 = new Test1Page();
    const page2 = new Test2Page();

    // Initially, the value of z should be 0 since o is null
    expect(page2.z()).toBe(0);

    // Setting o to page1 should update z based on page1's y
    page2.o(page1);
    expect(page2.z()).toBe(86);

    // Changing page1's x should impact z through y
    page1.x(100);
    expect(page2.z()).toBe(202);

    // Clearing page1's x should reset y and thus z
    page2.o(new Test1Page());
    expect(page2.z()).toBe(86);

    // Setting page1's x to a new value should update z again
    page1.x(50);
    expect(page2.z()).toBe(86);
  });
});
