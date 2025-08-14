import { type Get, attach, node, OneWayPipe } from "../../core"
import { type Size } from "../common"
import { toGet, type ToGet } from "../convert"
import { UIBlockElement, UIElement, UIMultiContentElement } from "../ui_element"

export type GridSize = Size | `${number}fr` | "auto"

class UIGrid extends UIMultiContentElement<"block"> {
  private readonly rows: GridSize[]
  private readonly columns: GridSize[]

  constructor(
    content: UIElement<"block">[],
    rows: GridSize[],
    columns: GridSize[],
  ) {
    super(content)
    this.rows = rows
    this.columns = columns
  }

  readonly html = node(() => {
    const div = document.createElement("div")
    div.className = "fluor-grid"
    div.style.display = "grid"
    div.style.gridTemplateRows = this.rows.join(" ")
    div.style.gridTemplateColumns = this.columns.join(" ")
    div.replaceChildren(...this.contents.map(c => c.html()))
    return div
  })
}

///////

export interface UIGridArgs {
  content: UIElement<"block">[]
  rows: GridSize[]
  columns: GridSize[]
}

export function uiGrid(args: UIGridArgs): UIElement<"block"> {
  return new UIGrid(
    args.content,
    args.rows,
    args.columns,
  )
}
