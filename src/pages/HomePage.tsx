import { useQuery } from '@tanstack/react-query'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { BookingPanel } from '@/features/booking/BookingPanel'
import {
  BookingSuccessModal,
  type BookingSuccessSummary,
} from '@/features/booking/BookingSuccessModal'
import { computeCartTotals } from '@/features/booking/computeCartTotals'
import { SeatNoticeToast, type SeatNotice } from '@/features/booking/SeatNoticeToast'
import { SeatGrid } from '@/features/booking/SeatGrid'
import { fetchSeatList } from '@/features/booking/mockApi'
import type { Seat } from '@/features/booking/types'

const HOLD_SECONDS = 5 * 60

const EMPTY_SEAT_LIST: Seat[] = []

const SEAT_NOTICE_MS = 4000

export function HomePage() {
  const [pickedIds, setPickedIds] = useState<string[]>([])
  const [takenByOthers, setTakenByOthers] = useState<string[]>([])
  const [holdSecondsLeft, setHoldSecondsLeft] = useState<number | null>(null)
  const [seatNotice, setSeatNotice] = useState<SeatNotice | null>(null)
  const [bookedSeatIds, setBookedSeatIds] = useState<string[]>([])
  const [successModal, setSuccessModal] = useState<BookingSuccessSummary | null>(
    null,
  )

  const displaySeatsRef = useRef<Seat[]>([])
  const pickedIdsRef = useRef<string[]>([])
  const bookedIdsRef = useRef<string[]>([])
  const seatNoticeTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(
    null,
  )

  const seatQuery = useQuery({
    queryKey: ['seats'],
    queryFn: fetchSeatList,
  })

  const seatList = seatQuery.data
  const seats = seatList ?? EMPTY_SEAT_LIST

  useEffect(() => {
    return () => {
      if (seatNoticeTimerRef.current !== null) {
        window.clearTimeout(seatNoticeTimerRef.current)
      }
    }
  }, [])

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
          if (bookedIdsRef.current.includes(seat.id)) {
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

  const handleSeatClick = useCallback((seat: Seat) => {
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
      const ownPurchase = bookedIdsRef.current.includes(seat.id)
      if (seatNoticeTimerRef.current !== null) {
        window.clearTimeout(seatNoticeTimerRef.current)
      }
      setSeatNotice(
        ownPurchase
          ? {
            heading: "Already selected",
            message: "You have already added this seat to your booking."
          }
          :
          {
            heading: "Seat unavailable",
            message: "This seat was just reserved by another guest. Please choose another seat."
          }
      )
      seatNoticeTimerRef.current = window.setTimeout(() => {
        setSeatNotice(null)
        seatNoticeTimerRef.current = null
      }, SEAT_NOTICE_MS)
      return
    }

    setPickedIds((prev) => {
      const next = [...prev, seat.id]
      if (prev.length === 0) {
        setHoldSecondsLeft(HOLD_SECONDS)
      }
      return next
    })
  }, [])

  const handleCheckout = useCallback(() => {
    const ids = pickedIdsRef.current
    if (ids.length === 0) {
      return
    }
    const { ticketsSubtotal, convenienceFee, gst, totalAmount } =
      computeCartTotals(ids, seats)

    setBookedSeatIds((prev) => {
      const merged = new Set([...prev, ...ids])
      return [...merged]
    })
    setPickedIds([])
    setHoldSecondsLeft(null)
    setSuccessModal({
      seatIds: [...ids].sort(),
      ticketsSubtotal,
      convenienceFee,
      gst,
      totalAmount,
    })
  }, [seats])

  const bookedSet = useMemo(() => new Set(bookedSeatIds), [bookedSeatIds])

  const displaySeats = useMemo(() => {
    return seats.map((seat) => {
      if (bookedSet.has(seat.id)) {
        return { ...seat, status: 'unavailable' as const }
      }
      const grabbed = takenByOthers.includes(seat.id)
      const mine = pickedIds.includes(seat.id)
      if (grabbed && !mine) {
        return { ...seat, status: 'unavailable' as const }
      }
      return seat
    })
  }, [seats, takenByOthers, pickedIds, bookedSet])

  useLayoutEffect(() => {
    pickedIdsRef.current = pickedIds
    bookedIdsRef.current = bookedSeatIds
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
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-[#060b14] text-slate-100">
      {successModal ? (
        <BookingSuccessModal
          summary={successModal}
          onDone={() => setSuccessModal(null)}
        />
      ) : null}

      <SeatNoticeToast notice={seatNotice} />

      <main
        className={`mx-auto flex w-full max-w-4xl flex-1 min-h-0 flex-col overflow-hidden px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-3 md:px-8 lg:max-w-6xl ${successModal ? 'pointer-events-none blur-[2px]' : ''}`}
        aria-hidden={successModal ? true : undefined}
      >
        <header className="shrink-0 border-b border-slate-800/80 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90 sm:text-xs sm:tracking-[0.2em]">
            Event ticket booking
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <p className="max-w-xl text-xs leading-relaxed text-slate-500">
              Yellow seats are <span className="text-amber-400/90">reserved</span> for you (5 min hold).
              Gray = taken. Tap a taken seat to see why it is unavailable.
            </p>
            <div
              className="shrink-0 border-t border-slate-800/80 pt-3 sm:border-t-0 sm:border-l sm:pl-6 sm:pt-0"
              role="group"
              aria-label="Seat map legend"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Legend
              </p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-400 sm:text-xs">
                <li className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 shrink-0 rounded-md bg-emerald-700 ring-1 ring-emerald-400/35 sm:h-6 sm:w-6"
                    aria-hidden
                  />
                  <span>Available</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 shrink-0 rounded-md bg-slate-900 ring-2 ring-amber-400/70 ring-offset-1 ring-offset-[#060b14] sm:h-6 sm:w-6 sm:ring-offset-2"
                    aria-hidden
                  />
                  <span>VIP</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 shrink-0 rounded-md bg-amber-500 ring-2 ring-amber-200 ring-offset-1 ring-offset-[#060b14] sm:h-6 sm:w-6 sm:ring-offset-2"
                    aria-hidden
                  />
                  <span>Your hold</span>
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className="h-5 w-5 shrink-0 rounded-md bg-slate-800/80 ring-1 ring-slate-600/50 sm:h-6 sm:w-6"
                    aria-hidden
                  />
                  <span>Taken</span>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden lg:grid lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-stretch lg:gap-6 lg:gap-x-8">
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] lg:min-h-0">
            <SeatGrid
              seats={displaySeats}
              pickedIds={pickedIds}
              onSeatClick={handleSeatClick}
            />
          </div>

          <div className="flex w-full min-w-0 shrink-0 flex-col lg:h-full lg:max-h-full lg:min-h-0">
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
