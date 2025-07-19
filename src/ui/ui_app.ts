import type { UIPiece } from "./ui_piece"
import type { Ticket } from "../core/ticket"


export class UIApp implements Ticket {
  private readonly anchor: HTMLElement
  
  constructor(id: string, root: UIPiece) {
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
