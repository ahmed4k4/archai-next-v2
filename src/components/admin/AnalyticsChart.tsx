"use client";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const COLORS = ["#7c5cff", "#4ce2d0", "#ad97ff", "#5ff5e0", "#ff6b9d"];

const tooltipStyle = {
  backgroundColor: "rgba(10,14,31,0.95)",
  border: "1px solid rgba(124,92,255,0.3)",
  borderRadius: "10px",
  color: "#e5deff",
  fontSize: "12px",
  padding: "8px 12px",
};

export function VisitorsArea({
  data,
}: {
  data: { t: string; visitors: number; page_views: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.6} />
            <stop offset="100%" stopColor="#7c5cff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ce2d0" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#4ce2d0" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(173,151,255,0.06)" vertical={false} />
        <XAxis
          dataKey="t"
          stroke="rgba(173,151,255,0.3)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(173,151,255,0.3)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="visitors"
          stroke="#7c5cff"
          strokeWidth={2}
          fill="url(#visitorsGrad)"
        />
        <Area
          type="monotone"
          dataKey="page_views"
          stroke="#4ce2d0"
          strokeWidth={2}
          fill="url(#viewsGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function DevicesPie({
  data,
}: {
  data: { device_type: string; sessions: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sessions"
          nameKey="device_type"
          cx="50%"
          cy="50%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopProjectsBar({
  data,
}: {
  data: { name: string; views: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7c5cff" />
            <stop offset="100%" stopColor="#4ce2d0" />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(173,151,255,0.06)" vertical={false} />
        <XAxis
          dataKey="name"
          stroke="rgba(173,151,255,0.3)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="rgba(173,151,255,0.3)"
          fontSize={10}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(124,92,255,0.05)" }} />
        <Bar dataKey="views" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SourcesPie({
  data,
}: {
  data: { referrer_type: string; sessions: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sessions"
          nameKey="referrer_type"
          cx="50%"
          cy="50%"
          outerRadius={80}
          paddingAngle={3}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
      </PieChart>
    </ResponsiveContainer>
  );
}