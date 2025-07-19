import { node } from "../core"
import { type Size } from "./common"
import { type UIPiece } from "./ui_piece"

export type GridSize = Size | `${number}fr` | "auto"

export class UIGrid implements UIPiece {
  readonly items: UIPiece[][]
  readonly columns?: GridSize[]
  readonly rows?: GridSize[]
  readonly gap?: Size

  constructor(
    items: UIPiece[][],
    columns?: GridSize[],
    rows?: GridSize[],
    gap?: Size
  ) {
    this.items = items
    this.columns = columns
    this.rows = rows
    this.gap = gap
  }

  readonly html = node(() => {
    const html = document.createElement("div")
    html.className = "fluor-grid"
    html.style.display = "grid"
    if (this.columns) {
      html.style.gridTemplateColumns = this.columns.join(" ")
    }
    if (this.rows) {
      html.style.gridTemplateRows = this.rows.join(" ")
    }
    if (this.gap) {
      html.style.gap = this.gap.toString()
    }
    this.items.forEach(row => html.append(...row.map(item => item.html())))
    return html
  })
}

///////

export interface UIGridArgs {
  items: UIPiece[][]
  columns?: GridSize[]
  rows?: GridSize[]
  gap?: Size
}

export function grid(args: UIGridArgs) {
  return new UIGrid(
    args.items,
    args.columns,
    args.rows,
    args.gap
  )
}
