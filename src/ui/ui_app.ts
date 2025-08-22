import type { UIElement, UIType } from "./ui_element"
import type { Ticket } from "../core/ticket"


export class UIApp<T extends UIType> implements Ticket {
  private readonly anchor: HTMLElement
  
  constructor(id: string, root: UIElement<T>) {
    const anchor = document.getElementById(id)
    if (!anchor) {
      throw new Error(`Element with id [${id}] not found`)
    }
    this.anchor = anchor
    this.anchor.replaceChildren(root.html())
  }

  burn() {
    this.anchor.replaceChildren()
  }
}
