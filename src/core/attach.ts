
const mapping = new WeakMap<any, any[]>()

export function attach(target: any, obj: any) {
  const value = mapping.get(target)
  if (value) {
    value.push(obj)
  } else {
    mapping.set(target, [obj])
  }
}
