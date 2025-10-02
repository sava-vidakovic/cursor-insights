import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";

export type FilterType = "all" | "day" | "month" | "year" | "range";

interface DateFilterProps {
  onFilterChange: (filter: {
    type: FilterType;
    date?: Date;
    startDate?: Date;
    endDate?: Date;
  }) => void;
  availableDates: Date[];
}

export const DateFilter = ({
  onFilterChange,
  availableDates,
}: DateFilterProps) => {
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleFilterTypeChange = (type: FilterType) => {
    setFilterType(type);
    if (type === "all") {
      onFilterChange({ type: "all" });
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      onFilterChange({ type: filterType, date });
    }
  };

  const handleRangeSelect = (date: Date | undefined, isStart: boolean) => {
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    if (startDate && endDate) {
      onFilterChange({
        type: "range",
        startDate: isStart ? date : startDate,
        endDate: isStart ? endDate : date,
      });
    }
  };

  const clearFilters = () => {
    setFilterType("all");
    setSelectedDate(undefined);
    setStartDate(undefined);
    setEndDate(undefined);
    onFilterChange({ type: "all" });
  };

  const getAvailableYears = () => {
    const years = [
      ...new Set(availableDates.map((date) => date.getFullYear())),
    ];
    return years.sort((a, b) => b - a);
  };

  const getAvailableMonths = () => {
    const months = [
      ...new Set(
        availableDates.map(
          (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}`
        )
      ),
    ];
    return months.sort();
  };

  const getAvailableDays = () => {
    const days = [
      ...new Set(
        availableDates.map(
          (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              "0"
            )}-${String(date.getDate()).padStart(2, "0")}`
        )
      ),
    ];
    return days.sort();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Date Filters
        </CardTitle>
        <CardDescription>
          Filter your usage data by specific time periods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={handleFilterTypeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="year">By Year</SelectItem>
              <SelectItem value="month">By Month</SelectItem>
              <SelectItem value="day">By Day</SelectItem>
              <SelectItem value="range">Date Range</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear
          </Button>
        </div>

        {filterType === "year" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Year</label>
            <Select
              onValueChange={(year) => {
                const date = new Date(parseInt(year), 0, 1);
                handleDateSelect(date);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose year..." />
              </SelectTrigger>
              <SelectContent>
                {getAvailableYears().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterType === "month" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Month</label>
            <Select
              onValueChange={(monthStr) => {
                const [year, month] = monthStr.split("-");
                const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                handleDateSelect(date);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose month..." />
              </SelectTrigger>
              <SelectContent>
                {getAvailableMonths().map((month) => (
                  <SelectItem key={month} value={month}>
                    {format(new Date(month + "-01"), "MMMM yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterType === "day" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Day</label>
            <Select
              onValueChange={(dayStr) => {
                const date = new Date(dayStr);
                handleDateSelect(date);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose day..." />
              </SelectTrigger>
              <SelectContent>
                {getAvailableDays().map((day) => (
                  <SelectItem key={day} value={day}>
                    {format(new Date(day), "MMM dd, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterType === "range" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => handleRangeSelect(date, true)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={(date) => handleRangeSelect(date, false)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {filterType !== "all" && (
          <div className="text-sm text-muted-foreground">
            {filterType === "year" && selectedDate && (
              <>Showing data for {selectedDate.getFullYear()}</>
            )}
            {filterType === "month" && selectedDate && (
              <>Showing data for {format(selectedDate, "MMMM yyyy")}</>
            )}
            {filterType === "day" && selectedDate && (
              <>Showing data for {format(selectedDate, "PPP")}</>
            )}
            {filterType === "range" && startDate && endDate && (
              <>
                Showing data from {format(startDate, "MMM dd")} to{" "}
                {format(endDate, "MMM dd, yyyy")}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
