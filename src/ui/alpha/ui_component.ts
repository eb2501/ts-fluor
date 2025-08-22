import { once, type Once } from "../../core"
import { UIElement, type UIType } from "../ui_element"

export abstract class UIComponent<T extends UIType> extends UIElement<T> {
  private readonly name: string

  constructor(name: string) {
    super()
    this.name = name
  }

  readonly type = once(() => this.element().type())

  abstract readonly element: Once<UIElement<T>>

  readonly html = once(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = `fluor-${this.name}`
    html.appendChild(this.element().html())
    return html
  })
}
