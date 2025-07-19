import { node } from "../core"
import { type UIPiece } from "./ui_piece"

export class UIPara implements UIPiece {
  readonly text: string

  constructor(text: string) {
    this.text = text
  }

  readonly html = node(() => {
    const html = document.createElement("p")
    html.className = "fluor-para"
    html.textContent = this.text
    return html
  })
}

///////

export interface UIParaArgs {
  text: string
}

export function para(args: UIParaArgs) {
  return new UIPara(args.text)
}
