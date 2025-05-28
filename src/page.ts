import { Cell } from "./cell";
import { Node } from "./node";
import { Clear } from "./clear";
import { Read } from "./read";
import { Write } from "./write";

export class Page {

    protected cell<T>(value: T): Write<T> & Clear {
        return new Cell(value);
    }

    protected node<T>(getter: () => T): Read<T> & Clear {
        return new Node(getter);
    }
}
