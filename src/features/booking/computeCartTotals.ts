import type { Seat } from './types'

export type CartRow = {
  id: string
  price: number
  tier: string
}

export type CartTotals = {
  rows: CartRow[]
  ticketsSubtotal: number
  convenienceFee: number
  gst: number
  totalAmount: number
  count: number
  hasSeats: boolean
}

export function computeCartTotals(pickedIds: string[], seats: Seat[]): CartTotals {
  const byId = new Map(seats.map((s): [string, Seat] => [s.id, s]))
  const rows: CartRow[] = []
  let ticketsSubtotal = 0

  for (const id of [...pickedIds].sort()) {
    const seat = byId.get(id)
    if (seat) {
      rows.push({
        id: seat.id,
        price: seat.price,
        tier: seat.tier,
      })
      ticketsSubtotal += seat.price
    }
  }

  const convenienceFee = Math.round(ticketsSubtotal * 0.1)
  const gst = Math.round((ticketsSubtotal + convenienceFee) * 0.18)
  const totalAmount = ticketsSubtotal + convenienceFee + gst
  const count = rows.length

  return {
    rows,
    ticketsSubtotal,
    convenienceFee,
    gst,
    totalAmount,
    count,
    hasSeats: count > 0,
  }
}
