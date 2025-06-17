import type { CellC } from "../core/page";
import { UIElement } from "./ui_element";

export abstract class UIView<M> extends UIElement {
    readonly model: CellC<M>

    constructor(model: M) {
        super();
        this.model = this.cell(model)
    }
}
