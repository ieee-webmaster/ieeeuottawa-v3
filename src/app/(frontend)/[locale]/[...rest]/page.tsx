import { notFound } from 'next/navigation'

// Route unmatched nested URLs through the localized not-found boundary.
export default function UnmatchedPage() {
  notFound()
}
