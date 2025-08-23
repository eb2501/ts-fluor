import { once } from "../../core"
import type { Size } from "../common"
import { UIBlockElement, UIElement } from "../ui_element"


export type UIFlexDir = "row"
                      | "row-rev"
                      | "column"
                      | "column-rev"

export type UIFlexWrap = "no-wrap"
                       | "wrap"
                       | "wrap-rev"

export type UIFlexJustify = "center"
                          | "start"
                          | "end"
                          | "space-around"
                          | "space-between"
                          | "space-evenly"

export type UIFlexAlign = "center"
                        | "start"
                        | "end"
                        | "stretch"
                        | "baseline"
                        | "normal"

export type UIFlexOrganize = "center"
                        | "stretch"
                        | "start"
                        | "end"
                        | "space-around"
                        | "space-between"
                        | "space-evenly"

///////

export class UIFlexItem {
  readonly element: UIElement<"block">
  readonly grow?: number
  readonly shrink?: number
  readonly basis?: Size
  readonly align?: UIFlexAlign

  constructor(
    element: UIElement<"block">,
    grow?: number,
    shrink?: number,
    basis?: Size,
    align?: UIFlexAlign
  ) {
    this.element = element
    this.grow = grow
    this.shrink = shrink
    this.basis = basis
    this.align = align
  }
}

///////

export function uiFlexItem({
  element,
  grow,
  shrink,
  basis,
  align,
}: {
  element: UIElement<"block">,
  grow?: number,
  shrink?: number,
  basis?: Size,
  align?: UIFlexAlign,
}): UIFlexItem {
  return new UIFlexItem(element, grow, shrink, basis, align)
}

///////

class UIFlex extends UIBlockElement {
  private readonly content: (UIElement<"block"> | UIFlexItem)[]
  private readonly dir?: UIFlexDir
  private readonly wrap?: UIFlexWrap
  private readonly justify?: UIFlexJustify
  private readonly align?: UIFlexAlign
  private readonly organize?: UIFlexOrganize

  constructor(
    content: (UIElement<"block"> | UIFlexItem)[],
    dir?: UIFlexDir,
    wrap?: UIFlexWrap,
    justify?: UIFlexJustify,
    align?: UIFlexAlign,
    organize?: UIFlexOrganize
  ) {
    super()
    this.content = content
    this.dir = dir
    this.wrap = wrap
    this.justify = justify
    this.align = align
    this.organize = organize  
  }

  readonly html = once(() => {
    const div = document.createElement("div")
    div.className = "fluor-uiFlex"
    div.style.display = "flex"
    if (this.dir !== undefined) {
      switch (this.dir) {
        case "row-rev":
          div.style.flexDirection = "row-reverse"
          break

        case "column-rev":
          div.style.flexDirection = "column-reverse"
          break

        default:
          div.style.flexDirection = this.dir
      }
    }
    if (this.wrap !== undefined) {
      switch (this.wrap) {
        case "no-wrap":
          div.style.flexWrap = "nowrap"
          break
        case "wrap":
          div.style.flexWrap = "wrap"
          break
        case "wrap-rev":
          div.style.flexWrap = "wrap-reverse"
          break
      }
    }
    if (this.justify !== undefined) {
      switch (this.justify) {
        case "start":
          div.style.justifyContent = "flex-start"
          break

        case "end":
          div.style.justifyContent = "flex-end"
          break

        default:
          div.style.justifyContent = this.justify
      }
    }
    if (this.align !== undefined) {
      switch (this.align) {
        case "start":
          div.style.alignItems = "flex-start"
          break

        case "end":
          div.style.alignItems = "flex-end"
          break

        default:
          div.style.alignItems = this.align
      }
    }
    if (this.organize !== undefined) {
      switch (this.organize) {
        case "start":
          div.style.alignContent = "flex-start"
          break

        case "end":
          div.style.alignContent = "flex-end"
          break

        default:
          div.style.alignContent = this.organize
      }
    }
    for (const item of this.content) {
      let html: HTMLElement
      if (item instanceof UIFlexItem) {
        html = document.createElement("div")
        html.className = "fluor-uiFlexItem"
        if (item.grow !== undefined) {
          html.style.flexGrow = item.grow.toString()
        }
        if (item.shrink !== undefined) {
          html.style.flexShrink = item.shrink.toString()
        }
        if (item.basis !== undefined) {
          html.style.flexBasis = item.basis
        }
        if (item.align !== undefined) {
          switch (item.align) {
            case "start":
              html.style.alignSelf = "flex-start"
              break

            case "end":
              html.style.alignSelf = "flex-end"
              break

            default:
              html.style.alignSelf = item.align
          }
        }
        html.appendChild(item.element.html())
      } else {
        html = item.html()
      }
      div.appendChild(html)
    }
    return div
  })
}

///////

export function uiFlex({
  content,
  dir,
  wrap,
  justify,
  align,
  organize
}: {
  content: (UIElement<"block"> | UIFlexItem)[]
  dir?: UIFlexDir
  wrap?: UIFlexWrap
  justify?: UIFlexJustify
  align?: UIFlexAlign
  organize?: UIFlexOrganize
}) {
  return new UIFlex(content, dir, wrap, justify, align, organize)
}
