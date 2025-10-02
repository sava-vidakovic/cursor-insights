import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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

interface UsageByDayChartProps {
  data: Array<{
    date: string;
    fullDate: string;
    totalTokens: number;
    totalCost: number;
    requests: number;
  }>;
}

export const UsageByDayChart = ({ data }: UsageByDayChartProps) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload[0] && (
            <p className="text-sm text-muted-foreground">
              Tokens: {formatNumber(payload[0].value || 0)}
            </p>
          )}
          {payload[1] && (
            <p className="text-sm text-muted-foreground">
              Cost: {formatCurrency(payload[1].value || 0)}
            </p>
          )}
          {payload[2] && (
            <p className="text-sm text-muted-foreground">
              Requests: {payload[2].value || 0}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage by Day</CardTitle>
        <CardDescription>
          Daily token usage, cost, and request count
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
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
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                yAxisId="left"
                dataKey="totalTokens"
                fill="#8884d8"
                name="Total Tokens"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="totalCost"
                fill="#82ca9d"
                name="Total Cost"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};
