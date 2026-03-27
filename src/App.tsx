import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

function Screen() {
  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100">
      <main className="mx-auto flex max-w-lg flex-col gap-3 px-6 py-16">
        <p className="text-sm font-medium text-emerald-400/90">
          Event ticket booking
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Shell is ready
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          Vite, React, TypeScript, Tailwind CSS, and TanStack Query are
          configured.
        </p>
      </main>
    </div>
  )
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <Screen />
    </QueryClientProvider>
  )
}
