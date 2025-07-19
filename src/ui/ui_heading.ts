import { node } from "../core"
import type { UIPiece } from "./ui_piece"

export type UIHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

export class UIHeading implements UIPiece {
  readonly text: string
  readonly level: UIHeadingLevel

  constructor(text: string, level: UIHeadingLevel = 1) {
    this.text = text
    this.level = level
  }

  readonly html = node(() => {
    const html = document.createElement(`h${this.level}`)
    html.className = `fluor-heading`
    html.textContent = this.text
    return html
  })
}

///////

export interface UIHeadingArgs {
  text: string
  level: UIHeadingLevel
}

export function h(args: UIHeadingArgs) {
  return new UIHeading(args.text, args.level)
}

export function h1(text: string) {
  return new UIHeading(text, 1)
}

export function h2(text: string) {
  return new UIHeading(text, 2)
}

export function h3(text: string) {
  return new UIHeading(text, 3)
}

export function h4(text: string) {
  return new UIHeading(text, 4)
}

export function h5(text: string) {
  return new UIHeading(text, 5)
}

export function h6(text: string) {
  return new UIHeading(text, 6)
}
