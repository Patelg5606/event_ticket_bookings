import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { BookingPanel } from '@/features/booking/BookingPanel'
import { SeatGrid } from '@/features/booking/SeatGrid'
import { fetchSeatList } from '@/features/booking/mockApi'
import type { Seat } from '@/features/booking/types'

export function HomePage() {
  const [pickedIds, setPickedIds] = useState<string[]>([])

  const seatQuery = useQuery({
    queryKey: ['seats'],
    queryFn: fetchSeatList,
  })

  function handleSeatClick(seat: Seat) {
    if (seat.status === 'unavailable') {
      return
    }

    setPickedIds((prev) => {
      if (prev.includes(seat.id)) {
        return prev.filter((id) => id !== seat.id)
      }
      return [...prev, seat.id]
    })
  }

  function handleCheckout() {
    if (pickedIds.length === 0) {
      return
    }
    window.alert('Demo checkout — timer and payment can come in later steps.')
  }

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

  const seats = seatQuery.data ?? []

  return (
    <div className="min-h-dvh bg-[#060b14] pb-[max(1.5rem,env(safe-area-inset-bottom))] text-slate-100">
      <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col px-3 py-4 sm:px-6 sm:py-6 md:px-8 lg:max-w-6xl">
        <header className="shrink-0 border-b border-slate-800/80 pb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90 sm:text-xs sm:tracking-[0.2em]">
            Event ticket booking
          </p>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 py-6 lg:grid-cols-[1fr_minmax(280px,340px)] lg:items-stretch lg:gap-8 lg:py-6">
          <div className="flex min-h-0 min-w-0 flex-col gap-8">
            <SeatGrid
              seats={seats}
              pickedIds={pickedIds}
              onSeatClick={handleSeatClick}
            />

              {/* <footer className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-3 sm:rounded-2xl sm:px-5 sm:py-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500 sm:mb-3 sm:text-xs">
                  Legend
                </p>
                <div className="flex flex-col gap-3 text-xs text-slate-400 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3 sm:text-sm">
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white ring-1 ring-emerald-400/35">
                      <Armchair className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    Available
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-950/80 text-red-200 ring-1 ring-red-500/40">
                      <Armchair
                        className="h-4 w-4 opacity-55"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </span>
                    Unavailable
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-amber-50 ring-2 ring-amber-400/85 ring-offset-2 ring-offset-[#060b14]">
                      <Armchair className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    VIP
                  </span>
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white ring-2 ring-sky-300 ring-offset-2 ring-offset-[#060b14]">
                      <Armchair className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                    </span>
                    Selected
                  </span>
                </div>
              </footer> */}
          </div>

          <div className="flex min-h-[70vh] flex-col lg:min-h-0 lg:h-[calc(100dvh-7.5rem)]">
            <BookingPanel
              pickedIds={pickedIds}
              seats={seats}
              onCheckout={handleCheckout}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
