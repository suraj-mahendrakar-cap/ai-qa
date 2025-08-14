"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Play,
  RefreshCw,
  ExternalLink,
  Copy,
  FileText,
  Code,
  List,
  MessageSquare,
} from "lucide-react";

interface ExecutionResult {
  name: string;
  method: string;
  url: string;
  status: number;
  statusText: string;
  responseTime: number;
  success: boolean;
  error?: string;
  responseSize?: number;
  responseData?: string;
  responseHeaders?: Record<string, string>;
  originalRequest?: {
    headers: Array<{ key: string; value: string }>;
    body?: {
      mode: string;
      raw?: string;
      formdata?: Array<{ key: string; value: string }>;
    };
  };
}

interface CollectionSummary {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

interface ExecutionResultsProps {
  isOpen: boolean;
  onClose: () => void;
  collection: CollectionSummary | null;
  results: ExecutionResult[];
  isLoading: boolean;
}

export function ExecutionResults({
  isOpen,
  onClose,
  collection,
  results,
  isLoading,
}: ExecutionResultsProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (value: string) => {
    console.log("toggleItem", value);
    setOpenItems((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      } else {
        return [...prev, value];
      }
    });
  };

  if (!isOpen) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "text-green-600";
    if (status >= 400 && status < 500) return "text-yellow-600";
    if (status >= 500) return "text-red-600";
    return "text-gray-600";
  };

  const getStatusIcon = (result: ExecutionResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  const formatResponseTime = (time: number) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatResponseSize = (size?: number) => {
    if (!size) return "N/A";
    if (size < 1024) return `${size}B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}KB`;
    return `${(size / (1024 * 1024)).toFixed(1)}MB`;
  };

  const generateCurlCommand = (result: ExecutionResult): string => {
    let curl = `curl -X ${result.method.toUpperCase()}`;

    // Add headers
    if (result.originalRequest?.headers) {
      result.originalRequest.headers.forEach((header) => {
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
          .map((field) => `${field.key}=${field.value}`)
          .join("&");
        curl += ` -d '${formData}'`;
      }
    }

    // Add URL
    curl += ` "${result.url}"`;

    return curl;
  };

  const formatResponseData = (data: string): string => {
    try {
      // Try to parse as JSON and format it
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      // If not JSON, return as is
      return data;
    }
  };

  const isJsonResponse = (data: string): boolean => {
    try {
      JSON.parse(data);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold">Execution Results</h2>
            {collection && (
              <p className="text-sm text-muted-foreground">
                {collection.name} • {collection.totalRequests} requests
              </p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center p-12">
            <div className="flex items-center gap-2">
              <RefreshCw className="h-6 w-6 animate-spin" />
              <span>Executing collection...</span>
            </div>
          </div>
        )}

        {/* Results Content */}
        {!isLoading && collection && (
          <div className="flex h-[calc(90vh-120px)]">
            {/* Summary Panel */}
            <div className="w-80 border-r dark:border-gray-700 p-6 overflow-y-auto">
              <div className="space-y-4">
                {/* Summary Stats */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Requests
                      </span>
                      <span className="font-medium">
                        {collection.totalRequests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Successful
                      </span>
                      <span className="font-medium text-green-600">
                        {collection.successfulRequests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Failed
                      </span>
                      <span className="font-medium text-red-600">
                        {collection.failedRequests}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Avg Response Time
                      </span>
                      <span className="font-medium">
                        {formatResponseTime(collection.averageResponseTime)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Success Rate */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Success Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (collection.successfulRequests /
                                collection.totalRequests) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (collection.successfulRequests /
                            collection.totalRequests) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Export Options */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Export</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => {
                        const data = JSON.stringify(
                          { collection, results },
                          null,
                          2
                        );
                        const blob = new Blob([data], {
                          type: "application/json",
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `${collection.name}_results.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="space-y-3 w-full">
                  {results.map((result, index) => (
                    <AccordionItem
                      key={index}
                      value={`item-${index}`}
                      className="w-full"
                    >
                      <div className="flex items-center justify-between px-4 py-4 w-full">
                        <AccordionTrigger
                          className="flex-1"
                          isOpen={openItems.includes(`item-${index}`)}
                          onClick={() => toggleItem(`item-${index}`)}
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {getStatusIcon(result)}
                            <div className="flex-1 min-w-0 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {result.name}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                    result.status
                                  )} bg-gray-100 dark:bg-gray-800`}
                                >
                                  {result.method}
                                </span>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${getStatusColor(
                                    result.status
                                  )} bg-gray-100 dark:bg-gray-800`}
                                >
                                  {result.status} {result.statusText}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatResponseTime(result.responseTime)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {formatResponseSize(result.responseSize)}
                                </div>
                              </div>
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground break-all">
                                  {result.url}
                                </p>
                              </div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const curlCommand = generateCurlCommand(result);
                            copyToClipboard(curlCommand);
                          }}
                          className={
                            copiedText === generateCurlCommand(result)
                              ? "text-green-600"
                              : ""
                          }
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy cURL
                        </Button>
                      </div>
                      <AccordionContent
                        className="px-4"
                        isOpen={openItems.includes(`item-${index}`)}
                      >
                        <div className="space-y-4">
                          {/* Action Buttons */}

                          {/* Error Display */}
                          {result.error && (
                            <div className="p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
                              <p className="text-sm text-red-700 dark:text-red-300">
                                <strong>Error:</strong> {result.error}
                              </p>
                            </div>
                          )}

                          {/* Response Details */}
                          <div className="space-y-2">
                            {/* Response Headers */}
                            {result.responseHeaders &&
                              Object.keys(result.responseHeaders).length >
                                0 && (
                                <AccordionItem value={`headers-${index}`}>
                                  <AccordionTrigger
                                    className="text-sm"
                                    isOpen={openItems.includes(
                                      `headers-${index}`
                                    )}
                                    onClick={() =>
                                      toggleItem(`headers-${index}`)
                                    }
                                  >
                                    <List className="h-4 w-4 mr-2" />
                                    Response Headers
                                  </AccordionTrigger>
                                  <AccordionContent
                                    isOpen={openItems.includes(
                                      `headers-${index}`
                                    )}
                                  >
                                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                                      <pre className="text-xs overflow-x-auto">
                                        {Object.entries(result.responseHeaders)
                                          .map(
                                            ([key, value]) => `${key}: ${value}`
                                          )
                                          .join("\n")}
                                      </pre>
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              )}

                            {/* Response Body */}
                            {result.responseData && (
                              <AccordionItem value={`body-${index}`}>
                                <AccordionTrigger
                                  className="text-sm"
                                  isOpen={openItems.includes(`body-${index}`)}
                                  onClick={() => toggleItem(`body-${index}`)}
                                >
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Response Body
                                  {isJsonResponse(result.responseData) && (
                                    <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                                      JSON
                                    </span>
                                  )}
                                </AccordionTrigger>
                                <AccordionContent
                                  isOpen={openItems.includes(`body-${index}`)}
                                >
                                  <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                                      {formatResponseData(result.responseData)}
                                    </pre>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            )}

                            {/* Request Details */}
                            <AccordionItem value={`request-${index}`}>
                              <AccordionTrigger
                                className="text-sm"
                                isOpen={openItems.includes(`request-${index}`)}
                                onClick={() => toggleItem(`request-${index}`)}
                              >
                                <Code className="h-4 w-4 mr-2" />
                                Request Details
                              </AccordionTrigger>
                              <AccordionContent
                                isOpen={openItems.includes(`request-${index}`)}
                              >
                                <div className="space-y-3">
                                  {/* Request Headers */}
                                  {result.originalRequest?.headers &&
                                    result.originalRequest.headers.length >
                                      0 && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">
                                          Request Headers:
                                        </h4>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                                          <pre className="text-xs overflow-x-auto">
                                            {result.originalRequest.headers
                                              .map(
                                                (header) =>
                                                  `${header.key}: ${header.value}`
                                              )
                                              .join("\n")}
                                          </pre>
                                        </div>
                                      </div>
                                    )}

                                  {/* Request Body */}
                                  {result.originalRequest?.body && (
                                    <div>
                                      <h4 className="text-sm font-medium mb-2">
                                        Request Body:
                                      </h4>
                                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3">
                                        <pre className="text-xs overflow-x-auto">
                                          {result.originalRequest.body.raw ||
                                            "No body data"}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </AccordionContent>
                            </AccordionItem>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t dark:border-gray-700">
          <div className="text-sm text-muted-foreground">
            {results && results.length > 0 && (
              <>
                {collection?.successfulRequests} of {collection?.totalRequests}{" "}
                requests successful
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button
              onClick={() => {
                // Re-run the collection
                window.location.reload();
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Run Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
