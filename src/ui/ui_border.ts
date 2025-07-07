import type { ToNode } from "../core/page"
import { type BoxSize, type Color, type Size } from "./common"
import { DomElement } from "./dom_element"
import { UIView } from "./ui_view"
import { type Node } from "../core/page"

export type BorderStyle = "solid"
                        | "dashed"
                        | "dotted"
                        | "double"
                        | "groove"
                        | "ridge"
                        | "inset"
                        | "outset"

export interface UIBorderArgs {
  child: ToNode<UIView>
  margin?: ToNode<BoxSize>
  padding?: ToNode<BoxSize>
  color?: ToNode<Color>
  width?: ToNode<Size>
  radius?: ToNode<Size>
  style?: ToNode<BorderStyle>
}

export class UIBorder extends UIView {
  readonly child: Node<UIView>
  readonly margin: Node<BoxSize> | null
  readonly padding: Node<BoxSize> | null
  readonly color: Node<Color> | null
  readonly width: Node<Size> | null
  readonly radius: Node<Size> | null
  readonly style: Node<BorderStyle> | null

  constructor(args: UIBorderArgs) {
    super()
    this.child = this.node(args.child)
    this.margin = args.margin !== undefined ? this.node(args.margin) : null
    this.padding = args.padding !== undefined ? this.node(args.padding) : null
    this.color = args.color !== undefined ? this.node(args.color) : null
    this.width = args.width !== undefined ? this.node(args.width) : null
    this.radius = args.radius !== undefined ? this.node(args.radius) : null
    this.style = args.style !== undefined ? this.node(args.style) : null
  }

  readonly dom = this.node(() => {
    const styles: string[] = []
    if (this.color) {
      styles.push("border-color", this.color())
    }
    if (this.style) {
      styles.push("border-style", this.style())
    }
    if (this.width) {
      styles.push("border-width", this.width())
    }
    if (this.margin) {
      styles.push("margin", this.margin())
    }
    if (this.padding) {
      styles.push("padding", this.padding())
    }
    if (this.radius) {
      styles.push("border-radius", this.radius())
    }
    
    return new DomElement(
      this.id,
      "div",
      ["fluor-border"],
      null,
      null,
      styles,
      null,
      null,
      [this.child().id]
    )
  })

  collect(doms: DomElement[]): void {
    this.child().collect(doms)
    doms.push(this.dom())
  }
}
