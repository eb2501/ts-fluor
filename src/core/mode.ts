
export type Mode = "free" | "read" | "locked"

let currentMode: Mode = "free"

export function getCurrentMode(): Mode {
  return currentMode
}

function isStrictlyLessRestrictive(baseMode: Mode, newMode: Mode): boolean {
  if (baseMode === "locked") {
    return newMode !== "locked"
  }
  if (baseMode === "read") {
    return newMode === "free"
  }
  return false
}

export function withMode<T>(mode: Mode, fn: () => T): T {
  if (isStrictlyLessRestrictive(currentMode, mode)) {
    throw new Error(`Cannot enter '${mode}' mode while in '${currentMode}' mode`)
  }
  const previousMode = currentMode
  currentMode = mode
  try {
    return fn()
  } finally {
    currentMode = previousMode
  }
}
