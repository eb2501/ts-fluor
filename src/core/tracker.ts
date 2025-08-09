
import { cell } from "./cell"
import { type Mem } from "./triad"


export function tracker<T>(
  initial: T,
  setter: (value: T) => void,
): Mem<T> {
  const local = cell(initial)
  return (value?: T) => {
    if (value !== undefined) {
      setter(value)
      return local(value)
    } else {
      return local()
    }
  }
}
