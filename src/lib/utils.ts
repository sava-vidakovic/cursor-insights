import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const parseCSV = (csvText: string) => {
  const lines = csvText.trim().split("\n");
  const headers = lines[0]
    .split(",")
    .map((header) => header.replace(/"/g, "").trim());

  const data = lines
    .slice(1)
    .map((line) => {
      const values = line
        .split(",")
        .map((value) => value.replace(/"/g, "").trim());
      const row: Record<string, string> = {};

      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });

      return row;
    })
    .filter((row) => Object.values(row).some((value) => value !== ""));

  return data;
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numValue);
};

export const formatNumber = (value: string | number) => {
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("en-US").format(numValue);
};

export const getUsageByDay = (data: Record<string, string>[]) => {
  const usageByDay: Record<
    string,
    { totalTokens: number; totalCost: number; requests: number }
  > = {};

  data.forEach((row) => {
    const date = new Date(row.Date).toDateString();
    const totalTokens = parseInt(row["Total Tokens"]) || 0;
    const cost = parseFloat(row.Cost) || 0;

    if (!usageByDay[date]) {
      usageByDay[date] = { totalTokens: 0, totalCost: 0, requests: 0 };
    }

    usageByDay[date].totalTokens += totalTokens;
    usageByDay[date].totalCost += cost;
    usageByDay[date].requests += 1;
  });

  return Object.entries(usageByDay)
    .map(([date, stats]) => ({
      date: new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      fullDate: date,
      ...stats,
    }))
    .sort(
      (a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );
};

export const getUsageByModelAndDay = (data: Record<string, string>[]) => {
  const usageByModelAndDay: Record<
    string,
    Record<string, { totalTokens: number; totalCost: number; requests: number }>
  > = {};

  data.forEach((row) => {
    const date = new Date(row.Date).toDateString();
    const model = row.Model || "Unknown";
    const totalTokens = parseInt(row["Total Tokens"]) || 0;
    const cost = parseFloat(row.Cost) || 0;

    if (!usageByModelAndDay[model]) {
      usageByModelAndDay[model] = {};
    }

    if (!usageByModelAndDay[model][date]) {
      usageByModelAndDay[model][date] = {
        totalTokens: 0,
        totalCost: 0,
        requests: 0,
      };
    }

    usageByModelAndDay[model][date].totalTokens += totalTokens;
    usageByModelAndDay[model][date].totalCost += cost;
    usageByModelAndDay[model][date].requests += 1;
  });

  return usageByModelAndDay;
};

export const filterDataByDate = (
  data: Record<string, string>[],
  filter: {
    type: "all" | "day" | "month" | "year" | "range";
    date?: Date;
    startDate?: Date;
    endDate?: Date;
  }
) => {
  if (filter.type === "all") {
    return data;
  }

  return data.filter((row) => {
    const rowDate = new Date(row.Date);

    switch (filter.type) {
      case "day":
        if (!filter.date) return true;
        return (
          rowDate.getFullYear() === filter.date.getFullYear() &&
          rowDate.getMonth() === filter.date.getMonth() &&
          rowDate.getDate() === filter.date.getDate()
        );

      case "month":
        if (!filter.date) return true;
        return (
          rowDate.getFullYear() === filter.date.getFullYear() &&
          rowDate.getMonth() === filter.date.getMonth()
        );

      case "year":
        if (!filter.date) return true;
        return rowDate.getFullYear() === filter.date.getFullYear();

      case "range":
        if (!filter.startDate || !filter.endDate) return true;
        const start = new Date(filter.startDate);
        const end = new Date(filter.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        return rowDate >= start && rowDate <= end;

      default:
        return true;
    }
  });
};

export const getAvailableDates = (data: Record<string, string>[]) => {
  return data
    .map((row) => new Date(row.Date))
    .filter((date) => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
};
