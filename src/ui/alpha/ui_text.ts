import { attach, once, OneWayPipe, view, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, UIInlineElement } from "../ui_element"

class UIText extends UIInlineElement {
  private readonly text: Get<string>

  constructor(text: ToGet<string>) {
    super()
    this.text = toGet(text)
  }

  readonly html = once(() => {
    const span = document.createElement("span")
    span.className = "fluor-uiText"

    const textTarget = view(
      () => span.textContent,
      (value) => span.textContent = value
    )

    attach(
      span,
      new OneWayPipe(
        this.text,
        textTarget,
      )
    )

    return span
  })
}

///////

export function uiText(text: ToGet<string>): UIElement<"inline"> {
  return new UIText(text)
}
