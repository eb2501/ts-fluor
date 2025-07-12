import type { ToNode } from "../core/page"
import { type BoxSize, type Color, type Size } from "./common"
import { DomPiece } from "./dom_piece"
import { UIView } from "./ui_view"
import { node, type Node } from "../core/page"

export type BorderStyle = "solid"
                        | "dashed"
                        | "dotted"
                        | "double"
                        | "groove"
                        | "ridge"
                        | "inset"
                        | "outset"

///////

class BorderDomPiece extends DomPiece {
  constructor(border: UIBorder) {
    super(border.id)
    this.dynChildren.push(border.child().id)
    if (border.color) {
      this.dynStyleAttrs.push("border-color", border.color())
    }
    if (border.margin) {
      this.dynStyleAttrs.push("margin", border.margin())
    }
    if (border.padding) {
      this.dynStyleAttrs.push("padding", border.padding())
    }
    if (border.radius) {
      this.dynStyleAttrs.push("border-radius", border.radius())
    }
    if (border.style) {
      this.dynStyleAttrs.push("border-style", border.style())
    }
    if (border.width) {
      this.dynStyleAttrs.push("border-width", border.width())
    }
  }

  initHtml(): HTMLElement {
    const html = document.createElement("div")
    html.id = `fluor-id-${this.id}`
    html.classList.add("fluor-border")
    return html
  }
}

export class UIBorder extends UIView {
  readonly child: Node<UIView>
  readonly color: Node<Color> | null
  readonly margin: Node<BoxSize> | null
  readonly padding: Node<BoxSize> | null
  readonly radius: Node<Size> | null
  readonly style: Node<BorderStyle> | null
  readonly width: Node<Size> | null

  constructor(
    child: Node<UIView>,
    color: Node<Color> | null,
    margin: Node<BoxSize> | null,
    padding: Node<BoxSize> | null,
    radius: Node<Size> | null,
    style: Node<BorderStyle> | null,
    width: Node<Size> | null
  ) {
    super()
    this.child = child
    this.color = color
    this.margin = margin
    this.padding = padding
    this.radius = radius
    this.style = style
    this.width = width
  }

  private readonly rootPiece = node(() => new BorderDomPiece(this))

  collect(pieces: DomPiece[]): void {
    this.child().collect(pieces)
    pieces.push(this.rootPiece())
  }
}

///////

export interface UIBorderArgs {
  child: ToNode<UIView>
  color?: ToNode<Color>
  margin?: ToNode<BoxSize>
  padding?: ToNode<BoxSize>
  radius?: ToNode<Size>
  style?: ToNode<BorderStyle>
  width?: ToNode<Size>
}

export function border(args: UIBorderArgs) {
  return new UIBorder(
    node(args.child),
    args.color !== undefined ? node(args.color) : null,
    args.margin !== undefined ? node(args.margin) : null,
    args.padding !== undefined ? node(args.padding) : null,
    args.radius !== undefined ? node(args.radius) : null,
    args.style !== undefined ? node(args.style) : null,
    args.width !== undefined ? node(args.width) : null
  )
}
