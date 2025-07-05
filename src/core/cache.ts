export type Listener = (cached: boolean) => void

export interface Cache {
  isCached: boolean
  addListener(listener: Listener): void
  removeListener(listener: Listener): void
}
