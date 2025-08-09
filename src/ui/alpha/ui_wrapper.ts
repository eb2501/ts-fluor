import { attach, node, OneWayPipe, type Get } from "../../core"
import { toGet, type ToGet } from "../convert"
import { UIElement, type UIType } from "../ui_element"

class UIWrapperElement<T extends UIType> extends UIElement<T> {
  private readonly content: Get<UIElement<T>>
  private readonly name: string

  constructor(content: Get<UIElement<T>>, name: string) {
    super()
    this.content = content
    this.name = name
  }

  type(): T {
    return this.content().type()
  }

  readonly html = node(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)
    html.className = this.name

    //
    // Content
    //

    const childrenSource = () => [this.content().html()]

    const childrenTarget = (value?: HTMLElement[]) => {
      if (value === undefined) {
        return Array.from(html.children).map(c => c as HTMLElement)
      } else {
        html.replaceChildren(...value)
        return value
      }
    }

    attach(
      html,
      new OneWayPipe(
        childrenSource,
        childrenTarget
      )
    )

    return html
  })
}

///////

export type UIWrapperArgs<T extends UIType> = {
  content: ToGet<UIElement<T>>,
  name: string
}

export function uiWrapper<T extends UIType>(
  args: UIWrapperArgs<T>
): UIElement<T> {
  return new UIWrapperElement(
    toGet(args.content),
    args.name
  )
}
