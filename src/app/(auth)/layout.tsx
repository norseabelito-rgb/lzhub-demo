export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Gradient glow background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 blur-3xl -z-10" />

      <div className="mb-8 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight text-primary text-glow">
          LaserZone
        </h1>
        <p className="mt-2 text-muted-foreground">Hub Intern</p>
      </div>
      {children}
    </div>
  )
}
