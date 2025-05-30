import { Page } from "../src/page";

describe("Page Tests", () => {
    it("cells should behave like read/write properties", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
        }
        
        const page = new TestPage();
        
        expect(page.x.get()).toBe(42);

        page.x.set(100);
        expect(page.x.get()).toBe(100);

        page.x.clear();
        expect(page.x.get()).toBe(42);
    });

    it("cells can be listened to", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
        }
        
        const page = new TestPage();
        const events: string[] = [];
        page.x.addListener((e) => events.push(e));
        
        expect(page.x.get()).toBe(42);
        expect(events).toEqual(["cache"]);
        events.length = 0; // Clear events

        page.x.set(100);
        expect(events).toEqual(["clear"]);
        expect(page.x.get()).toBe(100);
        expect(events).toEqual(["set"]);
        events.length = 0; // Clear events

        page.x.clear();
        expect(page.x.get()).toBe(42);
        expect(events).toEqual(["clear"]);
    });

    it("nodes should behave like regular functions", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.cache(() => this.x.get() + 1);
        }

        const page = new TestPage();
        const events: string[] = [];
        page.y.addListener((e) => events.push(e));

        expect(page.y.get()).toBe(43);
        expect(events).toEqual(['cache']);
        events.length = 0; // Clear events

        page.x.set(100);
        expect(events).toEqual(['clear']);
        events.length = 0; // Clear events

        expect(page.y.get()).toBe(101);
        expect(events).toEqual(['cache']);
        events.length = 0; // Clear events

        page.x.clear();
        expect(events).toEqual(['clear']);
        events.length = 0; // Clear events

        expect(page.y.get()).toBe(43);
        expect(events).toEqual(['cache']);
        events.length = 0; // Clear events
    });

    it("nodes should be sensitive to all the cells they depend on", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.cell(1);
            readonly z = this.cache(() => this.x.get() + this.y.get());
        }

        const page = new TestPage();
        expect(page.z.get()).toBe(43);
        page.x.set(100);
        expect(page.z.get()).toBe(101);
        page.y.set(2);
        expect(page.z.get()).toBe(102);
        page.x.clear();
        expect(page.z.get()).toBe(44);
        page.y.clear();
        expect(page.z.get()).toBe(43);
    });

    it("nodes chains behaves transparently", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.cache(() => this.x.get() + 1);
            readonly z = this.cache(() => this.y.get() * 3);
        }

        const page = new TestPage();
        expect(page.z.get()).toBe(129);
        page.x.set(100);
        expect(page.z.get()).toBe(303);
        page.x.clear();
        expect(page.z.get()).toBe(129);
    });

});
