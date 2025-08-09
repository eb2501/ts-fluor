import { node, type Mem, TwoWayPipe, tracker, attach } from "../../core"
import { UIInlineElement } from "../ui_element"
import { toMem, type ToMem } from "../convert"

class UICheckBoxElement extends UIInlineElement {
  private readonly checked: Mem<boolean>

  constructor(
    checked: Mem<boolean>
  ) {
    super()
    this.checked = checked
  }

  readonly html = node(() => {
    const input = document.createElement("input")
    input.className = "fluor-uiCheckBox"
    input.type = "checkbox"

    //
    // Checked
    //

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

export function uiCheckBox(args: UICheckBoxArgs): UIInlineElement {
  return new UICheckBoxElement(
    toMem(args.checked)
  )
}
