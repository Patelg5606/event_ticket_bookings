import { AlertCircle } from 'lucide-react'

export type SeatNotice = {
  heading: string
  message: string
}

type SeatNoticeToastProps = {
  notice: SeatNotice | null
}

export function SeatNoticeToast({ notice }: SeatNoticeToastProps) {
  if (!notice) {
    return null
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="seat-notice-in fixed top-[max(0.75rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] z-[100] flex w-[min(26rem,calc(100vw-2rem))] items-start gap-3.5 overflow-hidden rounded-2xl border border-slate-700/60 bg-[#12161f]/92 py-4 pl-4 pr-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.04)_inset] backdrop-blur-xl sm:top-5 sm:gap-4 sm:pr-5"
    >
      <span
        className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-amber-600/90 via-amber-400/80 to-amber-500/50 opacity-90"
        aria-hidden
      />

      <div
        className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/[0.12] shadow-inner shadow-amber-950/20 ring-1 ring-amber-400/20 sm:h-12 sm:w-12"
        aria-hidden
      >
        <AlertCircle
          className="h-[1.35rem] w-[1.35rem] text-amber-400/95 sm:h-6 sm:w-6"
          strokeWidth={2}
        />
      </div>

      <div className="min-w-0 flex-1 pt-0.5 text-left">
        <p className="text-[0.8125rem] font-semibold tracking-[-0.015em] text-slate-50 sm:text-sm">
          {notice.heading}
        </p>
        <p className="mt-1.5 text-xs font-normal leading-[1.55] text-slate-400 sm:text-[0.8125rem] sm:leading-relaxed">
          {notice.message}
        </p>
      </div>
    </div>
  )
}
