"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";

const FOREST = "#1C3D2F";
const AMBER = "#D9820C";

function fmtShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`;
  return String(n);
}

export function RevenueByClassChart({
  data,
}: {
  data: { name: string; total: number }[];
}) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-zinc-500 py-8 text-center">
        Aucun encaissement à afficher par classe.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DB" />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6B6557" }} />
          <YAxis tick={{ fontSize: 11, fill: "#6B6557" }} tickFormatter={fmtShort} />
          <Tooltip
            formatter={(value) =>
              `${new Intl.NumberFormat("fr-FR").format(Number(value))} FCFA`
            }
            contentStyle={{ borderRadius: 8, border: "1px solid #E8E4DB", fontSize: 12 }}
          />
          <Bar dataKey="total" name="Encaissé" fill={FOREST} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyRevenueChart({
  data,
}: {
  data: { month: string; revenus: number }[];
}) {
  const chartData = data.map((d) => ({
    ...d,
    label: d.month.slice(5) + "/" + d.month.slice(2, 4),
  }));

  const hasData = data.some((d) => d.revenus > 0);
  if (!hasData) {
    return (
      <p className="text-sm text-zinc-500 py-8 text-center">
        Aucun flux mensuel pour le moment.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={AMBER} stopOpacity={0.25} />
              <stop offset="95%" stopColor={AMBER} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DB" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6B6557" }} />
          <YAxis tick={{ fontSize: 11, fill: "#6B6557" }} tickFormatter={fmtShort} />
          <Tooltip
            formatter={(value) =>
              `${new Intl.NumberFormat("fr-FR").format(Number(value))} FCFA`
            }
            contentStyle={{ borderRadius: 8, border: "1px solid #E8E4DB", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenus"
            name="Revenus"
            stroke={AMBER}
            fill="url(#revGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}