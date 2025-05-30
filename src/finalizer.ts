import { Ticket } from "./ticket";

export const finalizer = new FinalizationRegistry<Ticket>(
    (ticket) => ticket.burn()
);
