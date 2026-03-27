import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { createAppQueryClient } from './queryClient'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  const [client] = useState(createAppQueryClient)

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
