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

    it("nodes should behave like regular functions", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.calc(() => this.x.get() + 1);
        }

        const page = new TestPage();

        expect(page.y.get()).toBe(43);

        page.x.set(100);
        expect(page.y.get()).toBe(101);

        page.x.clear();
        expect(page.y.get()).toBe(43);
    });

    it("nodes state should reflect the caching status", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.calc(
                () => this.x.get() + 1,
            );
        }

        const page = new TestPage();
        expect(page.y.cached).toBe(false);

        expect(page.y.get()).toBe(43);
        expect(page.y.cached).toBe(true);

        page.x.set(100);
        expect(page.y.cached).toBe(false);

        expect(page.y.get()).toBe(101);
        expect(page.y.cached).toBe(true);

        page.x.clear();
        expect(page.y.cached).toBe(false);

        expect(page.y.get()).toBe(43);
        expect(page.y.cached).toBe(true);
    });

    it("nodes should be sensitive to all the cells they depend on", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.cell(1);
            readonly z = this.calc(() => this.x.get() + this.y.get());
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
            readonly y = this.calc(() => this.x.get() + 1);
            readonly z = this.calc(() => this.y.get() * 3);
        }

        const page = new TestPage();
        expect(page.z.get()).toBe(129);
        page.x.set(100);
        expect(page.z.get()).toBe(303);
        page.x.clear();
        expect(page.z.get()).toBe(129);
    });

    it("dependencies should be dynamic", () => {
        class TestPage extends Page {
            readonly flag = this.cell(true);
            readonly x = this.cell(42);
            readonly y = this.cell(12);
            readonly z = this.calc(
                () => this.flag.get() ? this.x.get() + this.y.get() : this.x.get() + 1
            );
        }

        const page = new TestPage();
        expect(page.z.get()).toBe(54);

        page.x.set(100);
        expect(page.z.get()).toBe(112);

        page.y.set(50);
        expect(page.z.cached).toBe(false);
        expect(page.z.get()).toBe(150);

        page.flag.set(false);
        expect(page.z.cached).toBe(false);
        expect(page.z.get()).toBe(101);
        expect(page.z.cached).toBe(true);

        page.x.set(130);
        expect(page.z.cached).toBe(false);
        expect(page.z.get()).toBe(131);
        expect(page.z.cached).toBe(true);

        page.y.set(20);
        expect(page.z.cached).toBe(true);
        expect(page.z.get()).toBe(131);

        page.y.clear();
        expect(page.z.cached).toBe(true);
        expect(page.z.get()).toBe(131);

        page.flag.clear();
        expect(page.z.cached).toBe(false);
        expect(page.z.get()).toBe(142);

        page.y.set(20);
        expect(page.z.cached).toBe(false);
        expect(page.z.get()).toBe(150);
    });

    it("views should be completely transparent", () => {
        class TestPage extends Page {
            readonly x = this.cell(42);
            readonly y = this.view(
                () => this.x.get() + 1,
                (value) => this.x.set(value - 1)
            );
        }

        const page = new TestPage();

        expect(page.y.get()).toBe(43);
        page.y.set(100);
        expect(page.x.get()).toBe(99);
        expect(page.y.get()).toBe(100);

        page.x.set(50);
        expect(page.y.get()).toBe(51);
    });

    it("indirection should work as expected", () => {
        class Test1Page extends Page {
            readonly x = this.cell(42);
            readonly y = this.calc(() => this.x.get() + 1);
        }

        class Test2Page extends Page {
            readonly o = this.cell<Test1Page | null>(null)
            readonly z = this.calc(() => {
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

        expect(page2.z.get()).toBe(0);

        page2.o.set(page1);
        expect(page2.z.get()).toBe(86);

        page1.x.set(100);
        expect(page2.z.get()).toBe(202);

        page2.o.set(new Test1Page());
        expect(page2.z.get()).toBe(86);

        page1.x.set(50);
        expect(page2.z.get()).toBe(86);
    });
});
