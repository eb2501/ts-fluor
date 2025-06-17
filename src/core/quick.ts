import { type Read } from "./read";

export interface Quick<T> extends Read<T> {
    (): T;
}
