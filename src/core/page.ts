import { type Read } from "./read"
import { type Write } from "./write"
import { CellReactor, NodeReactor } from "./reactor"
import { Proxy } from "./proxy"
import { quickCache, quickRead, quickWrite, type QuickRead, type QuickWrite } from "./quick"


export type Node<T> = Read<T> & QuickRead<T>
export type Cell<T> = Write<T> & QuickWrite<T>


///

export class Page {
  protected cell<T>(value: T) {
    return quickWrite(new CellReactor(value))
  }

  protected node<T>(getFn: () => T) {
    return quickCache(new NodeReactor(getFn))
  }

  protected proxy<T>(getFn: () => T): Node<T>
  protected proxy<T>(getFn: () => T, setFn: (value: T) => void): Cell<T>
 
  protected proxy<T>(getFn: () => T, setFn?: (value: T) => void) {
    if (setFn === undefined) {
      return quickRead(new Proxy(getFn));
    } else {
      return quickWrite(new Proxy(getFn, setFn));
    }
  }
}
