import { node, type Node, type ToNode } from "../core/page"
import { DomPiece } from "./dom_piece"
import type { Size } from "./common"
import { UIView } from "./ui_view"


class ParaDomPiece extends DomPiece {
  constructor(para: UIPara) {
    super(para.id)
    if (para.size) {
      this.dynStyleAttrs.push("font-size", para.size())
    }
    if (para.text) {
      this.dynChildren.push(para.text())
    }
  }

  initHtml(): HTMLElement {
    const html = document.createElement("p")
    html.id = `fluor-id-${this.id}`
    html.classList.add("fluor-para")
    return html
  }
}

export class UIPara extends UIView {
  readonly text: Node<string> | null
  readonly size: Node<Size> | null

  constructor(text: Node<string> | null, size: Node<Size> | null) {
    super()
    this.text = text
    this.size = size
  }

  private readonly rootPiece = node(() => new ParaDomPiece(this))

  collect(pieces: DomPiece[]): void {
    pieces.push(this.rootPiece())
  }
}

///////

export interface UIParaArgs {
  text?: ToNode<string>
  size?: ToNode<Size>
}

export function para(args: UIParaArgs = {}) {
  return new UIPara(
    args.text !== undefined ? node(args.text) : null,
    args.size !== undefined ? node(args.size) : null
  )
}
