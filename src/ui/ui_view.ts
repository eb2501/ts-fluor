import type { Node } from "../core/page";
import { UIElement } from "./ui_element";

export abstract class UIView<M> extends UIElement {
    abstract readonly model: Node<M | null>
}
