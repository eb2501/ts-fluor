import { type Mem, TwoWayPipe, attach, touch, once, view } from "../../core"
import { UIElement, UIInlineElement } from "../ui_element"
import { type UILabelTargetMixin } from "./ui_label"
import { newId } from "../id_gen"
import { toMem, type ToMem } from "../convert"

class UICheckBox
  extends UIInlineElement
  implements UILabelTargetMixin
{
  private readonly checked: Mem<boolean>

  constructor(
    checked: ToMem<boolean>
  ) {
    super()
    this.checked = toMem(checked)
  }

  readonly id = once(() => newId().toString())

  readonly html = once(() => {
    const input = document.createElement("input")
    input.id = this.id()
    input.className = "fluor-uiCheckBox"
    input.type = "checkbox"

    const checkedTarget = touch(view(
      () => input.checked,
      (value) => input.checked = value
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

export function uiCheckBox(
  checked: ToMem<boolean>
): UIElement<"inline"> & UILabelTargetMixin {
  return new UICheckBox(checked)
}
