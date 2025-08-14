import { node, type Get } from "../../core"
import { UIElement, type UIType } from "../ui_element"

export abstract class UIComponent<T extends UIType> extends UIElement<T> {
  private readonly name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  type(): T {
    return this.element().type()
  }

  abstract readonly element: Get<UIElement<T>>

  readonly html = node(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = `fluor-${this.name}`
    html.appendChild(this.element().html())
    return html
  })
}
