import { Ticket } from "./ticket"

export type Listener = (loaded: boolean) => void

export interface State {
    isLoaded: boolean
    addListener(listener: Listener): Ticket
}
