import { buildSeatList } from './buildSeats'
import type { Seat } from './types'

// Pretend this is a network call. Grid will use this later with React Query.

export function fetchSeatList(): Promise<Seat[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const seats = buildSeatList()
      resolve(seats)
    }, 300)
  })
}
