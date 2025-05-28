import { Page } from "../src/page";

describe("Page Tests", () => {
    it("cells should behave like read/write properties", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
        }
        
        const xEvents: string[] = [];

        const page = new TestPage();
        
        expect(page.x.get()).toBe(42);
        page.x.set(100);
        expect(page.x.get()).toBe(100);
        page.x.clear();
        expect(page.x.get()).toBe(42);
    });

    it("nodes should behave like regular functions", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.node(() => this.x.get() + 1);
        }

        const page = new TestPage();
        expect(page.y.get()).toBe(43);
        page.x.set(100);
        expect(page.y.get()).toBe(101);
        page.x.clear();
        expect(page.y.get()).toBe(43);
    });

    it("nodes should be sensitive to all the cells they depend on", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.cell(1);
            readonly z = this.node(() => this.x.get() + this.y.get());
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
            readonly y = this.node(() => this.x.get() + 1);
            readonly z = this.node(() => this.y.get() * 3);
        }

        const page = new TestPage();
        expect(page.z.get()).toBe(129);
        page.x.set(100);
        expect(page.z.get()).toBe(303);
        page.x.clear();
        expect(page.z.get()).toBe(129);
    });

});
