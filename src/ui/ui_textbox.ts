import { DomPiece } from './dom_piece'
import { UIView } from './ui_view'
import type { ToNode } from '../core'
import type { Node } from '../core'
import { cell, node, type Cell, type ToCell } from '../core/page'

class TextBoxDomPiece extends DomPiece {
  private readonly textbox: UITextBox

  constructor(textbox: UITextBox) {
    super(textbox.id)
    this.textbox = textbox
    this.dynAttrs.push('value', textbox.value())
    if (textbox.placeholder) {
      this.dynAttrs.push('placeholder', textbox.placeholder())
    }
  }

  initHtml(): HTMLElement {
    const html = document.createElement('input')
    html.id = `fluor-id-${this.id}`
    html.classList.add('fluor-textbox')
    html.type = 'text'
    html.onchange = (e: Event) => {
      const text = (e.target as HTMLInputElement).value
      this.textbox.value(text)
    }
    return html
  }
}

export class UITextBox extends UIView {
  readonly value: Cell<string>
  readonly placeholder: Node<string> | null

  constructor(
    placeholder: Node<string> | null,
    value: Cell<string>
  ) {
    super()
    this.value = value
    this.placeholder = placeholder
  }

  readonly rootPiece = node(() => new TextBoxDomPiece(this))

  collect(pieces: DomPiece[]): void {
    pieces.push(this.rootPiece())
  }
}

///////

export interface UITextBoxArgs {
  placeholder?: ToNode<string>
  value: ToCell<string>
}

export function textbox(args: UITextBoxArgs) {
  return new UITextBox(
    args.placeholder !== undefined ? node(args.placeholder) : null,
    cell(args.value)
  )
}
