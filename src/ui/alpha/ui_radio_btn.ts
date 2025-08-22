import { type Mem, attach, TwoWayPipe, once, view, touch } from "../../core"
import { toMem, type ToMem } from "../convert"
import { newId } from "../id_gen"
import { UIElement, UIInlineElement } from "../ui_element"
import { type UILabelTargetMixin } from "./ui_label"

class UIRadioButton
  extends UIInlineElement
  implements UILabelTargetMixin
{
  private readonly group: string
  private readonly checked: Mem<boolean>

  constructor(
    group: string,
    checked: ToMem<boolean>,
  ) {
    super()
    this.group = group
    this.checked = toMem(checked)
  }

  readonly id = once(() => newId().toString())

  readonly html = once(() => {
    const input = document.createElement("input")
    input.id = this.id()
    input.className = "fluor-uiRadioButton"
    input.name = this.group
    input.type = "radio"

    const checkedTarget = touch(view(
      () => input.checked,
      (value: boolean) => input.checked = value
    ))
    input.onchange = () => checkedTarget.touch()

    attach(
      input,
      new TwoWayPipe(
        this.checked,
        checkedTarget,
      )
    )

    return input
  })
}

///////

export function uiRadioButton(
  group: string,
  checked: ToMem<boolean>,
): UIElement<"inline"> {
  return new UIRadioButton(group, checked)
}
