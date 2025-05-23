
import { Read, Read1, Read2 } from './read';

export interface Write<T> extends Read<T> {
    set(value: T): void;
}

export interface Write1<A, T> extends Read1<A, T> {
    set(a: A, value: T): void;
}

export interface Write2<A, B, T> extends Read2<A, B, T> {
    set(a: A, b: B, value: T): void;
}
