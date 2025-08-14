import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement } from "../ui_element"

export type UIHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

class UIHeading extends UIBlockElement {
  private readonly level: UIHeadingLevel
  private readonly text: Get<string>

  constructor(level: UIHeadingLevel, text: Get<string>) {
    super()
    this.level = level
    this.text = text
  }

  readonly html = node(() => {
    const h = document.createElement(`h${this.level}`)
    h.className = `fluor-uiH${this.level}`

    const textTarget = (value?: string) => {
      if (value === undefined) {
        return h.textContent || ""
      } else {
        h.textContent = value
        return value
      }
    }

    attach(
      h,
      new OneWayPipe(
        this.text,
        textTarget,
      )
    )

    return h
  })
}

///////

export function uiH1(text: ToGet<string>): UIBlockElement {
  return new UIHeading(1, toGet(text))
}

export function uiH2(text: ToGet<string>): UIBlockElement {
  return new UIHeading(2, toGet(text))
}

export function uiH3(text: ToGet<string>): UIBlockElement {
  return new UIHeading(3, toGet(text))
}

export function uiH4(text: ToGet<string>): UIBlockElement {
  return new UIHeading(4, toGet(text))
}

export function uiH5(text: ToGet<string>): UIBlockElement {
  return new UIHeading(5, toGet(text))
}

export function uiH6(text: ToGet<string>): UIBlockElement {
  return new UIHeading(6, toGet(text))
}
