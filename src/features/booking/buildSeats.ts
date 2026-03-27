import type { Seat } from './types'

// 10 rows, 10 seats each = 100 seats (A1 .. J10)

const ROW_CODES = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']

export function buildSeatList(): Seat[] {
  const seats: Seat[] = []

  for (let rowIndex = 0; rowIndex < ROW_CODES.length; rowIndex++) {
    const row = ROW_CODES[rowIndex]
    const isVipRow = rowIndex < 2

    for (let column = 1; column <= 10; column++) {
      seats.push({
        id: `${row}${column}`,
        row,
        column,
        tier: isVipRow ? 'VIP' : 'General',
        price: isVipRow ? 350 : 150,
        status: 'available',
      })
    }
  }

  return seats
}
