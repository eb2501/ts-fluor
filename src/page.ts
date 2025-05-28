import { Cell, CellEvent } from "./cell";
import { Node, NodeEvent } from "./node";
import { Clear } from "./clear";
import { Read } from "./read";
import { Write } from "./write";
import { Source } from "./event";

export class Page {

    protected cell<T>(value: T): Write<T> & Clear & Source<CellEvent> {
        return new Cell(value);
    }

    protected node<T>(getter: () => T): Read<T> & Clear & Source<NodeEvent> {
        return new Node(getter);
    }
}
