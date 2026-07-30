"use client";

import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const FOREST = "#1C3D2F";
const AMBER = "#D9820C";

function fmtShort(n: number) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(".", ",") + " M FCFA";
  if (n >= 1000) return (n / 1000).toFixed(0) + " K FCFA";
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-cream-dark bg-white p-3 text-xs shadow-lg">
      <div className="mb-2 font-semibold text-zinc-900">{label}</div>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center justify-between gap-2">
          <span className="text-zinc-500">{p.name}</span>
          <span className="font-mono font-medium" style={{ color: p.color }}>
            {fmtShort(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function RevenueByClassChart({ data }: { data: { name: string; montant: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barSize={28}>
        <CartesianGrid vertical={false} stroke="#F0EDE6" />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9B9589" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
          tick={{ fontSize: 11, fill: "#9B9589" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="montant" name="Montant" fill={FOREST} radius={[5, 5, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyRevenueChart({ data }: { data: { mois: string; revenus: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={FOREST} stopOpacity={0.2} />
            <stop offset="95%" stopColor={FOREST} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#F0EDE6" />
        <XAxis dataKey="mois" tick={{ fontSize: 11, fill: "#9B9589" }} axisLine={false} tickLine={false} />
        <YAxis
          tickFormatter={(v) => (v / 1000000).toFixed(1) + "M"}
          tick={{ fontSize: 11, fill: "#9B9589" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenus"
          name="Revenus"
          stroke={FOREST}
          fill="url(#revGrad)"
          strokeWidth={2}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { AMBER, FOREST};
