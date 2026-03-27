export type SeatTier = 'VIP' | 'General'

export type SeatStatus = 'available' | 'unavailable'

export type Seat = {
  id: string
  row: string
  column: number
  tier: SeatTier
  price: number
  status: SeatStatus
}
