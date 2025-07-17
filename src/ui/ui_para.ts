import type { Assembler } from "./assembler"
import { UIPiece } from "./ui_piece"

export class UIPara extends UIPiece {
  readonly text: string

  constructor(text: string) {
    super()
    this.text = text
  }

  render<T>(assembler: Assembler<T>): T {
    return assembler.node(
      "p",
      {
        "class": "fluor-para"
      },
      [
        assembler.text(this.text)
      ]
    )
  }
}

///////

export interface UIParaArgs {
  text: string
}

export function para(args: UIParaArgs) {
  return new UIPara(args.text)
}
