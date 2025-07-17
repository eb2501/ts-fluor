import type { Assembler } from "./assembler"
import { UIPiece } from "./ui_piece"

export class UIGroup extends UIPiece {
  readonly content: UIPiece
  readonly legend?: string

  constructor(
    content: UIPiece,
    legend?: string,
  ) {
    super()
    this.content = content
    this.legend = legend
  }

  render<T>(assembler: Assembler<T>): T {
    const children = [assembler.child(this.content)]
    if (this.legend) {
      children.push(
        assembler.node(
          "legend",
          {
            "class": "fluor-group-legend"
          },
          [assembler.text(this.legend)]
        )
      )
    }
    return assembler.node(
      "fieldset",
      {
        "class": "fluor-group"
      },
      children
    )
  }
}

///////

export interface UIGroupArgs {
  content: UIPiece
  legend?: string
}

export function group(args: UIGroupArgs) {
  return new UIGroup(args.content, args.legend)
}
