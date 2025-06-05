import { getCurrentMode, Mode } from "../src/mode"
import { Page } from "../src/page"

describe("Cell", () => {
    it("statically should behave like read/write properties", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
        }
        
        const page = new TestPage()
        
        // We should get the same initial value
        expect(page.x.get()).toBe(42)

        // We can set a new value, and we'll get it back
        page.x.set(100)
        expect(page.x.get()).toBe(100)

        // When we clear the cell, it should reset to the initial value
        page.x.clear()
        expect(page.x.get()).toBe(42)
    })

    it("dynamically should behave like cached read/write properties", () => {
        let t = 12

        class TestPage extends Page {
            readonly x = this.cell(() => t + 1)
        }
        
        const page = new TestPage()
        
        // Initially we need to evaluate the function to get the value
        expect(page.x.get()).toBe(13)

        // If we change the value of t, the cell should not be affected as the value
        // is cached already
        t = 20
        expect(page.x.get()).toBe(13)

        // If we set a new value, it should update the cached value
        page.x.set(100)
        expect(page.x.get()).toBe(100)

        // If we clear the value however, the new value in t is picked up once we
        // evaluate the cell again
        page.x.clear()
        expect(page.x.get()).toBe(21)

        // We can also set the cell directly from a clear state
        page.x.set(202)
        expect(page.x.get()).toBe(202)
    })

    it("can refer to other cells multiple times", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
            readonly y = this.cell(() => this.x.get() * (this.x.get() + 1))
        }

        const page = new TestPage()

        // The value should be as expected
        expect(page.y.get()).toBe(42 * 43)

        // Changing x would have the expected impact on y
        page.x.set(100)
        expect(page.y.get()).toBe(100 * 101)
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
        expect(page.x.get()).toBe(13)

        // If we change the value of t, the cell should not be affected as the value
        // is cached already
        t = 20
        expect(page.x.get()).toBe(13)

        // If we clear the value however, the new value in t is picked up once we
        // evaluate the cell again
        page.x.clear()
        expect(page.x.get()).toBe(21)
    })

    it("Should be sensitive to all the caches they depend on (and only those)", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
            readonly y = this.cell(1)
            readonly z = this.node(() => this.x.get() + this.y.get())
            readonly t = this.cell(23)
        }

        const page = new TestPage()

        // The value is as expected
        expect(page.z.get()).toBe(43)

        // Changing x should impact z
        page.x.set(100)
        expect(page.z.get()).toBe(101)
        
        // Changing y should also impact z
        page.y.set(2)
        expect(page.z.get()).toBe(102)

        // Changing t should not impact z
        page.t.set(50)
        expect(page.z.get()).toBe(102)

        // Clearing x impacts z
        page.x.clear()
        expect(page.z.get()).toBe(44)
    })

    it("Chains behaves transparently", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
            readonly y = this.node(() => this.x.get() + 1)
            readonly z = this.node(() => this.y.get() * 3)
        }

        const page = new TestPage()

        // The value is as expected
        expect(page.z.get()).toBe(129)

        // Changing x should impact z through y
        page.x.set(100)
        expect(page.z.get()).toBe(303)

        // Clearing x should also impact z
        page.x.clear()
        expect(page.z.get()).toBe(129)
    })

    it("Dependencies should be dynamic", () => {
        class TestPage extends Page {
            readonly flag = this.cell(true)
            readonly x = this.cell(42)
            readonly y = this.cell(12)
            readonly z = this.node(
                () => this.flag.get() ? this.x.get() + this.y.get() : this.x.get() + 1
            )
        }

        const page = new TestPage()

        // The value is as expected
        expect(page.z.get()).toBe(54)

        // Changing x or y should impact z
        page.x.set(100)
        expect(page.z.get()).toBe(112)
        page.y.set(50)
        expect(page.z.get()).toBe(150)

        // Changing flag should also impact z
        page.flag.set(false)
        expect(page.z.get()).toBe(101)

        // Changing x should impact z again
        page.x.set(130)
        expect(page.z.get()).toBe(131)

        // ... but now z doesn't depend on y anymore
        page.y.set(20)
        expect(page.z.get()).toBe(131)

        // Clearing y should not change z for the same reason
        page.y.clear()
        expect(page.z.get()).toBe(131)

        // Clearing flag however should reset z and re-introduce the dependency on y
        page.flag.clear()
        expect(page.z.get()).toBe(142)
        page.y.set(20)
        expect(page.z.get()).toBe(150)
    })
})

