import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency, formatNumber } from "@/lib/utils";

interface UsageByModelChartProps {
  data: Record<
    string,
    Record<string, { totalTokens: number; totalCost: number; requests: number }>
  >;
}

export const UsageByModelChart = ({ data }: UsageByModelChartProps) => {
  // Transform data for the chart
  const chartData = Object.entries(data).reduce((acc, [model, dayData]) => {
    Object.entries(dayData).forEach(([date, stats]) => {
      const formattedDate = new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      if (!acc[formattedDate]) {
        acc[formattedDate] = { date: formattedDate };
      }

      acc[formattedDate][`${model}_tokens`] = stats.totalTokens;
      acc[formattedDate][`${model}_cost`] = stats.totalCost;
    });

    return acc;
  }, {} as Record<string, any>);

  const chartDataArray = Object.values(chartData).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const models = Object.keys(data);
  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00ff00"];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey}:{" "}
              {entry.dataKey.includes("cost")
                ? formatCurrency(entry.value || 0)
                : formatNumber(entry.value || 0)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage by Model and Day</CardTitle>
        <CardDescription>
          Token usage breakdown by model over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartDataArray}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              {models.map((model, index) => (
                <Line
                  key={`${model}_tokens`}
                  type="monotone"
                  dataKey={`${model}_tokens`}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  name={`${model} (tokens)`}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
