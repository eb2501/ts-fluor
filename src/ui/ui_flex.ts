import type { ToNode } from "../core/page"
import { type Size } from "./common"
import { DomPiece } from "./dom_piece"
import { UIView } from "./ui_view"
import { node, type Node } from "../core/page"

export type FlexDirection = "row" | "column"
export type FlexAlign = "start" | "center" | "end" | "stretch"
export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly"

///////

class FlexDomPiece extends DomPiece {
  constructor(flex: UIFlex) {
    super(flex.id)
    if (flex.align) {
      this.dynStyleAttrs.push("align-items", flex.align())
    }
    flex.children().forEach(child => this.dynChildren.push(child.id))
    if (flex.direction) {
      this.dynStyleAttrs.push("flex-direction", flex.direction())
    }
    if (flex.gap) {
      this.dynStyleAttrs.push("gap", flex.gap())
    }
    if (flex.justify) {
      this.dynStyleAttrs.push("justify-content", flex.justify())
    }
  }

  initHtml(): HTMLElement {
    const html = document.createElement("div")
    html.id = `fluor-id-${this.id}`
    html.classList.add("fluor-flex")
    html.style.display = "flex"
    return html
  }
}

///////

export class UIFlex extends UIView {
  readonly align: Node<FlexAlign> | null
  readonly children: Node<UIView[]>
  readonly direction: Node<FlexDirection> | null
  readonly gap: Node<Size> | null
  readonly justify: Node<FlexJustify> | null

  constructor(
    align: Node<FlexAlign> | null,
    children: Node<UIView[]>,
    direction: Node<FlexDirection> | null,
    gap: Node<Size> | null,
    justify: Node<FlexJustify> | null,
  ) {
    super()
    this.align = align
    this.children = children
    this.direction = direction
    this.gap = gap
    this.justify = justify
  }

  private readonly rootPiece = node(() => new FlexDomPiece(this))

  collect(pieces: DomPiece[]): void {
    this.children().forEach(child => child.collect(pieces))
    pieces.push(this.rootPiece())
  }
}

///////

export interface UIFlexArgs {
  align?: ToNode<FlexAlign>
  children: ToNode<UIView[]>
  direction?: ToNode<FlexDirection>
  gap?: ToNode<Size>
  justify?: ToNode<FlexJustify>
}

export function flex(args: UIFlexArgs) {
  return new UIFlex(
    args.align !== undefined ? node(args.align) : null,
    node(args.children),
    args.direction !== undefined ? node(args.direction) : null,
    args.gap !== undefined ? node(args.gap) : null,
    args.justify !== undefined ? node(args.justify) : null
  )
}
