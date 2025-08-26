import { attach } from "../../core/attach"
import type { Get } from "../../core/basic"
import { once } from "../../core/cache"
import { OneWayPipe } from "../../core/pipe"
import { view } from "../../core/view"
import { UIInlineElement } from "../ui_element"


class UIButton extends UIInlineElement {
  private readonly text: Get<string>
  private readonly action: () => void

  constructor(text: Get<string>, action: () => void) {
    super()
    this.text = text
    this.action = action
  }

  readonly html = once(() => {
    const button = document.createElement("button")
    button.className = "fluor-uiButton"

    const textTarget = view(
      () => button.value,
      (value) => button.value = value
    )

    attach(
      button,
      new OneWayPipe(
        this.text,
        textTarget
      )
    )

    button.onclick = this.action
    return button
  })
}

///////

export function uiButton({
  text,
  action
}: {
  text: Get<string>,
  action: () => void
}) {
  return new UIButton(text, action)
}
