import { node, type Mem, tracker, attach, TwoWayPipe } from "../../core"
import { toMem, type ToMem } from "../convert"
import { newId } from "../id_gen"
import { UIInlineElement } from "../ui_element"
import { type UILabelTargetMixin } from "./ui_label"

class UIRadioButton
  extends UIInlineElement
  implements UILabelTargetMixin
{
  private readonly group: string
  private readonly checked: Mem<boolean>

  constructor(
    group: string,
    checked: Mem<boolean>,
  ) {
    super()
    this.group = group
    this.checked = checked
  }

  readonly id = node(() => {
    return newId().toString()
  })

  readonly html = node(() => {
    const input = document.createElement("input")
    input.id = this.id()
    input.className = "fluor-uiRadioButton"
    input.name = this.group
    input.type = "radio"

    const checkedTarget = tracker(
      input.checked,
      (value: boolean) => input.checked = value
    )
    input.onchange = () => checkedTarget(input.checked)

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
): UIInlineElement & UILabelTargetMixin {
  return new UIRadioButton(
    group,
    toMem(checked),
  )
}
