import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Calendar,
  CheckSquare,
  GraduationCap,
  Share2,
  FolderOpen,
  LucideIcon,
} from 'lucide-react'
import type { QuickAction } from '@/lib/dashboard'

interface QuickActionsProps {
  actions: QuickAction[]
}

const iconMap: Record<string, LucideIcon> = {
  Calendar,
  CheckSquare,
  GraduationCap,
  Share2,
  FolderOpen,
}

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="border-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">Actiuni rapide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = iconMap[action.icon] || CheckSquare

            return (
              <Link
                key={action.id}
                href={action.href}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-4 text-center transition-all duration-200 hover:bg-primary/10 hover:border-primary/50 hover:glow-subtle"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{action.label}</p>
                  {action.description && (
                    <p className="text-xs text-muted-foreground">
                      {action.description}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
