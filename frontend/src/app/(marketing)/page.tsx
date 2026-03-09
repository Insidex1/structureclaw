import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] gap-8 p-8">
      <h1 className="text-4xl font-bold">StructureClaw</h1>
      <p className="text-muted-foreground text-center max-w-md">
        结构工程 AI 工作台 - 美观、专业、易用
      </p>
      <Link href="/console">
        <Button size="lg">进入控制台</Button>
      </Link>
    </div>
  )
}
