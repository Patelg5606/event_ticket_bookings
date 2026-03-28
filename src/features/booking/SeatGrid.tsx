import { Armchair } from 'lucide-react'
import { memo, useMemo, type ReactNode } from 'react'
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

/**
 * Mobile: rows use full width so 10 columns shrink evenly (no forced min-width clip).
 * Very narrow viewports: allow horizontal scroll as fallback.
 */
function SeatMapScroll({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 overflow-x-auto overscroll-x-contain px-1 [-webkit-overflow-scrolling:touch] sm:mx-0 sm:overflow-visible sm:px-0">
      <div className="mx-auto w-full min-w-0 max-w-full sm:max-w-2xl md:max-w-3xl">
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

type SeatTileProps = {
  seat: Seat
  reserved: boolean
  onPick: (seat: Seat) => void
}

const SeatTile = memo(function SeatTile({ seat, reserved, onPick }: SeatTileProps) {
  const taken = seat.status === 'unavailable'
  const vip = seat.tier === 'VIP'

  let shell =
    'flex min-h-[2.75rem] w-full min-w-0 max-w-full flex-col items-center justify-center gap-0 overflow-visible rounded-md border-0 px-0 py-1 font-inherit shadow-sm outline-none sm:min-h-[3.25rem] sm:gap-0.5 sm:px-0.5 sm:rounded-lg sm:py-2 md:min-h-14 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-[#060b14] sm:focus-visible:ring-offset-2'

  let iconClass =
    'block h-4 w-4 shrink-0 sm:h-[1.125rem] sm:w-[1.125rem] md:h-5 md:w-5 lg:h-6 lg:w-6'

  if (taken) {
    shell +=
      ' cursor-not-allowed bg-slate-800/70 text-slate-500 ring-1 ring-slate-600/50 hover:bg-slate-800/85'
    iconClass += ' text-slate-600 opacity-40'
  } else if (reserved) {
    shell +=
      ' cursor-pointer bg-amber-500 text-amber-950 ring-1 ring-amber-200 ring-offset-0 ring-offset-[#060b14] active:scale-[0.98] focus-visible:ring-amber-400 sm:ring-2 sm:ring-offset-1 sm:ring-offset-2'
  } else if (vip) {
    shell +=
      ' cursor-pointer bg-slate-900 text-amber-50 ring-1 ring-amber-400/85 ring-offset-0 ring-offset-[#060b14] active:scale-[0.98] focus-visible:ring-amber-500 sm:ring-2 sm:ring-offset-1 sm:ring-offset-2'
  } else {
    shell +=
      ' cursor-pointer bg-emerald-700 text-white ring-1 ring-emerald-400/35 active:scale-[0.98] focus-visible:ring-emerald-400'
  }

  const label = `${seat.id} · ${seat.tier} · ₹${seat.price}`

  const inner = (
    <>
      <span className="flex shrink-0 items-center justify-center leading-none">
        <Armchair className={iconClass} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="max-w-full truncate px-px text-[7px] font-semibold leading-none tabular-nums sm:text-[8px] sm:px-0 md:text-[9px] lg:text-[10px]">
        {seat.id}
      </span>
    </>
  )

  if (taken) {
    return (
      <button
        type="button"
        className={shell}
        title={`${seat.id} — already booked`}
        aria-label={`${seat.id}, already booked`}
        onClick={() => onPick(seat)}
      >
        {inner}
      </button>
    )
  }

  return (
    <button
      type="button"
      className={shell}
      title={reserved ? `${seat.id} — reserved for you` : label}
      aria-pressed={reserved}
      onClick={() => onPick(seat)}
    >
      {inner}
    </button>
  )
})

type SeatRowProps = RowGroup & {
  pickedSet: Set<string>
  onSeatClick: (seat: Seat) => void
}

const SeatRow = memo(function SeatRow({
  row,
  seats,
  pickedSet,
  onSeatClick,
}: SeatRowProps) {
  return (
    <div className="flex min-w-0 max-w-full items-stretch gap-1 sm:gap-2 md:gap-2.5 lg:gap-3">
      <div
        className="flex w-[1.375rem] shrink-0 items-center justify-center rounded border border-slate-700/80 bg-slate-800/90 text-[10px] font-bold leading-none text-slate-100 shadow-inner sm:w-8 sm:rounded-md sm:text-xs md:w-9 md:rounded-lg md:text-sm"
        aria-hidden
      >
        {row}
      </div>
      <div className="grid min-w-0 flex-1 gap-1 sm:gap-2 md:gap-2.5 lg:gap-3 [grid-template-columns:repeat(10,minmax(0,1fr))]">
        {seats.map((seat) => (
          <SeatTile
            key={seat.id}
            seat={seat}
            reserved={pickedSet.has(seat.id)}
            onPick={onSeatClick}
          />
        ))}
      </div>
    </div>
  )
})

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
      role={role}
      aria-label={ariaLabel}
    >
      <header className="mb-1 flex flex-col gap-1 sm:mb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-white sm:text-base md:text-lg">
            {title}{' '}
            <span className="text-[11px] text-slate-400 sm:text-xs md:text-sm">
              ({subtitle})
            </span>
          </h2>
        </div>
      </header>
      <div className="flex flex-col gap-2 sm:gap-2.5">{children}</div>
    </section>
  )
}

export const SeatGrid = memo(function SeatGrid({
  seats,
  pickedIds,
  onSeatClick,
}: SeatGridProps) {
  const onPick = onSeatClick ?? (() => {})

  const pickedSet = useMemo(() => new Set(pickedIds ?? []), [pickedIds])

  const { vipRows, generalRows } = useMemo(() => {
    const list = seats ?? []
    const vipSeats = list.filter((s) => s.tier === 'VIP')
    const generalSeats = list.filter((s) => s.tier === 'General')
    return {
      vipRows: buildRowGroups(vipSeats),
      generalRows: buildRowGroups(generalSeats),
    }
  }, [seats])

  return (
    <div className="flex min-w-0 max-w-full flex-col gap-1 sm:gap-5">
      <p className="text-center text-[10px] font-medium uppercase tracking-[0.15em] text-slate-500 sm:text-xs sm:tracking-[0.18em]">
        Front of venue
      </p>

      <SeatMapScroll>
        <div className="flex flex-col gap-6 md:gap-4">
          <SectionShell
            title="VIP"
            subtitle="Rows A–B · ₹350 per seat"
            role="group"
            ariaLabel="VIP seats"
          >
            {vipRows.map((rg) => (
              <SeatRow
                key={rg.row}
                row={rg.row}
                seats={rg.seats}
                pickedSet={pickedSet}
                onSeatClick={onPick}
              />
            ))}
          </SectionShell>

          <SectionShell
            title="General"
            subtitle="Rows C–J · ₹150 per seat"
            role="group"
            ariaLabel="General seats"
          >
            {generalRows.map((rg) => (
              <SeatRow
                key={rg.row}
                row={rg.row}
                seats={rg.seats}
                pickedSet={pickedSet}
                onSeatClick={onPick}
              />
            ))}
          </SectionShell>
        </div>
      </SeatMapScroll>
    </div>
  )
})
