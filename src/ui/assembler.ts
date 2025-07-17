import type { UIPiece } from "./ui_piece"

export interface Assembler<T> {
  child(piece: UIPiece): T
  text(text: string): T
  node(
    tag: string,
    attrs: Record<string, string>,
    children: T[]
  ): T
}
