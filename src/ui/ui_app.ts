import invariant from "tiny-invariant";
import type { Ticket } from "../core/ticket";
import type { UIElement } from "./ui_element";

export class UIApp implements Ticket {
    private readonly anchor: HTMLElement
    private root: UIElement | null = null
    private htmls: Map<UIElement, HTMLElement> = new Map()
    private versions: Map<UIElement, number> = new Map()
    private timeout: number | null = null;

    constructor(id: string, root: UIElement) {
        const anchor = document.getElementById(id);
        if (!anchor) {
            throw new Error(`Element with id [${id}] not found`)
        }
        this.anchor = anchor
        this.root = root

        const htmls = new Map<UIElement, HTMLElement>()
        const versions = new Map<UIElement, number>()
        this.build(htmls, versions, false, root);
        this.integrate(htmls)
        this.htmls = htmls
        this.versions = versions

        const html = htmls.get(root)
        invariant(html, "Root element should have an HTMLElement representation")
        this.anchor.appendChild(html);
    }

    private listen(cached: boolean): void {
        if (this.timeout === null && !cached) {
            this.timeout = window.setTimeout(this.refresh, 0)
        }
    }

    private refresh(): void {
        invariant(this.root, "Root element should not be null")
        const htmls = new Map<UIElement, HTMLElement>()
        const versions = new Map<UIElement, number>()
        this.build(htmls, versions, true, this.root);
        this.integrate(htmls);
        this.htmls = htmls
        this.versions = versions
        this.timeout = null
    }

    private integrate(htmls: Map<UIElement, HTMLElement>): void {
        // Deactivate elements that are no longer present in the tree
        for (const element of this.htmls.keys()) {
            if (!htmls.has(element)) {
                element.tree.removeListener(this.listen)
                element.onHide()
            }
        }

        // Activate new elements and update mapping
        for (const element of htmls.keys()) {
            if (!this.htmls.has(element)) {
                element.tree.addListener(this.listen)
                element.onShow()
            }
        }
    }

    private shouldRebuild(element: UIElement): boolean {
        const version = this.versions.get(element);
        if (version === undefined) {
            return true
        } else {
            return element.version() !== version
        }
    }

    private build(
        htmls: Map<UIElement, HTMLElement>,
        versions: Map<UIElement, number>,
        replace: boolean,
        element: UIElement
    ): void {
        const rebuild = this.shouldRebuild(element)

        element.children().forEach(childElement => this.build(
            htmls,
            versions,
            !rebuild,
            childElement
        ))

        if (rebuild) {
            const newHtml = element.tree().build(htmls)
            htmls.set(element, newHtml)
            versions.set(element, element.version())
            if (replace) {
                const oldHtml = this.htmls.get(element)
                invariant(oldHtml, "Element should have a cached HTML representation")
                oldHtml.replaceWith(newHtml)
            }
        } else {
            const html = this.htmls.get(element)
            invariant(html, "Element should have a cached HTML representation")
            htmls.set(element, html)

            const version = this.versions.get(element)
            invariant(version !== undefined, "Element should have a cached version")
            versions.set(element, version)
        }
    }

    burn(): void {
        this.integrate(new Map())
        this.htmls.clear()
        this.versions.clear()
        this.root = null
        this.anchor.innerHTML = ''
        if (this.timeout !== null) {
            window.clearTimeout(this.timeout)
            this.timeout = null
        }
    }
}
