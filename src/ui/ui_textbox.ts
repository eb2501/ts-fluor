import { UIPiece } from './ui_piece'
import { cell, type Cell, type ToCell } from '../core/page'
import type { Assembler } from './assembler'

export class UITextBox extends UIPiece {
  readonly value: Cell<string>
  readonly placeholder?: string

  constructor(
    value: Cell<string>,
    placeholder?: string,
  ) {
    super()
    this.value = value
    this.placeholder = placeholder
  }

  attach(html: HTMLElement): void {
    super.attach(html)
    const input = html as HTMLInputElement
    input.onchange = (_: Event) => {
      this.value(input.value)
    }
  }
  
  detach(html: HTMLElement): void {
    super.detach(html)
    const input = html as HTMLInputElement
    input.onchange = null
  }

  render<T>(assembler: Assembler<T>): T {
    const attrs: Record<string, string> = {
      class: 'fluor-textbox',
      type: 'text',
      value: this.value(),
    }
    if (this.placeholder) {
      attrs.placeholder = this.placeholder
    }
    return assembler.node(
      'input',
      attrs,
      []
    )
  }
}

///////

export interface UITextBoxArgs {
  value: ToCell<string>
  placeholder?: string
}

export function textbox(args: UITextBoxArgs) {
  return new UITextBox(
    cell(args.value),
    args.placeholder
  )
}
