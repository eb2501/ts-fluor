import { OneWayPipe } from "../../core"
import { attach } from "../../core/attach"
import type { Get } from "../../core/basic"
import { once } from "../../core/cache"
import { view } from "../../core/view"
import { UIInlineElement, type UIElement } from "../ui_element"


class UIText extends UIInlineElement {
  private readonly text: Get<string>

  constructor(text: Get<string>) {
    super()
    this.text = text
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
        textTarget
      )
    )

    return span
  })
}

///////

export function uiText(text: Get<string>): UIElement<"inline"> {
  return new UIText(text)
}
