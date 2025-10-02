import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Download,
  X,
} from "lucide-react";
import { formatCurrency, formatNumber, formatDate } from "@/lib/utils";

interface UsageDataTableProps {
  data: Record<string, string>[];
}

type SortField =
  | "Date"
  | "Kind"
  | "Model"
  | "Max Mode"
  | "Input (w/ Cache Write)"
  | "Input (w/o Cache Write)"
  | "Cache Read"
  | "Output Tokens"
  | "Total Tokens"
  | "Cost";
type SortDirection = "asc" | "desc";

export const UsageDataTable = ({ data }: UsageDataTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("Date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [modelFilter, setModelFilter] = useState<string>("all");
  const [requestTypeFilter, setRequestTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Debug: Log available columns
  console.log("Available columns:", data[0] ? Object.keys(data[0]) : []);

  // Get unique models and request types for filters
  const uniqueModels = useMemo(() => {
    const models = [...new Set(data.map((row) => row.Model))].filter(Boolean);
    return models.sort();
  }, [data]);

  const uniqueRequestTypes = useMemo(() => {
    // Try different possible column names for request type
    const possibleColumns = [
      "Kind",
      "Request Type",
      "Type",
      "RequestType",
      "Request_Type",
    ];
    let requestTypeColumn = possibleColumns.find((col) => data[0]?.[col]);

    if (!requestTypeColumn) {
      // If no standard column found, try to find any column that might contain request types
      const allColumns = Object.keys(data[0] || {});
      requestTypeColumn = allColumns.find(
        (col) =>
          col.toLowerCase().includes("type") ||
          col.toLowerCase().includes("request") ||
          col.toLowerCase().includes("kind")
      );
    }

    if (requestTypeColumn) {
      const types = [
        ...new Set(data.map((row) => row[requestTypeColumn!])),
      ].filter(Boolean);
      return types.sort();
    }

    return [];
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    const filtered = data.filter((row) => {
      const matchesSearch =
        row.Model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Kind?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row["Max Mode"]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.Date?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModel = modelFilter === "all" || row.Model === modelFilter;
      const matchesRequestType =
        requestTypeFilter === "all" || row.Kind === requestTypeFilter;

      return matchesSearch && matchesModel && matchesRequestType;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortField];
      let bValue: string | number | Date = b[sortField];

      if (sortField === "Date") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (sortField === "Total Tokens") {
        aValue = parseInt(aValue) || 0;
        bValue = parseInt(bValue) || 0;
      } else if (sortField === "Cost") {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else {
        aValue = aValue?.toString().toLowerCase() || "";
        bValue = bValue?.toString().toLowerCase() || "";
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    data,
    searchTerm,
    modelFilter,
    requestTypeFilter,
    sortField,
    sortDirection,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredAndSortedData.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="h-4 w-4" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setModelFilter("all");
    setRequestTypeFilter("all");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = [
      "Date",
      "Kind",
      "Model",
      "Max Mode",
      "Input (w/ Cache Write)",
      "Input (w/o Cache Write)",
      "Cache Read",
      "Output Tokens",
      "Total Tokens",
      "Cost",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedData.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cursor-usage-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Usage Data Table</CardTitle>
            <CardDescription>
              Detailed view of all usage events with filtering and sorting
            </CardDescription>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by model, kind, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={modelFilter} onValueChange={setModelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Models</SelectItem>
              {uniqueModels.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={requestTypeFilter}
            onValueChange={setRequestTypeFilter}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Kind" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kinds</SelectItem>
              {uniqueRequestTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
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

        {/* Results info */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, filteredAndSortedData.length)}{" "}
            of {filteredAndSortedData.length} events
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredAndSortedData.length} total events
            </Badge>
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("Date")}
                >
                  <div className="flex items-center gap-2">
                    Date
                    {getSortIcon("Date")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("Kind")}
                >
                  <div className="flex items-center gap-2">
                    Kind
                    {getSortIcon("Kind")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("Model")}
                >
                  <div className="flex items-center gap-2">
                    Model
                    {getSortIcon("Model")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("Max Mode")}
                >
                  <div className="flex items-center gap-2">
                    Max Mode
                    {getSortIcon("Max Mode")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Input (w/ Cache Write)")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Input (w/ Cache)
                    {getSortIcon("Input (w/ Cache Write)")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Input (w/o Cache Write)")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Input (w/o Cache)
                    {getSortIcon("Input (w/o Cache Write)")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Cache Read")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Cache Read
                    {getSortIcon("Cache Read")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Output Tokens")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Output Tokens
                    {getSortIcon("Output Tokens")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Total Tokens")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Total Tokens
                    {getSortIcon("Total Tokens")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort("Cost")}
                >
                  <div className="flex items-center justify-end gap-2">
                    Cost
                    {getSortIcon("Cost")}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {formatDate(row.Date)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        row.Kind === "Included" ? "default" : "destructive"
                      }
                    >
                      {row.Kind}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.Model}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{row["Max Mode"]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row["Input (w/ Cache Write)"])}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row["Input (w/o Cache Write)"])}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row["Cache Read"])}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatNumber(row["Output Tokens"])}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(row["Total Tokens"])}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(row.Cost)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
