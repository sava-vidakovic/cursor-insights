import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, FileText } from "lucide-react";
import { parseCSV } from "@/lib/utils";

interface FileUploadProps {
  onDataParsed: (data: Record<string, string>[]) => void;
}

export const FileUpload = ({ onDataParsed }: FileUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.endsWith(".csv")) {
        alert("Please upload a CSV file");
        return;
      }

      setIsLoading(true);
      try {
        const text = await file.text();
        const data = parseCSV(text);
        onDataParsed(data);
      } catch (error) {
        console.error("Error parsing CSV:", error);
        alert("Error parsing CSV file");
      } finally {
        setIsLoading(false);
      }
    },
    [onDataParsed]
  );

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Cursor Usage Data
        </CardTitle>
        <CardDescription>
          Upload a CSV file containing your Cursor usage events to analyze
          insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-muted-foreground/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <FileText className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
          <div className="space-y-2">
            <p className="text-lg font-medium">
              {isDragOver
                ? "Drop your CSV file here"
                : "Drag and drop your CSV file here"}
            </p>
            <p className="text-sm text-muted-foreground">or</p>
            <div className="flex items-center justify-center">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <Button asChild disabled={isLoading}>
                  <span>{isLoading ? "Processing..." : "Choose File"}</span>
                </Button>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileInput}
                className="hidden"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
