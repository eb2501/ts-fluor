import type { ToNode } from "../core"
import { DomElement } from "./dom_element"
import { UIView } from "./ui_view"
import type { Node } from "../core"
import type { Size } from "./common"
import { newId } from "./id_gen"

export type FlexDirection = "row" | "column"

export type FlexAlign = "start" | "center" | "end" | "stretch"

export type FlexJustify = "start" | "center" | "end" | "between" | "around" | "evenly"

export interface UIFlexArgs {
  children: ToNode<UIView[]>
  direction?: ToNode<FlexDirection>
  align?: ToNode<FlexAlign>
  justify?: ToNode<FlexJustify>
  gap?: ToNode<Size>
}

export class UIFlex extends UIView {
  readonly children: Node<UIView[]>
  readonly direction: Node<FlexDirection> | null
  readonly align: Node<string> | null
  readonly justify: Node<string> | null
  readonly gap: Node<Size> | null

  constructor(args: UIFlexArgs) {
    super()
    this.children = this.node(args.children)
    this.direction = args.direction !== undefined ? this.node(args.direction) : null
    this.align = args.align !== undefined ? this.node(args.align) : null
    this.justify = args.justify !== undefined ? this.node(args.justify) : null
    this.gap = args.gap !== undefined ? this.node(args.gap) : null
  }

  private readonly rootDom = this.node(() => {
    const styles: string[] = []
    if (this.direction) {
      styles.push("flex-direction", this.direction())
    }
    if (this.align) {
      styles.push("align-items", this.align())
    }
    if (this.justify) {
      styles.push("justify-content", this.justify())
    }
    if (this.gap) {
      styles.push("gap", this.gap())
    }
    return new DomElement(
      this.id,
      "div",
      ["fluor-flex"],
      null,
      ['display', 'flex'],
      styles,
      null,
      null,
      this.children().map(child => child.id)
    )
  })

  collect(doms: DomElement[]): void {
    this.children().forEach(child => child.collect(doms))
    doms.push(this.rootDom())
  }
}

export function flex(args: UIFlexArgs) {
  return new UIFlex(args)
}
