export type SeatTier = 'VIP' | 'General'

export type SeatStatus = 'available' | 'unavailable'

/** One row from the API. Seats you reserve in the UI use pickedIds in HomePage, not this field. */
export type Seat = {
  id: string
  row: string
  column: number
  tier: SeatTier
  price: number
  status: SeatStatus
}
