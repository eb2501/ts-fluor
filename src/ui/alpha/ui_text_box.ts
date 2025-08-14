import { UIInlineElement } from '../ui_element'
import { tracker } from '../../core/tracker'
import { OneWayPipe, TwoWayPipe } from '../../core/pipe'
import { attach } from '../../core/attach'
import { node, type Get, type Mem } from '../../core'
import { toGet, toMem, type ToGet, type ToMem } from '../convert'
import { type UILabelTargetMixin } from './ui_label'
import { newId } from '../id_gen'

class UITextBox
  extends UIInlineElement
  implements UILabelTargetMixin
{
  private readonly live: boolean
  private readonly placeholder: Get<string>
  private readonly text: Mem<string>

  constructor(
    live: boolean,
    placeholder: Get<string>,
    text: Mem<string>
  ) {
    super()
    this.live = live
    this.placeholder = placeholder
    this.text = text
  }

  readonly id = node(() => {
    return newId().toString()
  })

  readonly html = node(() => {
    const input = document.createElement('input')
    input.id = this.id()
    input.className = 'fluor-uiTextBox'
    input.type = 'text'

    const placeholderTarget = (value?: string) => {
      if (value === undefined) {
        return input.placeholder
      } else {
        input.placeholder = value
        return value
      }
    }

    attach(
      input,
      new OneWayPipe(
        this.placeholder,
        placeholderTarget,
      )
    )
    
    const textTarget = tracker(
      input.value,
      (value: string) => input.value = value,
    )
    if (this.live) {
      input.addEventListener('input', () => textTarget(input.value))
    } else {
      input.onchange = () => textTarget(input.value)
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

export function uiTextBox(
  live: boolean,
  placeholder: ToGet<string>,
  text: ToMem<string>
): UIInlineElement & UILabelTargetMixin {
  return new UITextBox(
    live,
    toGet(placeholder),
    toMem(text)
  )
}