describe("Mode", () => {
    it("Within a get, we're in read mode", () => {
        let mode: Mode | null = null
        
        class TestPage extends Page {
            readonly x = this.cell(() => {
                mode = getCurrentMode()
                return 42
            })
            readonly y = this.cell(() => {
                this.x.set(199)
                return 12
            })
            readonly z = this.cell(() => {
                this.x.clear()
                return 24
            })
        }

        const page = new TestPage()

        // Getting the value should put us in read mode
        page.x.get()
        expect(mode).toBe("read")

        // After, we should be back to free mode
        expect(getCurrentMode()).toBe("free")

        // Setting a value is forbidden in read mode
        expect(() => page.y.get()).toThrow()

        // Clearing a value is also forbidden in read mode
        expect(() => page.z.get()).toThrow()
    })

    it("Within a listener, we're in locked mode and we cannot interact with the graph", () => {
        class TestPage extends Page {
            readonly x = this.cell(() => 32)
            readonly y = this.cell(48)
        }

        const page = new TestPage()

        let mode: Mode | null = null
        let aFlag = false
        let bFlag = false
        let cFlag = false

        page.x.addListener((loaded) => {
            mode = getCurrentMode()

            try {
                page.y.get()
            } catch (error) {
                aFlag = true
            }

            try {
                page.y.set(100)
            } catch (error) {
                bFlag = true
            }

            try {
                page.y.clear()
            } catch (error) {
                cFlag = true
            }
        })
        page.x.get()

        expect(mode).toBe("locked")
        expect(aFlag).toBe(true)
        expect(bFlag).toBe(true)
        expect(cFlag).toBe(true)
    })
})

