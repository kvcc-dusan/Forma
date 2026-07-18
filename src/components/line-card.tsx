import type { ReactNode } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { PointXY } from '@/lib/analytics'

// A themed line chart inside the standard card. Used across the Progress screen
// for load, completion, bodyweight, and mood/energy trends.
export function LineCard({
  title,
  unit,
  data,
  domain,
  action,
  emptyHint,
  height = 160,
}: {
  title: string
  unit?: string
  data: PointXY[]
  domain?: [number | 'auto', number | 'auto']
  action?: ReactNode
  emptyHint?: string
  height?: number
}) {
  const latest = data.length > 0 ? data[data.length - 1].value : null

  return (
    <div className="rounded-3xl bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-label text-muted-foreground">
            {title}
          </p>
          {latest !== null && (
            <p className="mt-1.5 text-2xl font-semibold tracking-tight text-card-foreground tabular-nums">
              {latest}
              {unit ? (
                <span className="ml-1 text-[13px] font-normal text-muted-foreground">
                  {unit}
                </span>
              ) : null}
            </p>
          )}
        </div>
        {action}
      </div>

      {data.length < 2 ? (
        <p className="mt-6 mb-2 text-[13px] text-muted-foreground">
          {emptyHint ?? 'Not enough data yet — log a few sessions.'}
        </p>
      ) : (
        <div className="mt-4" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 6, right: 6, bottom: 0, left: -18 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                minTickGap={20}
              />
              <YAxis
                domain={domain ?? ['auto', 'auto']}
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ stroke: 'var(--border)' }}
                contentStyle={{
                  background: 'var(--popover)',
                  border: '1px solid var(--border)',
                  borderRadius: 12,
                  fontSize: 12,
                  color: 'var(--popover-foreground)',
                }}
                labelStyle={{ color: 'var(--muted-foreground)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                name={title}
                stroke="var(--accent)"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: 'var(--accent)' }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
