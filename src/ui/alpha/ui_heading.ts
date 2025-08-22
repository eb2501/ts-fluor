import { attach, OneWayPipe, type Get, once, view } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement } from "../ui_element"

export type UIHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6

class UIHeading extends UIBlockElement {
  private readonly level: UIHeadingLevel
  private readonly text: Get<string>

  constructor(level: UIHeadingLevel, text: ToGet<string>) {
    super()
    this.level = level
    this.text = toGet(text)
  }

  readonly html = once(() => {
    const h = document.createElement(`h${this.level}`)
    h.className = `fluor-uiH${this.level}`

    const textTarget = view(
      () => h.textContent,
      (value) => h.textContent = value
    )

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

export function uiH1(text: ToGet<string>): UIElement<"block"> {
  return new UIHeading(1, text)
}

export function uiH2(text: ToGet<string>): UIElement<"block"> {
  return new UIHeading(2, text)
}

export function uiH3(text: ToGet<string>): UIElement<"block"> {
  return new UIHeading(3, text)
}

export function uiH4(text: ToGet<string>): UIElement<"block"> {
  return new UIHeading(4, text)
}

export function uiH5(text: ToGet<string>): UIElement<"block"> {
  return new UIHeading(5, text)
}

export function uiH6(text: ToGet<string>): UIElement<"block"> {
  return new UIHeading(6, text)
}
