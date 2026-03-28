import { useQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { BookingPanel } from '@/features/booking/BookingPanel'
import { SeatGrid } from '@/features/booking/SeatGrid'
import { fetchSeatList } from '@/features/booking/mockApi'
import type { Seat } from '@/features/booking/types'

const HOLD_SECONDS = 5 * 60

export function HomePage() {
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const [takenByOthers, setTakenByOthers] = useState<string[]>([])
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null)
  const [seatTakenFlash, setSeatTakenFlash] = useState(false)

  const displaySeatsRef = useRef<Seat[]>([])
  const pickedIdsRef = useRef<string[]>([])

  const seatQuery = useQuery({
    queryKey: ['seats'],
    queryFn: fetchSeatList,
  })

  const seatList = seatQuery.data

  useEffect(() => {
    if (!seatList || seatList.length === 0) {
      return
    }

    const timer = window.setInterval(() => {
      setTakenByOthers((prev) => {
        const already = new Set(prev)

        const open = seatList.filter((seat) => {
          if (seat.status !== 'available') {
            return false
          }
          if (pickedIdsRef.current.includes(seat.id)) {
            return false
          }
          if (already.has(seat.id)) {
            return false
          }
          return true
        })

        if (open.length === 0) {
          return prev
        }

        let pickCount = 1
        if (open.length >= 2 && Math.random() < 0.5) {
          pickCount = 2
        }

        const shuffled = [...open]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          const a = shuffled[i]
          const b = shuffled[j]
          if (a && b) {
            shuffled[i] = b
            shuffled[j] = a
          }
        }

        const next = [...prev]
        for (let k = 0; k < pickCount && k < shuffled.length; k++) {
          const pickedSeat = shuffled[k]
          if (!pickedSeat) {
            continue
          }
          const id = pickedSeat.id
          if (!already.has(id)) {
            already.add(id)
            next.push(id)
          }
        }

        return next
      })
    }, 5000)

    return () => window.clearInterval(timer)
  }, [seatList])

  useEffect(() => {
    if (holdSecondsLeft === null || holdSecondsLeft <= 0) {
      return
    }

    const t = window.setTimeout(() => {
      setHoldSecondsLeft((s) => (s === null ? null : s - 1))
    }, 1000)

    return () => window.clearTimeout(t)
  }, [holdSecondsLeft])

  useEffect(() => {
    if (holdSecondsLeft !== 0) {
      return
    }
    const t = window.setTimeout(() => {
      setPickedIds([])
      setHoldSecondsLeft(null)
    }, 0)
    return () => window.clearTimeout(t)
  }, [holdSecondsLeft])

  function handleSeatClick(seat: Seat) {
    const live = displaySeatsRef.current
    const fresh = live.find((s) => s.id === seat.id)
    if (!fresh) {
      return
    }

    const mine = pickedIdsRef.current.includes(seat.id)

    if (mine) {
      setPickedIds((prev) => {
        const next = prev.filter((id) => id !== seat.id)
        if (next.length === 0) {
          setHoldSecondsLeft(null)
        }
        return next
      })
      return
    }

    if (fresh.status === 'unavailable') {
      setSeatTakenFlash(true)
      window.setTimeout(() => setSeatTakenFlash(false), 3200)
      return
    }

    setPickedIds((prev) => {
      const next = [...prev, seat.id]
      if (prev.length === 0) {
        setHoldSecondsLeft(HOLD_SECONDS)
      }
      return next
    })
  }

  function handleCheckout() {
    if (pickedIds.length === 0) {
      return
    }
    setPickedIds([])
    setHoldSecondsLeft(null)
    window.alert('Checkout complete — hold released.')
  }

  const seats = seatList ?? []
  const displaySeats = seats.map((seat) => {
    const grabbed = takenByOthers.includes(seat.id)
    const mine = pickedIds.includes(seat.id)
    if (grabbed && !mine) {
      return { ...seat, status: 'unavailable' as const }
    }
    return seat
  })

  useLayoutEffect(() => {
    pickedIdsRef.current = pickedIds
    displaySeatsRef.current = displaySeats
  })

  if (seatQuery.isPending) {
    return (
      <div className="min-h-dvh bg-slate-950 px-3 py-12 text-slate-100 sm:px-6 sm:py-16">
        <p className="text-center text-sm text-slate-400">Loading seats…</p>
      </div>
    )
  }

  if (seatQuery.isError) {
    return (
      <div className="min-h-dvh bg-slate-950 px-3 py-12 text-slate-100 sm:px-6 sm:py-16">
        <p className="text-center text-sm text-red-400">Could not load seats.</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[#060b14] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-slate-100">
      {seatTakenFlash ? (
        <div
          role="alert"
          className="fixed top-4 left-1/2 z-[100] max-w-[90vw] -translate-x-1/2 rounded-xl bg-amber-950/95 px-5 py-3 text-center text-sm font-semibold text-amber-100 shadow-xl ring-2 ring-amber-500/60"
        >
          Seat just taken!
        </div>
      ) : null}

      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-3 py-4 sm:px-6 sm:py-6 md:px-8 lg:max-w-6xl">
        <header className="shrink-0 border-b border-slate-800/80 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90 sm:text-xs sm:tracking-[0.2em]">
            Event ticket booking
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
            Yellow seats are <span className="text-amber-400/90">reserved</span> for you (5 min hold).
            Gray = taken. If a seat sells while you tap it, you will see an error.
          </p>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 py-6 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-stretch lg:gap-8 lg:py-6">
          <div className="flex min-h-0 min-w-0 flex-col gap-8">
            <SeatGrid
              seats={displaySeats}
              pickedIds={pickedIds}
              onSeatClick={handleSeatClick}
            />
          </div>

          <div className="flex min-h-[70vh] flex-col lg:min-h-0 lg:h-[calc(100dvh-7.5rem)]">
            <BookingPanel
              pickedIds={pickedIds}
              seats={seats}
              holdSecondsLeft={holdSecondsLeft}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
