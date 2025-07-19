import { cell, node, snapshot, type Cell } from "../core"
import type { ToCell } from "../core/page"
import { newId } from "./id_gen"
import { type UIPiece } from "./ui_piece"

export class UIRadioButton implements UIPiece {
  readonly text: string
  readonly group: string
  readonly checked: Cell<boolean>

  constructor(
    text: string,
    group: string,
    checked: Cell<boolean>
  ) {
    this.text = text
    this.group = group
    this.checked = checked
  }

  private readonly cache = node(() => this.checked())

  readonly html = node(() => {
    const id = newId()
    const html = document.createElement("div")
    html.className = "fluor-radio-button"

    const input = document.createElement("input")
    input.id = id.toString()
    input.name = this.group
    input.type = "radio"

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

    html.appendChild(input)

    const label = document.createElement("label")
    label.htmlFor = id.toString()
    label.textContent = this.text
    html.appendChild(label)

    return html
  })

  private refresh() {
    const html = this.html().children[0] as HTMLInputElement
    if (html.checked !== this.cache()) {
      html.checked = this.cache()
    }
  }
}

///////

export interface UIRadioButtonArgs {
    text: string,
    group: string,
    checked: ToCell<boolean>
}

export function radioButton(args: UIRadioButtonArgs) {
  return new UIRadioButton(
    args.text,
    args.group,
    cell(args.checked)
  )
}
