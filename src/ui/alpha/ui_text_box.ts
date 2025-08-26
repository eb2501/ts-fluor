import { UIElement, UIInlineElement } from '../ui_element'
import { OneWayPipe, TwoWayPipe } from '../../core/pipe'
import { attach } from '../../core/attach'
import { once, touch, view, type Get, type Mem } from '../../core'
import { type UILabelTargetMixin } from './ui_label'
import { newId } from '../id_gen'
import { toGet, toMem, type ToGet, type ToMem } from '../convert'

class UITextBox
  extends UIInlineElement
  implements UILabelTargetMixin
{
  private readonly text: Mem<string>
  private readonly live?: boolean
  private readonly placeholder?: Get<string>

  constructor(
    text: ToMem<string>,
    live?: boolean,
    placeholder?: ToGet<string>,
  ) {
    super()
    this.text = toMem(text)
    this.live = live
    this.placeholder = placeholder ? toGet(placeholder) : undefined
  }

  readonly id = once(() => newId().toString())

  readonly html = once(() => {
    const input = document.createElement('input')
    input.id = this.id()
    input.className = "fluor-uiTextBox"
    input.type = 'text'

    if (this.placeholder !== undefined) {
      const placeholderTarget = view(
        () => input.placeholder,
        (value) => input.placeholder = value
      )

      attach(
        input,
        new OneWayPipe(
          this.placeholder,
          placeholderTarget,
        )
      )
    }

    const textTarget = touch(view(
      () => input.value,
      (value) => input.value = value,
    ))
    if (this.live ?? false) {
      input.addEventListener('input', () => textTarget.touch())
    } else {
      input.onchange = () => textTarget.touch()
    }

    attach(
      input,
      new TwoWayPipe(
        this.text,
        textTarget,
      )
    )

    return input
  })
}

///////

export function uiTextBox({
  text,
  live,
  placeholder,
}: {
  text: ToMem<string>,
  live?: boolean,
  placeholder?: ToGet<string>,
}): UIElement<"inline"> & UILabelTargetMixin {
  return new UITextBox(text, live, placeholder)
}
