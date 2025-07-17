import { node } from "../core"
import { type Assembler } from "./assembler"
import { newId } from "./id_gen"

class ChildrenAssembler implements Assembler<UIPiece[]> {
  child(piece: UIPiece): UIPiece[] {
    return [piece]
  }
  
  text(_text: string): UIPiece[] {
    return []
  }

  node(
    _tag: string,
    _attrs: Record<string, string>,
    children: UIPiece[][]
  ): UIPiece[] {
    const result = []
    for (const child of children) {
      result.push(...child)
    }
    return result
  }
}

///////

const assembler = new ChildrenAssembler()

///////

export abstract class UIPiece {
  abstract render<T>(assembler: Assembler<T>): T

  attach(_html: HTMLElement): void {}
  detach(_html: HTMLElement): void {}

  readonly children = node(() => this.render(assembler))
  readonly localVersion = node(() => {
    this.children()
    return newId()
  })
  readonly globalVersion = node(() => {
    let result = this.localVersion()
    for (const child of this.children()) {
      result += child.globalVersion()
    }
    return result
  })
}
