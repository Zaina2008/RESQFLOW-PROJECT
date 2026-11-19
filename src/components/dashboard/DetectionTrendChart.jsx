import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function DetectionTrendChart({ data = [], height = 240 }) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2789E8" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#2789E8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(155,168,186,0.10)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#9BA8BA", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis tick={{ fill: "#9BA8BA", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#0d1420",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              fontSize: 12,
              color: "#F4F6FA",
            }}
            labelStyle={{ color: "#9BA8BA", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" }}
          />
          <Area type="monotone" dataKey="count" name="Detections" stroke="#2789E8" strokeWidth={2} fill="url(#trendFill)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
