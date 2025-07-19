import { cell, node, snapshot, type Cell } from "../core"
import type { ToCell } from "../core/page"
import { newId } from "./id_gen"
import { type UIPiece } from "./ui_piece"

export class UICheckBox implements UIPiece {
  readonly checked: Cell<boolean>

  constructor(
    checked: Cell<boolean>
  ) {
    this.checked = checked
  }

  private readonly cache = node(() => this.checked())

  readonly html = node(() => {
    const input = document.createElement("input")
    input.type = "checkbox"

    // Initial UI population
    input.checked = snapshot(() => this.cache())

    // UI -> Model
    input.onchange = () => {
      if (input.checked !== this.checked()) {
        this.checked(input.checked)
      }
    }

    // Model -> UI
    this.cache.addListener((cached: boolean) => {
      if (!cached) {
        setTimeout(() => this.refresh(), 0)
      }
    })

    return input
  })

  private refresh() {
    const html = this.html()
    if (html.checked !== this.cache()) {
      html.checked = this.cache()
    }
  }
}

///////

export interface UICheckBoxArgs {
  checked: ToCell<boolean>
}

export function checkBox(args: UICheckBoxArgs) {
  return new UICheckBox(
    cell(args.checked)
  )
}
