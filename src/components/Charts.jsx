import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const chartColors = ['#00ff66', '#34d399', '#bef264', '#facc15', '#f87171', '#a7f3d0'];

export function LaunchTrendChart({ launches }) {
  const byYear = launches.reduce((acc, launch) => {
    const year = new Date(launch.date_utc).getUTCFullYear();
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});
  const data = Object.entries(byYear).map(([year, count]) => ({ year, count }));

  return (
    <ResponsiveContainer width="100%" height={270}>
      <LineChart data={data}>
        <CartesianGrid stroke="rgba(16,185,129,0.12)" vertical={false} />
        <XAxis dataKey="year" stroke="#6ee7b7" tick={{ fontSize: 11 }} />
        <YAxis stroke="#6ee7b7" tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#00ff66" strokeWidth={3} dot={{ fill: '#000', stroke: '#00ff66', strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DonutChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} innerRadius={64} outerRadius={96} paddingAngle={3} dataKey="value" nameKey="name">
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24 }}>
        <CartesianGrid stroke="rgba(16,185,129,0.12)" horizontal={false} />
        <XAxis type="number" stroke="#6ee7b7" tick={{ fontSize: 11 }} allowDecimals={false} />
        <YAxis dataKey="name" type="category" stroke="#6ee7b7" tick={{ fontSize: 11 }} width={110} />
        <Tooltip />
        <Bar dataKey="value" fill="#00ff66" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function CompactBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={data}>
        <CartesianGrid stroke="rgba(16,185,129,0.12)" vertical={false} />
        <XAxis dataKey="name" stroke="#6ee7b7" tick={{ fontSize: 11 }} />
        <YAxis stroke="#6ee7b7" tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip />
        <Bar dataKey="value" fill="#00ff66" />
      </BarChart>
    </ResponsiveContainer>
  );
}
