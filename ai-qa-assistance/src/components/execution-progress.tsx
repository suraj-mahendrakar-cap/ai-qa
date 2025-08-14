import React from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

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

interface ExecutionProgressProps {
  isExecuting: boolean;
  totalRequests: number;
  completedRequests: number;
  results: ExecutionResult[];
  onClose: () => void;
}

export function ExecutionProgress({
  isExecuting,
  totalRequests,
  completedRequests,
  results,
  onClose,
}: ExecutionProgressProps) {
  const progress =
    totalRequests > 0 ? (completedRequests / totalRequests) * 100 : 0;

  // Add null checks to prevent undefined errors
  const safeResults = results || [];
  const successfulRequests = safeResults.filter((r) => r.success).length;
  const failedRequests = safeResults.filter((r) => !r.success).length;

  // Debug logging
  console.log("ExecutionProgress props:", {
    isExecuting,
    totalRequests,
    completedRequests,
    resultsCount: safeResults.length,
    progress,
    successfulRequests,
    failedRequests,
  });

  const getStatusIcon = (result: ExecutionResult) => {
    if (result.success) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (result: ExecutionResult) => {
    if (result.success) {
      return "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
    } else {
      return "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            {isExecuting ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-500" />
            )}
            <div>
              <h2 className="text-xl font-semibold">
                {isExecuting ? "Executing Collection" : "Execution Complete"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isExecuting
                  ? `${completedRequests} of ${totalRequests} requests completed`
                  : `${successfulRequests} successful, ${failedRequests} failed`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedRequests} / {totalRequests}
            </span>
          </div>
          <Progress value={progress} className="h-2" />

          {/* Status Summary */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Successful: {successfulRequests}</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>Failed: {failedRequests}</span>
            </div>
            {isExecuting && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>Pending: {totalRequests - completedRequests}</span>
              </div>
            )}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-3">
            {safeResults.map((result, index) => (
              <Card key={index} className={`border ${getStatusColor(result)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result)}
                      <div>
                        <CardTitle className="text-base">
                          {result.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {result.method} {result.url}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {result.status} {result.statusText}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {result.responseTime}ms
                      </div>
                    </div>
                  </div>
                </CardHeader>
                {result.error && (
                  <CardContent className="pt-0">
                    <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950 p-3 rounded">
                      <strong>Error:</strong> {result.error}
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}

            {/* Placeholder for pending requests */}
            {isExecuting &&
              Array.from(
                { length: totalRequests - completedRequests },
                (_, index) => (
                  <Card
                    key={`pending-${index}`}
                    className="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <div>
                          <CardTitle className="text-base text-muted-foreground">
                            Pending Request {completedRequests + index + 1}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Waiting to execute...
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                )
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