describe("Graph", () => {
    it("Static cells are always cached", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
        }
        
        const page = new TestPage()
        const events: boolean[] = []
        page.x.addListener((cached) => events.push(cached))

        // Initially the cell already cached
        expect(page.x.isLoaded).toBe(true)

        // Getting the value is a no-op
        page.x.get()
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([])

        // Upon setting a new value the cell is first invalidated and then
        // updated, but its state is still "cached"
        page.x.set(100)
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([])

        // Clearing the cell leave it in the "cached" state again
        page.x.clear()
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([])
    })

    it("Dynamic cells can have their state inspected", () => {
        class TestPage extends Page {
            readonly x = this.cell(() => 15)
        }
        
        const page = new TestPage()
        const events: boolean[] = []
        page.x.addListener((cached) => events.push(cached))

        // Initially the cell is not cached
        expect(page.x.isLoaded).toBe(false)

        // Getting the value causes the function to be evaluated, and upon returning
        // the cell is put into the "cached" state
        page.x.get()
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([true])
        events.length = 0

        // Getting the value again doesn't change the state
        page.x.get()
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([])

        // Upon setting a new value the cell is invalidated, but it stays cached
        page.x.set(100)
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([])

        // Clearing the cell have the expected state impact
        page.x.clear()
        expect(page.x.isLoaded).toBe(false)
        expect(events).toEqual([false])
        events.length = 0

        // We can also set the cell directly from a clear state
        page.x.set(202)
        expect(page.x.isLoaded).toBe(true)
        expect(events).toEqual([true])
    })

    it("Calcs can have their state inspected", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
            readonly y = this.node(() => this.x.get() + 1)
        }

        const page = new TestPage()
        const events: boolean[] = []
        page.y.addListener((loaded) => events.push(loaded))

        // Initially the calc is in the "clear" state
        expect(page.y.isLoaded).toBe(false)

        // Getting the value involves the calc to be evaluated and then cached
        page.y.get()
        expect(page.y.isLoaded).toBe(true)
        expect(events).toEqual([true])
        events.length = 0

        // Getting the value again doesn't change the state
        page.y.get()
        expect(page.y.isLoaded).toBe(true)
        expect(events).toEqual([])

        // Clearing the calc puts it back into the "clear" state
        page.x.clear()
        expect(page.y.isLoaded).toBe(false)
        expect(events).toEqual([false])
        events.length = 0
    })

    it("Listeners have their exceptions swallowed", () => {
        class TestPage extends Page {
            readonly x = this.cell(() => 42)
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
        expect(page.x.get()).toBe(42)
        expect(aFlag).toBe(true)
        expect(bFlag).toBe(true)
        expect(page.x.isLoaded).toBe(true)
    })

    it("Listeners can be added and removed dynamically", () => {
        class TestPage extends Page {
            readonly x = this.cell(() => 42)
        }

        const page = new TestPage()
        let flag = false

        // Adding a listener shouldn't call it
        const ticket = page.x.addListener((_) => {
            flag = true
        })
        expect(flag).toBe(false)

        // Getting x value should call the listener
        page.x.get()
        expect(flag).toBe(true)
        page.x.clear()
        flag = false

        // Removing the listener should prevent it from being called
        ticket.burn()
        page.x.get()
        expect(flag).toBe(false)
    })
    
    it("Listeners cannot do any operation on the graph", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
            readonly y = this.node(() => this.x.get() + 1)
            readonly z = this.cell(true)
        }

        const page = new TestPage()

        let flag = false

        // The listener should raise at the get, so flag shouldn't be set
        const t1 = page.x.addListener((_) => {
            page.z.get()
            flag = true
        })
        page.x.get()
        expect(flag).toBe(false)
        t1.burn()
        page.x.clear()

        // The listener should raise at the set, so flag shouldn't be set
        const t2 = page.x.addListener((_) => {
            page.z.set(false)
            flag = true
        })
        expect(flag).toBe(false)
        t2.burn()
        page.x.clear()

        // The listener should raise at the clear, so flag shouldn't be set
        const t3 = page.x.addListener((_) => {
            page.z.clear()
            flag = true
        })
        expect(flag).toBe(false)
        t3.burn()
        page.x.clear()
    })

    it("Listeners cannot be registered twice on the same target", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
        }

        const page = new TestPage()
        const listener = () => {}
        page.x.addListener(listener)
        expect(() => page.x.addListener(listener)).toThrow()
    })
})

describe("Views", () => {
    it("Should be completely transparent", () => {
        class TestPage extends Page {
            readonly x = this.cell(42)
            readonly y = this.view(
                () => this.x.get() + 1,
                (value) => this.x.set(value - 1),
                () => this.x.clear()
            )
        }

        const page = new TestPage();

        // The value should be as expected
        expect(page.y.get()).toBe(43)

        // Setting a new value should update the underlying cell
        page.y.set(100)
        expect(page.x.get()).toBe(99)
        expect(page.y.get()).toBe(100)

        // Setting the source cell should also impact the view's result
        page.x.set(50)
        expect(page.y.get()).toBe(51)

        // We can also clear the view
        page.y.clear()
        expect(page.x.get()).toBe(42)
    })
})

describe("Use Cases", () => {
    it("Indirection should work as expected", () => {
        class Test1Page extends Page {
            readonly x = this.cell(42);
            readonly y = this.node(() => this.x.get() + 1);
        }

        class Test2Page extends Page {
            readonly o = this.cell<Test1Page | null>(null)
            readonly z = this.node(() => {
                const obj = this.o.get();
                if (obj) {
                    return obj.y.get() * 2;
                } else {
                    return 0;
                }
            });
        }

        const page1 = new Test1Page();
        const page2 = new Test2Page();

        // Initially, the value of z should be 0 since o is null
        expect(page2.z.get()).toBe(0);

        // Setting o to page1 should update z based on page1's y
        page2.o.set(page1);
        expect(page2.z.get()).toBe(86);

        // Changing page1's x should impact z through y
        page1.x.set(100);
        expect(page2.z.get()).toBe(202);

        // Clearing page1's x should reset y and thus z
        page2.o.set(new Test1Page());
        expect(page2.z.get()).toBe(86);

        // Setting page1's x to a new value should update z again
        page1.x.set(50);
        expect(page2.z.get()).toBe(86);
    });
});
