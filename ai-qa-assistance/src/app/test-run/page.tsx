"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, RefreshCw, CheckCircle, AlertCircle, Copy } from "lucide-react";
import { getApiUrl } from "@/lib/config";
import { EnvironmentManager } from "@/components/environment-manager";

export default function TestRunPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<string | null>(null);
  const [environmentVariables, setEnvironmentVariables] = useState<Record<string, string>>({});

  const testCollectionId = "1754990567114"; // The Pidilite collection ID

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const generateCurlCommand = (result: any): string => {
    let curl = `curl -X ${result.method.toUpperCase()}`;

    // Add headers
    if (result.originalRequest?.headers) {
      result.originalRequest.headers.forEach((header: any) => {
        if (header.key && header.value) {
          curl += ` -H "${header.key}: ${header.value}"`;
        }
      });
    }

    // Add body
    if (result.originalRequest?.body) {
      if (
        result.originalRequest.body.mode === "raw" &&
        result.originalRequest.body.raw
      ) {
        curl += ` -d '${result.originalRequest.body.raw}'`;
      } else if (
        result.originalRequest.body.mode === "formdata" &&
        result.originalRequest.body.formdata
      ) {
        const formData = result.originalRequest.body.formdata
          .map((field: any) => `${field.key}=${field.value}`)
          .join("&");
        curl += ` -d '${formData}'`;
      }
    }

    // Add URL
    curl += ` "${result.url}"`;

    return curl;
  };

  const handleTestRun = async () => {
    try {
      setIsRunning(true);
      setError(null);
      setResults(null);

      const response = await fetch(
        getApiUrl(`/upload-collection/${testCollectionId}/run`),
        {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            environmentId: selectedEnvironmentId
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to run collection");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run collection");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Test Run Functionality</h1>
          <p className="text-muted-foreground">
            Test the Postman collection run functionality with environment variables
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test Collection: Sea Pidilite v2.0</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Environment Selection */}
            <div className="space-y-4">
              <h3 className="font-medium">Environment Configuration</h3>
              <EnvironmentManager
                selectedEnvironmentId={selectedEnvironmentId}
                onEnvironmentSelect={setSelectedEnvironmentId}
                onEnvironmentVariablesChange={setEnvironmentVariables}
                collectionId={testCollectionId}
              />
              
              {selectedEnvironmentId && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Environment Selected:</strong> Using environment variables for request execution
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={handleTestRun}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run Collection
                  </>
                )}
              </Button>

              {results && (
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Collection executed successfully!</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-red-600">{error}</span>
                </div>
              )}
            </div>

            {results && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold">
                      {results.collection.totalRequests}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Requests
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {results.collection.successfulRequests}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Successful
                    </div>
                  </div>
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {results.collection.failedRequests}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {results.collection.averageResponseTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Avg Response Time
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Request Results:</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {results.results.map((result: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          result.success
                            ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                            : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{result.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.method} {result.url}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const curlCommand = generateCurlCommand(result);
                                copyToClipboard(curlCommand);
                              }}
                              title="Copy cURL command"
                              className={
                                copiedText === generateCurlCommand(result)
                                  ? "text-green-600"
                                  : ""
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <div className="text-right">
                              <div
                                className={`font-medium ${
                                  result.success
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {result.status} {result.statusText}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.responseTime}ms
                              </div>
                            </div>
                          </div>
                        </div>
                        {result.error && (
                          <div className="mt-2 text-sm text-red-600">
                            Error: {result.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
