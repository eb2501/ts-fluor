
export type Mode = "free" | "calc" | "once" | "snapshot" | "locked"

let currentMode: Mode = "free"

export function getCurrentMode(): Mode {
  return currentMode
}

function isTransitionAllowed(prevMode: Mode, newMode: Mode): boolean {
  switch (prevMode) {
    case "free":
      switch (newMode) {
        case "snapshot":
          return false
        case "free":
        case "calc":
        case "once":
        case "locked":
          return true
      }

    case "calc":
      switch (newMode) {
        case "free":
        case "snapshot":
          return false
        case "calc":
        case "once":
        case "locked":
          return true
      }

    case "once":
      switch (newMode) {
        case "free":
        case "calc":
          return false
        case "once":
        case "snapshot":
        case "locked":
          return true
      }

    case "snapshot":
      switch (newMode) {
        case "free":
          return false
        case "calc":
        case "once":
        case "snapshot":
        case "locked":
          return true
      }

    case "locked":
      return false
  }
}

export function withMode<T>(mode: Mode, fn: () => T): T {
  if (!isTransitionAllowed(currentMode, mode)) {
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
