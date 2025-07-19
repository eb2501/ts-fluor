import { type UIPiece } from './ui_piece'
import { cell, node, type Cell, type ToCell } from '../core/page'
import { snapshot } from '../core'

export class UITextBox implements UIPiece {
  readonly text: Cell<string>
  readonly placeholder?: string

  constructor(
    text: Cell<string>,
    placeholder?: string,
  ) {
    this.text = text
    this.placeholder = placeholder
  }

  private readonly cache = node(() => this.text())

  readonly html = node(() => {
    const html = document.createElement('input')
    html.className = 'fluor-textbox'
    html.type = 'text'
    if (this.placeholder) {
      html.placeholder = this.placeholder
    }

    // Initial UI population
    html.value = snapshot(() => this.cache())

    // UI -> Model
    html.onchange = () => {
      if (html.value !== this.text()) {
        this.text(html.value)
      }
    }

    // Model -> UI
    this.cache.addListener((cached: boolean) => {
      if (!cached) {
        setTimeout(() => this.refresh(), 0)
      }
    })

    return html
  })

  private refresh() {
    const html = this.html()
    if (html.value !== this.cache()) {
      html.value = this.cache()
    }
  }
}

///////

export interface UITextBoxArgs {
  value: ToCell<string>
  placeholder?: string
}

export function textBox(args: UITextBoxArgs) {
  return new UITextBox(
    cell(args.value),
    args.placeholder
  )
}
