import { Check } from 'lucide-react'

export type BookingSuccessSummary = {
  seatIds: string[]
  ticketsSubtotal: number
  convenienceFee: number
  gst: number
  totalAmount: number
}

type BookingSuccessModalProps = {
  summary: BookingSuccessSummary
  onDone: () => void
}

export function BookingSuccessModal({ summary, onDone }: BookingSuccessModalProps) {
  const { seatIds, ticketsSubtotal, convenienceFee, gst, totalAmount } = summary
  const n = seatIds.length
  const ticketLabel = n === 1 ? '1 ticket' : `${n} tickets`
  const seatsPart = seatIds.join(', ')

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-success-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-label="Close dialog backdrop"
        onClick={onDone}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-slate-700/80 bg-[#1a1d24] px-6 py-8 shadow-2xl shadow-black/50 ring-1 ring-white/[0.06]">
        <div className="flex flex-col items-center text-center">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-950/40"
            aria-hidden
          >
            <Check className="h-8 w-8 stroke-[3] text-white" />
          </div>

          <h2
            id="booking-success-title"
            className="mt-5 text-xl font-bold tracking-tight text-white sm:text-2xl"
          >
            Booking Confirmed!
          </h2>

          <p className="mt-3 text-sm font-medium text-white sm:text-base">
            {ticketLabel}{' '}
            <span className="text-slate-300">({seatsPart})</span>
          </p>

          <div className="mt-6 w-full space-y-2.5 text-left text-sm">
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Subtotal</span>
              <span className="tabular-nums text-slate-300">₹{ticketsSubtotal}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>Convenience Fee</span>
              <span className="tabular-nums text-slate-300">₹{convenienceFee}</span>
            </div>
            <div className="flex justify-between gap-4 text-slate-400">
              <span>GST (18%)</span>
              <span className="tabular-nums text-slate-300">₹{gst}</span>
            </div>
            <div className="flex justify-between gap-4 border-t border-slate-700/80 pt-3 text-base font-semibold">
              <span className="text-white">Total</span>
              <span className="tabular-nums text-[#5d5fef]">₹{totalAmount}</span>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-500">Payment: Credit/Debit Card</p>


          <button
            type="button"
            className="mt-6 rounded-xl bg-[#5d5fef] px-10 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-950/35 transition hover:bg-[#4f52e6] active:scale-[0.99]"
            onClick={onDone}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
