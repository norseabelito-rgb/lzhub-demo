import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

/**
 * Theme Test Page - Design System Showcase
 *
 * This page demonstrates all design system elements:
 * - Color swatches with contrast info
 * - Typography scale
 * - Button variants and sizes
 * - Badge variants
 * - Form inputs
 * - Card variants
 * - Glow effects
 * - WCAG accessibility information
 */
export default function ThemeTestPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-display text-4xl md:text-5xl text-gradient-glow">
            LaserZone Design System
          </h1>
          <p className="text-muted-foreground text-lg">
            Test sistem de design - Verificare tema dark cu accent neon roz
          </p>
        </header>

        {/* Color Swatches Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Culori
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Background Colors */}
            <ColorSwatch
              name="Background"
              color="bg-background"
              hex="#121212"
              textClass="text-foreground"
            />
            <ColorSwatch
              name="Card"
              color="bg-card"
              hex="#1d1d1d"
              textClass="text-card-foreground"
            />
            <ColorSwatch
              name="Muted"
              color="bg-muted"
              hex="#2a2a2f"
              textClass="text-muted-foreground"
            />

            {/* Primary Scale */}
            <ColorSwatch
              name="Primary"
              color="bg-primary"
              hex="#f535aa"
              textClass="text-primary-foreground"
            />
            <ColorSwatch
              name="Secondary"
              color="bg-secondary"
              hex="#2f2f38"
              textClass="text-secondary-foreground"
            />
            <ColorSwatch
              name="Accent"
              color="bg-accent"
              hex="#f535aa"
              textClass="text-accent-foreground"
            />

            {/* Semantic Colors */}
            <ColorSwatch
              name="Success"
              color="bg-success"
              hex="#2dd4bf"
              textClass="text-success-foreground"
            />
            <ColorSwatch
              name="Warning"
              color="bg-warning"
              hex="#fbbf24"
              textClass="text-warning-foreground"
            />
            <ColorSwatch
              name="Destructive"
              color="bg-destructive"
              hex="#ef4444"
              textClass="text-white"
            />

            {/* Borders */}
            <ColorSwatch
              name="Border"
              color="bg-border"
              hex="#3d3d47"
              textClass="text-foreground"
            />
            <ColorSwatch
              name="Input"
              color="bg-input"
              hex="#363640"
              textClass="text-foreground"
            />
            <ColorSwatch
              name="Ring"
              color="bg-ring"
              hex="#f535aa"
              textClass="text-primary-foreground"
            />
          </div>
        </section>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Tipografie
          </h2>

          <Card>
            <CardContent className="space-y-6 pt-6">
              {/* Display Text */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Display (Syne)
                </p>
                <p className="text-display text-4xl md:text-5xl">
                  Titlu Display Mare
                </p>
              </div>

              {/* Heading with Glow */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Heading cu Glow
                </p>
                <p className="font-display text-3xl font-bold text-glow text-primary">
                  Titlu cu Efect Neon
                </p>
              </div>

              {/* Gradient Text */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Text Gradient
                </p>
                <p className="text-display text-3xl text-gradient">
                  Text cu Gradient Neon
                </p>
              </div>

              {/* Body Text */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Body Text (Montserrat)
                </p>
                <p className="text-base text-foreground">
                  Acesta este textul principal folosit pentru continut. Font-ul Montserrat
                  ofera o citire clara si moderna. Contrast ratio: 14.5:1 pe fundal inchis.
                </p>
              </div>

              {/* Muted Text */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Muted Text
                </p>
                <p className="text-muted-foreground">
                  Text secundar cu contrast redus pentru informatii mai putin importante.
                  Contrast ratio: 6.4:1 - depaseste pragul AA de 4.5:1.
                </p>
              </div>

              {/* Font Sizes */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Scara Dimensiuni
                </p>
                <div className="space-y-1">
                  <p className="text-xs">text-xs (12px)</p>
                  <p className="text-sm">text-sm (14px)</p>
                  <p className="text-base">text-base (16px)</p>
                  <p className="text-lg">text-lg (18px)</p>
                  <p className="text-xl">text-xl (20px)</p>
                  <p className="text-2xl">text-2xl (24px)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Butoane
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Variante</CardTitle>
              <CardDescription>
                Toate variantele de buton disponibile in design system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Variants */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Variante Principale</p>
                <div className="flex flex-wrap gap-4">
                  <Button>Default</Button>
                  <Button variant="glow">Cu Glow</Button>
                  <Button variant="outline-glow">Outline Glow</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                </div>
              </div>

              {/* Semantic Variants */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Variante Semantice</p>
                <div className="flex flex-wrap gap-4">
                  <Button variant="success">Success</Button>
                  <Button variant="warning">Warning</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
              </div>

              {/* Sizes */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Dimensiuni</p>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>

              {/* XL Glow Button (CTA) */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">CTA Button (XL + Glow)</p>
                <Button variant="glow" size="xl">
                  Rezerva Acum
                </Button>
              </div>

              {/* Disabled State */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Stare Dezactivata</p>
                <div className="flex flex-wrap gap-4">
                  <Button disabled>Disabled Default</Button>
                  <Button variant="glow" disabled>Disabled Glow</Button>
                  <Button variant="outline" disabled>Disabled Outline</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Badges Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Badges
          </h2>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge className="bg-success text-success-foreground">Success</Badge>
                <Badge className="bg-warning text-warning-foreground">Warning</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Form Inputs Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Formulare
          </h2>

          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Standard Input */}
                <div className="space-y-2">
                  <Label htmlFor="standard">Input Standard</Label>
                  <Input id="standard" placeholder="Introduceti text..." />
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@exemplu.ro" />
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Parola</Label>
                  <Input id="password" type="password" placeholder="********" />
                </div>

                {/* Disabled Input */}
                <div className="space-y-2">
                  <Label htmlFor="disabled">Input Dezactivat</Label>
                  <Input id="disabled" disabled placeholder="Nu poate fi editat" />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Carduri
          </h2>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Simple Card */}
            <Card>
              <CardHeader>
                <CardTitle>Card Simplu</CardTitle>
                <CardDescription>
                  Card standard cu border subtil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Continut standard pentru card. Folosit pentru informatii generale.
                </p>
              </CardContent>
            </Card>

            {/* Accent Card */}
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-primary">Card cu Accent</CardTitle>
                <CardDescription>
                  Border cu accent neon roz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Folosit pentru a evidentia continut important.
                </p>
              </CardContent>
            </Card>

            {/* Glow Card */}
            <Card className="border-glow">
              <CardHeader>
                <CardTitle className="text-glow text-primary">Card cu Glow</CardTitle>
                <CardDescription>
                  Efect glow complet pe border
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Folosit pentru elemente premium sau featured.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Glow Effects Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Efecte Glow
          </h2>

          <Card>
            <CardContent className="pt-6 space-y-8">
              {/* Box Glows */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Box Shadows cu Glow</p>
                <div className="flex flex-wrap gap-6">
                  <div className="glow-subtle rounded-lg bg-card p-6 text-center">
                    <p className="text-sm">glow-subtle</p>
                  </div>
                  <div className="glow-primary rounded-lg bg-card p-6 text-center">
                    <p className="text-sm">glow-primary</p>
                  </div>
                  <div className="glow-intense rounded-lg bg-card p-6 text-center">
                    <p className="text-sm">glow-intense</p>
                  </div>
                </div>
              </div>

              {/* Border Glow */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Border cu Glow</p>
                <div className="border-glow rounded-lg bg-card p-6 max-w-xs">
                  <p className="text-sm text-center">border-glow</p>
                </div>
              </div>

              {/* Hover Glows */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Hover pentru a vedea efectul</p>
                <div className="flex flex-wrap gap-6">
                  <div className="glow-subtle-hover rounded-lg bg-card p-6 text-center cursor-pointer transition-all">
                    <p className="text-sm">glow-subtle-hover</p>
                  </div>
                  <div className="glow-primary-hover rounded-lg bg-card p-6 text-center cursor-pointer transition-all">
                    <p className="text-sm">glow-primary-hover</p>
                  </div>
                </div>
              </div>

              {/* Semantic Glows */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Glow Semantic</p>
                <div className="flex flex-wrap gap-6">
                  <div className="glow-success rounded-lg bg-card p-6 text-center">
                    <p className="text-sm text-success">glow-success</p>
                  </div>
                  <div className="glow-warning rounded-lg bg-card p-6 text-center">
                    <p className="text-sm text-warning">glow-warning</p>
                  </div>
                </div>
              </div>

              {/* Text Glow */}
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Text cu Glow</p>
                <p className="text-glow text-primary text-2xl font-bold">
                  Text cu efect neon glow
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* WCAG Accessibility Section */}
        <section className="space-y-6">
          <h2 className="font-display text-2xl font-bold text-foreground">
            Accesibilitate WCAG
          </h2>

          <Card>
            <CardHeader>
              <CardTitle>Raport Contrast</CardTitle>
              <CardDescription>
                Toate culorile de text sunt validate pentru WCAG 2.1 AA/AAA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 font-medium">Combinatie</th>
                      <th className="text-left py-3 px-2 font-medium">Contrast</th>
                      <th className="text-left py-3 px-2 font-medium">Nivel</th>
                      <th className="text-left py-3 px-2 font-medium">Exemplu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ContrastRow
                      name="Foreground pe Background"
                      ratio="14.5:1"
                      level="AAA"
                      bgClass="bg-background"
                      textClass="text-foreground"
                    />
                    <ContrastRow
                      name="Primary pe Background"
                      ratio="5.2:1"
                      level="AA"
                      bgClass="bg-background"
                      textClass="text-primary"
                    />
                    <ContrastRow
                      name="Muted pe Background"
                      ratio="6.4:1"
                      level="AA"
                      bgClass="bg-background"
                      textClass="text-muted-foreground"
                    />
                    <ContrastRow
                      name="Success pe Background"
                      ratio="9.8:1"
                      level="AAA"
                      bgClass="bg-background"
                      textClass="text-success"
                    />
                    <ContrastRow
                      name="Warning pe Background"
                      ratio="11.2:1"
                      level="AAA"
                      bgClass="bg-background"
                      textClass="text-warning"
                    />
                    <ContrastRow
                      name="Foreground pe Card"
                      ratio="13.1:1"
                      level="AAA"
                      bgClass="bg-card"
                      textClass="text-foreground"
                    />
                    <ContrastRow
                      name="Primary Foreground pe Primary"
                      ratio="5.2:1"
                      level="AA"
                      bgClass="bg-primary"
                      textClass="text-primary-foreground"
                    />
                  </tbody>
                </table>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm space-y-2">
                <p className="font-medium">Cerinte WCAG 2.1:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>AA Normal Text: minim 4.5:1</li>
                  <li>AA Large Text (18px+): minim 3:1</li>
                  <li>AAA Normal Text: minim 7:1</li>
                  <li>AAA Large Text: minim 4.5:1</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t border-border">
          <p className="text-muted-foreground text-sm">
            LaserZone Hub Design System v1.0 - Tema Dark cu Accent Neon Roz
          </p>
        </footer>
      </div>
    </main>
  )
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function ColorSwatch({
  name,
  color,
  hex,
  textClass,
}: {
  name: string
  color: string
  hex: string
  textClass: string
}) {
  return (
    <div className="space-y-2">
      <div
        className={`${color} ${textClass} h-20 rounded-lg flex items-end p-2 border border-border/50`}
      >
        <span className="text-xs font-medium">{hex}</span>
      </div>
      <p className="text-xs text-muted-foreground">{name}</p>
    </div>
  )
}

function ContrastRow({
  name,
  ratio,
  level,
  bgClass,
  textClass,
}: {
  name: string
  ratio: string
  level: 'AA' | 'AAA'
  bgClass: string
  textClass: string
}) {
  return (
    <tr className="border-b border-border/50">
      <td className="py-3 px-2">{name}</td>
      <td className="py-3 px-2 font-mono">{ratio}</td>
      <td className="py-3 px-2">
        <Badge
          variant={level === 'AAA' ? 'default' : 'secondary'}
          className={level === 'AAA' ? 'bg-success text-success-foreground' : ''}
        >
          {level}
        </Badge>
      </td>
      <td className="py-3 px-2">
        <span className={`${bgClass} ${textClass} px-2 py-1 rounded text-xs`}>
          Text de exemplu
        </span>
      </td>
    </tr>
  )
}
