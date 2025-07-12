import type { DomPiece } from "./dom_piece"
import { newId } from "./id_gen"

export abstract class UIView {
  readonly id: number

  constructor() {
    this.id = newId()
  }

  abstract collect(pieces: DomPiece[]): void
}
