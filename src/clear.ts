
export interface Clear {
    clear(): void;
}

export interface Clear1<A> {
    clear(a: A): void;
    clearAll(): void;
}

export interface Clear2<A, B> {
    clear(a: A, b: B): void;
    clearAll(): void;
}
