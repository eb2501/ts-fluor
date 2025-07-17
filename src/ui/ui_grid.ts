import { type Size } from "./common"
import { UIPiece } from "./ui_piece"
import type { Assembler } from "./assembler"

export type GridSize = Size | `${number}fr` | "auto"

export class UIGrid extends UIPiece {
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
    super()
    this.items = items
    this.columns = columns
    this.rows = rows
    this.gap = gap
  }

  render<T>(assembler: Assembler<T>): T {
    const styles = [
      "display: grid"
    ]
    if (this.columns) {
      styles.push(`grid-template-columns: ${this.columns.join(" ")}`)
    }
    if (this.rows) {
      styles.push(`grid-template-rows: ${this.rows.join(" ")}`)
    }
    if (this.gap) {
      styles.push(`gap: ${this.gap.toString()}`)
    }
    const children: T[] = []
    this.items.forEach(row => {
      children.push(...row.map(item => assembler.child(item)))
    })
    return assembler.node(
      "div",
      {
        "class": "fluor-grid",
        "style": styles.join("; "),
      },
      children
    )
  }
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
