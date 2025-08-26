import { attach, once, OneWayPipe, view, type Get, type Once } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, UIInlineElement } from "../ui_element"

export interface UILabelTargetMixin {
  readonly id: Once<string>
}

///////

class UILabel extends UIInlineElement {
  private readonly target: UILabelTargetMixin
  private readonly text: Get<string>

  constructor(target: UILabelTargetMixin, text: ToGet<string>) {
    super()
    this.target = target
    this.text = toGet(text)
  }

  readonly html = once(() => {
    const label = document.createElement("label")
    label.className = "fluor-uiLabel"
    label.htmlFor = this.target.id()

    const textTarget = view(
      () => label.textContent,
      (value) => label.textContent = value
    )

    attach(
      label,
      new OneWayPipe(
        this.text,
        textTarget
      )
    )
    
    return label
  })
}

///////

export function uiLabel({
  target,
  text
}: {
  target: UILabelTargetMixin,
  text: ToGet<string>
}): UIElement<"inline"> {
  return new UILabel(target, text)
}
