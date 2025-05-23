
export interface Read<T> {
    get(): T;
}

export interface Read1<A, T> {
    get(a: A): T;
}

export interface Read2<A, B, T> {
    get(a: A, b: B): T;
}
