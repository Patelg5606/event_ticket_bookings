import { HomePage } from '@/pages/HomePage'
import { AppProviders } from './providers/AppProviders'

export default function App() {
  return (
    <AppProviders>
      <HomePage />
    </AppProviders>
  )
}
