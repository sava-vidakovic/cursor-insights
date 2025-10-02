import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsageByDayChart } from "./UsageByDayChart";
import { UsageByModelChart } from "./UsageByModelChart";
import { UsageDataTable } from "./UsageDataTable";
import { DateFilter } from "./DateFilter";
import { BarChart3, DollarSign, Hash, TrendingUp } from "lucide-react";
import {
  formatCurrency,
  formatNumber,
  getUsageByDay,
  getUsageByModelAndDay,
  filterDataByDate,
  getAvailableDates,
} from "@/lib/utils";

interface DashboardProps {
  data: Record<string, string>[];
}

export const Dashboard = ({ data }: DashboardProps) => {
  const [dateFilter, setDateFilter] = useState<{
    type: "all" | "day" | "month" | "year" | "range";
    date?: Date;
    startDate?: Date;
    endDate?: Date;
  }>({ type: "all" });

  const availableDates = useMemo(() => getAvailableDates(data), [data]);

  const filteredData = useMemo(
    () => filterDataByDate(data, dateFilter),
    [data, dateFilter]
  );

  const usageByDay = useMemo(() => getUsageByDay(filteredData), [filteredData]);
  const usageByModelAndDay = useMemo(
    () => getUsageByModelAndDay(filteredData),
    [filteredData]
  );

  // Calculate summary statistics
  const totalTokens = filteredData.reduce(
    (sum, row) => sum + (parseInt(row["Total Tokens"]) || 0),
    0
  );
  const totalCost = filteredData.reduce(
    (sum, row) => sum + (parseFloat(row.Cost) || 0),
    0
  );
  const totalRequests = filteredData.length;
  const averageTokensPerRequest =
    totalRequests > 0 ? Math.round(totalTokens / totalRequests) : 0;

  // Get unique models
  const models = [...new Set(filteredData.map((row) => row.Model))].filter(
    Boolean
  );

  // Calculate average cost per request
  const averageCostPerRequest =
    totalRequests > 0 ? totalCost / totalRequests : 0;

  return (
    <div className="space-y-6">
      {/* Date Filters */}
      <DateFilter
        onFilterChange={setDateFilter}
        availableDates={availableDates}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Hash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalTokens)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(averageTokensPerRequest)} avg per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(averageCostPerRequest)} avg per request
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Requests
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalRequests)}
            </div>
            <p className="text-xs text-muted-foreground">
              {models.length} different models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Models Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">{models.join(", ")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage-by-day" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage-by-day">Usage by Day</TabsTrigger>
          <TabsTrigger value="usage-by-model">Usage by Model</TabsTrigger>
          <TabsTrigger value="data-table">Data Table</TabsTrigger>
        </TabsList>

        <TabsContent value="usage-by-day">
          <UsageByDayChart data={usageByDay} />
        </TabsContent>

        <TabsContent value="usage-by-model">
          <UsageByModelChart data={usageByModelAndDay} />
        </TabsContent>

        <TabsContent value="data-table">
          <UsageDataTable data={filteredData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
