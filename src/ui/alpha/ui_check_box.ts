import { node, type Mem, TwoWayPipe, tracker, attach } from "../../core"
import { UIInlineElement } from "../ui_element"
import { toMem, type ToMem } from "../convert"
import { type UILabelTargetMixin } from "./ui_label"
import { newId } from "../id_gen"

class UICheckBox
  extends UIInlineElement
  implements UILabelTargetMixin
{
  private readonly checked: Mem<boolean>

  constructor(
    checked: Mem<boolean>
  ) {
    super()
    this.checked = checked
  }

  readonly id = node(() => {
    return newId().toString()
  })

  readonly html = node(() => {
    const input = document.createElement("input")
    input.id = this.id()
    input.className = "fluor-uiCheckBox"
    input.type = "checkbox"

    const checkedTarget = tracker(
      input.checked,
      (value: boolean) => input.checked = value,
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

export interface UICheckBoxArgs {
  checked: ToMem<boolean>
}

export function uiCheckBox(args: UICheckBoxArgs): UIInlineElement & UILabelTargetMixin {
  return new UICheckBox(
    toMem(args.checked)
  )
}
