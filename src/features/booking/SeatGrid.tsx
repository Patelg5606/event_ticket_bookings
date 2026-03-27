import { Armchair } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Seat } from './types'

type SeatGridProps = {
  seats: Seat[]
  pickedIds: string[]
  onSeatClick: (seat: Seat) => void
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

type SeatTileProps = {
  seat: Seat
  selected: boolean
  onPick: (seat: Seat) => void
}

function SeatTile({ seat, selected, onPick }: SeatTileProps) {
  const taken = seat.status === 'unavailable'
  const vip = seat.tier === 'VIP'

  let shell =
    'flex min-h-[3.25rem] w-full flex-col items-center justify-center gap-0.5 overflow-visible rounded-md border-0 px-0.5 py-1.5 font-inherit shadow-sm outline-none sm:min-h-[3.5rem] sm:rounded-lg sm:py-2 md:min-h-14 focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060b14]'

  let iconClass =
    'block h-[1.125rem] w-[1.125rem] shrink-0 sm:h-5 sm:w-5 md:h-6 md:w-6'

  if (taken) {
    shell +=
      ' cursor-not-allowed bg-red-950/80 text-red-200 ring-1 ring-red-500/40'
    iconClass += ' opacity-55'
  } else if (selected) {
    shell +=
      ' cursor-pointer bg-sky-600 text-white ring-2 ring-sky-300 ring-offset-1 ring-offset-[#060b14] active:scale-[0.98] sm:ring-offset-2'
  } else if (vip) {
    shell +=
      ' cursor-pointer bg-slate-900 text-amber-50 ring-2 ring-amber-400/85 ring-offset-1 ring-offset-[#060b14] active:scale-[0.98] sm:ring-offset-2'
  } else {
    shell +=
      ' cursor-pointer bg-emerald-700 text-white ring-1 ring-emerald-400/35 active:scale-[0.98]'
  }

  const label = `${seat.id} · ${seat.tier} · ₹${seat.price}`

  const inner = (
    <>
      <span className="flex shrink-0 items-center justify-center leading-none">
        <Armchair className={iconClass} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="text-[8px] font-semibold leading-none tabular-nums sm:text-[9px] md:text-[10px]">
        {seat.id}
      </span>
    </>
  )

  if (taken) {
    return (
      <div className={shell} title={label} aria-disabled="true">
        {inner}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={shell}
      title={label}
      aria-pressed={selected}
      onClick={() => onPick(seat)}
    >
      {inner}
    </button>
  )
}

type SeatRowProps = RowGroup & {
  pickedIds: string[]
  onSeatClick: (seat: Seat) => void
}

function SeatRow({ row, seats, pickedIds, onSeatClick }: SeatRowProps) {
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
          <SeatTile
            key={seat.id}
            seat={seat}
            selected={pickedIds.includes(seat.id)}
            onPick={onSeatClick}
          />
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

export function SeatGrid({ seats, pickedIds, onSeatClick }: SeatGridProps) {
  const chosen = pickedIds ?? []
  const list = seats ?? []
  const onPick = onSeatClick ?? (() => {})

  const vipSeats = list.filter((s) => s.tier === 'VIP')
  const generalSeats = list.filter((s) => s.tier === 'General')

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
            <SeatRow
              key={rg.row}
              row={rg.row}
              seats={rg.seats}
              pickedIds={chosen}
              onSeatClick={onPick}
            />
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
            <SeatRow
              key={rg.row}
              row={rg.row}
              seats={rg.seats}
              pickedIds={chosen}
              onSeatClick={onPick}
            />
          ))}
        </SectionShell>
      </div>
    </div>
  )
}
