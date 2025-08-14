import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIInlineElement } from "../ui_element"

export interface UILabelTargetMixin {
  readonly id: Get<string>
}

///////

class UILabel extends UIInlineElement {
  private readonly target: UILabelTargetMixin
  private readonly text: Get<string>

  constructor(target: UILabelTargetMixin, text: Get<string>) {
    super()
    this.target = target
    this.text = text
  }

  readonly html = node(() => {
    const label = document.createElement("label")
    label.htmlFor = this.target.id()

    const textTarget = (value?: string) => {
      if (value === undefined) {
        return label.textContent
      } else {
        label.textContent = value
        return value
      }
    }

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

export type UILabelArgs = {
  target: UILabelTargetMixin,
  text: ToGet<string>
}

export function uiLabel(args: UILabelArgs): UIInlineElement {
  return new UILabel(
    args.target,
    toGet(args.text)
  )
}
