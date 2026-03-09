import { ThemeToggle } from '@/components/theme-toggle'
import Link from 'next/link'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-semibold">StructureClaw</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/console" className="text-sm text-muted-foreground hover:text-foreground">
            Console
          </Link>
          <ThemeToggle />
        </nav>
      </header>
      <main>{children}</main>
    </div>
  )
}
