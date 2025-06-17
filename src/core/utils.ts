
export function isFunction<T>(value: T | (() => T)): value is () => T {
    return typeof value === "function"
}
