import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { Dashboard } from "./components/Dashboard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { ThemeProvider } from "./components/theme-provider";
import { ThemeSwitcher } from "./components/theme-switcher";
import { Brain } from "lucide-react";

function App() {
  const [data, setData] = useState<Record<string, string>[]>([]);

  const handleDataParsed = (parsedData: Record<string, string>[]) => {
    setData(parsedData);
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="cursor-insights-theme">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <div className="flex justify-between items-start mb-8">
            <div className="text-center flex-1">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Brain className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold">Cursor Insights</h1>
              </div>
              <p className="text-muted-foreground text-lg">
                Analyze your Cursor usage patterns and optimize your AI
                development workflow
              </p>
            </div>
            <div className="ml-4">
              <ThemeSwitcher />
            </div>
          </div>

          {data.length === 0 ? (
            <FileUpload onDataParsed={handleDataParsed} />
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Loaded Successfully</CardTitle>
                  <CardDescription>
                    {data.length} usage events loaded. Here are your insights:
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => setData([])}
                    className="text-sm text-muted-foreground hover:text-foreground underline"
                  >
                    Upload different data
                  </button>
                </CardContent>
              </Card>
              <Dashboard data={data} />
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
