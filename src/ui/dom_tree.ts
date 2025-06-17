import invariant from "tiny-invariant"
import { UIElement } from "./ui_element"

export class DomTree {
    readonly tag: string
    readonly attrs: string[]
    readonly children: (string | DomTree | UIElement)[]

    constructor(
        tag: string,
        attrs: string[] = [],
        children: (string | DomTree | UIElement)[] = []
    ) {
        invariant(attrs.length % 2 === 0, "Attributes must be in key-value pairs")
        this.tag = tag
        this.attrs = attrs
        this.children = children
    }

    collect(children: UIElement[]): void {
        for (const child of this.children) {
            if (child instanceof DomTree) {
                child.collect(children)
            } else if (child instanceof UIElement) {
                children.push(child)
            }
        }
    }

    build(mapping: Map<UIElement, HTMLElement>): HTMLElement {
        const element = document.createElement(this.tag)
        for (let i = 0; i < this.attrs.length; i += 2) {
            const key = this.attrs[i]
            const value = this.attrs[i + 1]
            element.setAttribute(key, value)
        }
        for (const child of this.children) {
            if (typeof child === "string") {
                element.appendChild(document.createTextNode(child))
            } else if (child instanceof DomTree) {
                element.appendChild(child.build(mapping))
            } else if (child instanceof UIElement) {
                const childElement = mapping.get(child)
                if (childElement) {
                    element.appendChild(childElement)
                }
            }
        }
        return element
    }
}
