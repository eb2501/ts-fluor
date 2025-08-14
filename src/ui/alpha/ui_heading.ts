import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement } from "../ui_element"

export type UIHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

class UIHeading extends UIBlockElement {
  private readonly text: Get<string>
  private readonly level: UIHeadingLevel

  constructor(text: Get<string>, level: UIHeadingLevel) {
    super()
    this.text = text
    this.level = level
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
  return new UIHeading(toGet(text), 1)
}

export function uiH2(text: ToGet<string>): UIBlockElement {
  return new UIHeading(toGet(text), 2)
}

export function uiH3(text: ToGet<string>): UIBlockElement {
  return new UIHeading(toGet(text), 3)
}

export function uiH4(text: ToGet<string>): UIBlockElement {
  return new UIHeading(toGet(text), 4)
}

export function uiH5(text: ToGet<string>): UIBlockElement {
  return new UIHeading(toGet(text), 5)
}

export function uiH6(text: ToGet<string>): UIBlockElement {
  return new UIHeading(toGet(text), 6)
}
