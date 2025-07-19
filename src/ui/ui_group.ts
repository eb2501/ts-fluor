import { node } from "../core"
import { type UIPiece } from "./ui_piece"

export class UIGroup implements UIPiece {
  readonly content: UIPiece
  readonly legend?: string

  constructor(
    content: UIPiece,
    legend?: string,
  ) {
    this.content = content
    this.legend = legend
  }

  readonly html = node(() => {
    const html = document.createElement("fieldset")
    html.className = "fluor-group"
    if (this.legend) {
      const legend = document.createElement("legend")
      legend.className = "fluor-group-legend"
      legend.textContent = this.legend
      html.appendChild(legend)
    }
    html.appendChild(this.content.html())
    return html
  })
}

///////

export interface UIGroupArgs {
  content: UIPiece
  legend?: string
}

export function group(args: UIGroupArgs) {
  return new UIGroup(args.content, args.legend)
}
