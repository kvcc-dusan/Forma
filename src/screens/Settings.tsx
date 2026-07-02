import { useState } from 'react'
import { Download, Moon, Sun, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { PageHeader } from '@/components/page-header'
import { MetricPill, SectionHeader } from '@/components/primitives'
import { HeartSafeBlock } from '@/components/heart-safe-block'
import { useTheme } from '@/components/theme-provider'
import { program } from '@/lib/program'
import {
  clearAllData,
  getAllBodyweight,
  getAllSessions,
} from '@/lib/db'
import { useSessions } from '@/hooks/useStore'

export function Settings() {
  const { theme, toggle } = useTheme()
  const { sessions, reload } = useSessions()
  const [confirming, setConfirming] = useState(false)

  const exportData = async () => {
    const [s, bw] = await Promise.all([getAllSessions(), getAllBodyweight()])
    const blob = new Blob(
      [JSON.stringify({ exportedAt: new Date().toISOString(), sessions: s, bodyweight: bw }, null, 2)],
      { type: 'application/json' },
    )
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `forma-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const wipe = async () => {
    await clearAllData()
    await reload()
    setConfirming(false)
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 pb-4">
        <PageHeader eyebrow="Program & data" title="Settings" />

        {/* Program */}
        <section className="flex flex-col gap-3">
          <SectionHeader title="Program" />
          <div className="rounded-3xl border border-border bg-card p-5">
            <h3 className="text-[17px] font-semibold tracking-tight text-card-foreground">
              {program.meta.name}
            </h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
              {program.meta.phase}
            </p>
            <p className="mt-3 text-pretty text-[13px] leading-relaxed text-muted-foreground">
              {program.meta.notes}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MetricPill
              label="Rest"
              value={`${program.meta.defaultRestSec}s`}
            />
            <MetricPill
              label="Accessory"
              value={`${program.meta.accessoryRestSec}s`}
            />
            <MetricPill label="RIR" value={program.meta.globalRir.join('–')} />
          </div>
        </section>

        {/* Heart-safe constraints (all) */}
        <section className="flex flex-col gap-3">
          <SectionHeader title="Heart-safe constraints" />
          <HeartSafeBlock title={program.constraints.id} notes={program.constraints.rules} />
        </section>

        {/* Appearance */}
        <section className="flex flex-col gap-3">
          <SectionHeader title="Appearance" />
          <button
            type="button"
            onClick={toggle}
            className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-left"
          >
            <span className="text-[14px] font-medium text-card-foreground">
              Theme
            </span>
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              {theme === 'dark' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
          </button>
        </section>

        {/* Data */}
        <section className="flex flex-col gap-3">
          <SectionHeader title="Your data" />
          <p className="text-[13px] text-muted-foreground">
            {sessions.length} session{sessions.length === 1 ? '' : 's'} stored
            locally on this device. Nothing leaves your phone.
          </p>
          <button
            type="button"
            onClick={exportData}
            className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary/40"
          >
            <Download className="h-[18px] w-[18px] text-muted-foreground" />
            <span className="text-[14px] font-medium text-card-foreground">
              Export backup (JSON)
            </span>
          </button>

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-[18px] w-[18px] text-destructive" />
              <span className="text-[14px] font-medium text-destructive">
                Clear all data
              </span>
            </button>
          ) : (
            <div className="flex flex-col gap-2 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-[13px] text-foreground">
                Delete all sessions and bodyweight entries? This can't be undone.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={wipe}
                  className="flex-1 rounded-xl bg-destructive/20 py-2.5 text-[13px] font-semibold text-destructive"
                >
                  Delete everything
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-xl border border-border bg-card py-2.5 text-[13px] font-medium text-muted-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>

        <p className="pt-2 text-center text-[12px] text-muted-foreground/70">
          Forma · offline-first · v1.0
        </p>
      </div>
    </AppShell>
  )
}
