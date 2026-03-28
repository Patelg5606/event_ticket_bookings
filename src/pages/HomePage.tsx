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
    <div className="min-h-dvh bg-[#060b14] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-slate-100">
      {successModal ? (
        <BookingSuccessModal
          summary={successModal}
          onDone={() => setSuccessModal(null)}
        />
      ) : null}

      <SeatNoticeToast notice={seatNotice} />

      <main
        className={`mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-3 py-4 sm:px-6 sm:py-6 md:px-8 lg:max-w-6xl ${successModal ? 'pointer-events-none blur-[2px]' : ''}`}
        aria-hidden={successModal ? true : undefined}
      >
        <header className="shrink-0 border-b border-slate-800/80 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90 sm:text-xs sm:tracking-[0.2em]">
            Event ticket booking
          </p>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-slate-500">
            Yellow seats are <span className="text-amber-400/90">reserved</span> for you (5 min hold).
            Gray = taken. Tap a taken seat to see why it is unavailable.
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
