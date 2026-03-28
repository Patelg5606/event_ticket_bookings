import { Armchair, Clock, CreditCard, ShoppingCart } from 'lucide-react'
import { memo, useMemo } from 'react'
import { computeCartTotals } from './computeCartTotals'
import type { Seat } from './types'

type BookingPanelProps = {
  pickedIds: string[]
  seats: Seat[]
  holdSecondsLeft: number | null
  onCheckout: () => void
}

function formatHold(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export const BookingPanel = memo(function BookingPanel({
  pickedIds,
  seats,
  holdSecondsLeft,
  onCheckout,
}: BookingPanelProps) {
  const { rows, ticketsSubtotal, convenienceFee, gst, totalAmount, count, hasSeats } =
    useMemo(() => computeCartTotals(pickedIds, seats), [pickedIds, seats])

  return (
    <aside
      className="flex h-full min-h-[70vh] w-full flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#111622] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.45)] lg:min-h-0"
      aria-label="Reserved seats and checkout"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-800/90 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1a1f2e] text-slate-200 ring-1 ring-white/[0.06]">
            <ShoppingCart className="h-5 w-5" strokeWidth={1.75} aria-hidden />
          </span>
          <h2 className="truncate text-lg font-bold tracking-tight text-white">
            Your Tickets
          </h2>
        </div>
        <span
          className="flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600/35 px-2 text-sm font-bold text-sky-200 ring-1 ring-indigo-400/35"
          aria-label={`${count} tickets`}
        >
          {count}
        </span>
      </div>

      {hasSeats && holdSecondsLeft !== null && holdSecondsLeft > 0 ? (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b border-amber-500/20 bg-amber-950/30 px-4 py-2.5 text-sm font-semibold text-amber-200">
          <Clock className="h-4 w-4 shrink-0" strokeWidth={1.75} aria-hidden />
          <span>Complete checkout in {formatHold(holdSecondsLeft)}</span>
        </div>
      ) : null}

      <div className="flex min-h-0 flex-1 flex-col px-4 pt-3 sm:px-5 sm:pt-4">
        {hasSeats ? (
          <ul className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 pb-3 [-webkit-overflow-scrolling:touch]">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-xl bg-[#1a1d26] px-3 py-3 ring-1 ring-white/[0.06] sm:px-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-base font-bold leading-tight text-white sm:text-lg">
                    {row.id}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">
                    {row.tier}
                  </p>  
                </div>
                <span className="shrink-0 text-base font-bold tabular-nums text-white sm:text-lg">
                  ₹{row.price}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-2 py-10 text-center">
            <Armchair
              className="h-20 w-20 text-slate-700/90"
              strokeWidth={1.15}
              aria-hidden
            />
            <p className="text-sm font-medium text-slate-400">Nothing reserved yet</p>
            <p className="max-w-[220px] text-xs leading-relaxed text-slate-600">
              Tap seats on the map — they turn yellow when reserved for you
            </p>
          </div>
        )}
      </div>

      {hasSeats ? (
        <div className="shrink-0 border-t border-slate-800/90 bg-[#111622] px-4 pb-5 pt-5 sm:px-5">
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Tickets subtotal</span>
              <span className="font-semibold tabular-nums text-white">
                ₹{ticketsSubtotal}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">Convenience fee</span>
              <span className="font-semibold tabular-nums text-white">
                ₹{convenienceFee}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-400">GST (18%)</span>
              <span className="font-semibold tabular-nums text-white">₹{gst}</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-800/90 pt-5">
            <span className="text-base font-semibold text-white">Total amount</span>
            <span className="text-2xl font-bold tabular-nums tracking-tight text-[#5d5fef] sm:text-3xl">
              ₹{totalAmount}
            </span>
          </div>

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#5d5fef] py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/40 transition hover:bg-[#4f52e6] active:scale-[0.99]"
            onClick={onCheckout}
          >
            <CreditCard className="h-5 w-5 shrink-0" strokeWidth={1.75} aria-hidden />
            Proceed to Checkout
          </button>
        </div>
      ) : null}
    </aside>
  )
})
