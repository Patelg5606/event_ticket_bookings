import { useQuery } from '@tanstack/react-query'
import { Armchair } from 'lucide-react'
import { useState } from 'react'
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
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-3 py-8 sm:gap-8 sm:px-6 sm:py-10 md:px-8 md:py-12 lg:max-w-5xl">
        <header className="border-b border-slate-800/80 pb-6 sm:pb-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-400/90 sm:text-xs sm:tracking-[0.2em]">
            Event ticket booking
          </p>
          <h1 className="mt-2 text-xl font-semibold tracking-tight text-white sm:mt-3 sm:text-2xl md:text-3xl">
            Choose your seats
          </h1>
          <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-400 sm:text-sm">
            Tap an open seat to select it; tap again to remove. Unavailable
            seats cannot be picked.
          </p>
          {pickedIds.length > 0 ? (
            <p className="mt-3 text-sm text-sky-300">
              Selected: {pickedIds.length} seat
              {pickedIds.length === 1 ? '' : 's'} (
              {[...pickedIds].sort().join(', ')})
            </p>
          ) : null}
        </header>

        <SeatGrid
          seats={seats}
          pickedIds={pickedIds}
          onSeatClick={handleSeatClick}
        />

        <footer className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-3 sm:rounded-2xl sm:px-5 sm:py-4">
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
        </footer>
      </main>
    </div>
  )
}
