import { UIElement, type UIType } from "../ui_element"
import { node, type Get, attach, OneWayPipe } from "../../core"
import { toGet, type ToGet } from "../convert"

class UIClasses<T extends UIType> extends UIElement<T> {
  private readonly content: Get<UIElement<T>>
  private readonly classes: Get<string[]>

  constructor(content: Get<UIElement<T>>, classes: Get<string[]>) {
    super()
    this.content = content
    this.classes = classes
  }

  type(): T {
    return this.content().type()
  }

  readonly html = node(() => {
    const tag = this.type() === "block" ? "div" : "span"
    const html = document.createElement(tag)

    //
    // Classes
    //

    const classesSource = () => ["fluor-uiClasses", ...this.classes()]

    const classesTarget = (value?: string[]) => {
      if (value === undefined) {
        return Array.from(html.classList)
      } else {
        html.className = value.join(" ")
        return value
      }
    }

    attach(
      html,
      new OneWayPipe(
        classesSource,
        classesTarget
      )
    )

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

export interface UIClassesArgs<T extends UIType> {
  content: ToGet<UIElement<T>>
  classes: ToGet<string[]>
}

export function uiClasses<T extends UIType>(
  args: UIClassesArgs<T>
): UIElement<T> {
  return new UIClasses(
    toGet(args.content),
    toGet(args.classes)
  )
}
