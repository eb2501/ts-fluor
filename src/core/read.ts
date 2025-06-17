
interface Read<T> {
    get(): T
}

interface Read1<A, T> {
    get(a: A): T
}

interface Read2<A, B, T> {
    get(a: A, b: B): T
}

export type { Read, Read1, Read2 }
