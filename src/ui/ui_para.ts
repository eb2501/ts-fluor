import { type Node, type ToNode } from "../core/page"
import { DomElement } from "./dom_element"
import type { Size } from "./common"
import { UIView } from "./ui_view"


export interface UIParaArgs {
  text?: ToNode<string>
  size?: ToNode<Size>
}

export class UIPara extends UIView {
  private readonly text: Node<string> | null
  private readonly size: Node<Size> | null

  constructor(args: UIParaArgs = {}) {
    super()
    this.text = args.text !== undefined ? this.node(args.text) : null
    this.size = args.size !== undefined ? this.node(args.size) : null
  }

  readonly dom = this.node(() => {
    const styles: string[] = []
    const children: string[] = []
    if (this.size) {
      styles.push("font-size", this.size())
    }
    if (this.text) {
      children.push(this.text())
    }
    return new DomElement(
      this.id,
      "p",
      ["fluor-para"],
      null,
      null,
      styles,
      null,
      null,
      children
    )
  })

  collect(doms: DomElement[]): void {
    doms.push(this.dom())
  }
}
