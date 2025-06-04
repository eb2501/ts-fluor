import { Ticket } from "./ticket"

export type GraphState = "cleared" | "caching" | "cached"

export type GraphListener = (before: GraphState, after: GraphState) => void

export interface Graph {
    readonly state: GraphState
    addListener(listener: GraphListener): Ticket
}
