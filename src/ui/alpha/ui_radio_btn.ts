import { node, type Mem, tracker, attach, TwoWayPipe } from "../../core"
import { toMem, type ToMem } from "../convert"
import { UIInlineElement } from "../ui_element"

class UIRadioButtonElement extends UIInlineElement {
  private readonly checked: Mem<boolean>
  private readonly group: string

  constructor(
    checked: Mem<boolean>,
    group: string,
  ) {
    super()
    this.checked = checked
    this.group = group
  }

  readonly html = node(() => {
    const input = document.createElement("input")
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

export interface UIRadioButtonArgs {
  checked: ToMem<boolean>,
  group: string,
}

export function uiRadioButton(args: UIRadioButtonArgs): UIInlineElement {
  return new UIRadioButtonElement(
    toMem(args.checked),
    args.group,
  )
}
