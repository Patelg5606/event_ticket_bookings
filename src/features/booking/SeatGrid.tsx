import { Armchair } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Seat } from './types'

type SeatGridProps = {
  seats: Seat[]
}

type RowGroup = {
  row: string
  seats: Seat[]
}

/** Narrow screens: map scrolls sideways so 10 columns stay readable. */
function SeatMapScroll({ children }: { children: ReactNode }) {
  return (
    <div className="mx-1 overflow-x-auto overscroll-x-contain px-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0">
      <div className="mx-auto w-full min-w-[21.5rem] max-w-2xl sm:min-w-0 md:max-w-3xl">
        {children}
      </div>
    </div>
  )
}

  function buildRowGroups(seatList: Seat[]) {
  const byRow: Record<string, Seat[]> = {}

  for (const seat of seatList) {
    if (!byRow[seat.row]) {
      byRow[seat.row] = []
    }
    byRow[seat.row].push(seat)
  }

  const rows: RowGroup[] = []
  for (const row of Object.keys(byRow).sort()) {
    const rowSeats = byRow[row].sort((a, b) => a.column - b.column)
    rows.push({ row, seats: rowSeats })
  }

  return rows
}

function ColumnHeadings() {
  return (
    <div className="flex items-end gap-2 sm:gap-2.5 md:gap-3">
      <div
        className="w-6 shrink-0 sm:w-8 md:w-9"
        aria-hidden
      />
      <div className="grid min-w-0 flex-1 grid-cols-10 gap-2 sm:gap-2.5 md:gap-3">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className="text-center text-[9px] font-semibold tabular-nums text-slate-500 sm:text-[10px] md:text-xs"
          >
            {n}
          </div>
        ))}
      </div>
    </div>
  )
}

function SeatTile({ seat }: { seat: Seat }) {
  const taken = seat.status === 'unavailable'
  const vip = seat.tier === 'VIP'

  let shell =
    'flex min-h-10 flex-col items-center justify-center gap-0 rounded-md px-0 py-1 shadow-sm sm:min-h-11 sm:rounded-lg sm:py-1 md:min-h-12'

  let iconClass =
    'h-4 w-4 shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6'

  if (taken) {
    shell +=
      ' bg-red-950/80 text-red-200 ring-1 ring-red-500/40'
    iconClass += ' opacity-55'
  } else if (vip) {
    shell +=
      ' bg-slate-900 text-amber-50 ring-2 ring-amber-400/85 ring-offset-1 ring-offset-[#060b14] sm:ring-offset-2'
  } else {
    shell +=
      ' bg-emerald-700 text-white ring-1 ring-emerald-400/35'
  }

  return (
    <div
      className={shell}
      title={`${seat.id} · ${seat.tier} · ₹${seat.price}`}
    >
      <Armchair className={iconClass} strokeWidth={1.75} aria-hidden />
      <span className="text-[8px] font-semibold leading-none tabular-nums sm:text-[9px] md:text-[10px]">
        {seat.id}
      </span>
    </div>
  )
}

function SeatRow({ row, seats }: RowGroup) {
  return (
    <div className="flex items-stretch gap-2 sm:gap-2.5 md:gap-3">
      <div
        className="flex w-6 shrink-0 items-center justify-center rounded-md border border-slate-700/80 bg-slate-800/90 text-xs font-bold text-slate-100 shadow-inner sm:w-8 sm:rounded-lg sm:text-sm md:w-9"
        aria-hidden
      >
        {row}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-10 gap-2 sm:gap-2.5 md:gap-3">
        {seats.map((seat) => (
          <SeatTile key={seat.id} seat={seat} />
        ))}
      </div>
    </div>
  )
}

type SectionShellProps = {
  title: string
  subtitle: string
  children: ReactNode
  role?: string
  ariaLabel?: string
}

function SectionShell({
  title,
  subtitle,
  children,
  role,
  ariaLabel,
}: SectionShellProps) {
  return (
    <section
      className="rounded-xl border border-slate-800/90 bg-slate-900/55 p-3 shadow-[0_18px_48px_-12px_rgba(0,0,0,0.55)] backdrop-blur-sm sm:rounded-2xl sm:p-4 md:p-5"
      role={role}
      aria-label={ariaLabel}
    >
      <header className="mb-3 flex flex-col gap-1 sm:mb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base md:text-lg">
            {title}
          </h2>
          <p className="mt-0.5 text-[11px] text-slate-400 sm:text-xs md:text-sm">
            {subtitle}
          </p>
        </div>
      </header>
      <SeatMapScroll>
        <div className="flex flex-col gap-2 sm:gap-2.5">{children}</div>
      </SeatMapScroll>
    </section>
  )
}

export function SeatGrid({ seats }: SeatGridProps) {
  const vipSeats = seats.filter((s) => s.tier === 'VIP')
  const generalSeats = seats.filter((s) => s.tier === 'General')

  const vipRows = buildRowGroups(vipSeats)
  const generalRows = buildRowGroups(generalSeats)

  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
        Front of venue
      </p>

      <div className="flex flex-col gap-8 md:gap-10">
        <SectionShell
          title="VIP"
          subtitle="Rows A–B · ₹350 per seat"
          role="group"
          ariaLabel="VIP seats"
        >
          <ColumnHeadings />
          {vipRows.map((rg) => (
            <SeatRow key={rg.row} row={rg.row} seats={rg.seats} />
          ))}
        </SectionShell>

        <SectionShell
          title="General seating"
          subtitle="Rows C–J · ₹150 per seat"
          role="group"
          ariaLabel="General seats"
        >
          <ColumnHeadings />
          {generalRows.map((rg) => (
            <SeatRow key={rg.row} row={rg.row} seats={rg.seats} />
          ))}
        </SectionShell>
      </div>
    </div>
  )
}
