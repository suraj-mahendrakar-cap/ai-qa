"use client";

import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCollection } from "@/components/upload-collection";
import { ExecutionResults } from "@/components/execution-results";
import { ExecutionProgress } from "@/components/execution-progress";
import { EnvironmentManager } from "@/components/environment-manager";
import { getApiUrl } from "@/lib/config";
import {
  Plus,
  Search,
  Filter,
  Play,
  Edit,
  Trash2,
  Download,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  FileText,
  Upload,
  RefreshCw,
  X,
} from "lucide-react";

interface Collection {
  id: number;
  name: string;
  description: string;
  schema: string;
  totalRequests: number;
  uploadedAt: string;
  filename: string;
  filepath: string;
  size?: number;
}

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
}

interface CollectionSummary {
  name: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
}

export default function PostmanCollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Execution results state
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [executionResults, setExecutionResults] = useState<ExecutionResult[]>(
    []
  );
  const [collectionSummary, setCollectionSummary] =
    useState<CollectionSummary | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRequests, setCompletedRequests] = useState(0);

  // Environment variables state - will be collection-specific
  const [environmentVariables, setEnvironmentVariables] = useState<
    Record<string, Record<string, string>>
  >({});
  const [selectedEnvironmentIds, setSelectedEnvironmentIds] = useState<
    Record<string, string | null>
  >({});
  const [showEnvironmentModal, setShowEnvironmentModal] = useState(false);
  const [selectedCollectionForEnv, setSelectedCollectionForEnv] =
    useState<Collection | null>(null);

  // Fetch collections from API
  const fetchCollections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(getApiUrl("/upload-collection"));
      if (!response.ok) {
        throw new Error("Failed to fetch collections");
      }

      const data = await response.json();
      setCollections(data.collections || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load collections"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, []);

  // Handle successful upload
  const handleUploadSuccess = (newCollection: Collection) => {
    setCollections((prev) => [newCollection, ...prev]);
    setShowUploadModal(false);
  };

  // Filter collections based on search term
  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  // Handle collection deletion
  const handleDeleteCollection = async (id: number) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const response = await fetch(getApiUrl(`/upload-collection/${id}`), {
        method: "DELETE",
      });

      if (response.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
      } else {
        throw new Error("Failed to delete collection");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete collection"
      );
    }
  };

  // Handle collection download
  const handleDownloadCollection = async (collection: Collection) => {
    try {
      const response = await fetch(
        getApiUrl(`/upload-collection/${collection.id}/download`)
      );
      if (!response.ok) throw new Error("Failed to download collection");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = collection.name.replace(/[^a-zA-Z0-9]/g, "_") + ".json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to download collection"
      );
    }
  };

  // Handle collection execution
  const handleRunCollection = async (collection: Collection) => {
    try {
      setIsExecuting(true);
      setError(null);
      setExecutionResults([]);
      setCompletedRequests(0);

      const collectionId = collection.id.toString();
      const collectionEnvVars = environmentVariables[collectionId] || {};
      const collectionEnvId = selectedEnvironmentIds[collectionId] || null;

      console.log("Running collection:", collection.name);
      console.log("Collection ID:", collectionId);
      console.log("Selected environment ID:", collectionEnvId);
      console.log("Environment variables:", collectionEnvVars);

      // First, get the collection info to know total requests
      const infoResponse = await fetch(
        getApiUrl(`/upload-collection/${collection.id}/info`)
      );
      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        const totalReq = infoData.collection?.totalRequests || 0;
        setTotalRequests(totalReq);
        console.log("Total requests:", totalReq);
      }

      // Show progress modal after getting total requests
      setShowProgressModal(true);

      // Execute requests with simulated real-time progress
      const response = await fetch(
        getApiUrl(`/upload-collection/${collection.id}/run`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            variables: collectionEnvVars,
            environmentId: collectionEnvId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to run collection");
      }

      const data = await response.json();

      // Simulate real-time progress updates
      const results = data.results || [];

      if (results.length === 0) {
        throw new Error("No results returned from collection execution");
      }

      for (let i = 0; i < results.length; i++) {
        // Update progress every 100ms to simulate real-time
        setTimeout(() => {
          setExecutionResults(results.slice(0, i + 1));
          setCompletedRequests(i + 1);
        }, i * 100);
      }

      // Wait for all simulated updates to complete
      setTimeout(() => {
        setCollectionSummary(data.collection);
        setShowProgressModal(false);
        setShowResultsModal(true);
      }, results.length * 100 + 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to run collection");
      setShowProgressModal(false);
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading collections...</span>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Postman Collections
            </h1>
            <p className="text-muted-foreground">
              Manage and monitor your API test collections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchCollections}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Collection
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md bg-background"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Collections Grid */}
        {filteredCollections.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCollections.map((collection) => (
              <Card
                key={collection.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {collection.name}
                      </CardTitle>
                      <CardDescription className="mt-1 text-xs">
                        {collection.description || "No description available"}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Requests</p>
                      <p className="font-medium">{collection.totalRequests}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Schema</p>
                      <p className="font-medium text-xs truncate">
                        {collection.schema || "v2.1.0"}
                      </p>
                    </div>
                  </div>

                  {/* Upload Info & Size */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(collection.uploadedAt)}</span>
                    </div>
                    {collection.size && (
                      <span>
                        {(collection.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>

                  {/* Environment Summary */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Environment:
                        </span>
                        <span className="text-xs font-medium">
                          {selectedEnvironmentIds[collection.id.toString()]
                            ? "QA/UAT"
                            : "None selected"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            const collectionId = collection.id.toString();
                            const currentEnvId =
                              selectedEnvironmentIds[collectionId];
                            setSelectedEnvironmentIds((prev) => ({
                              ...prev,
                              [collectionId]: currentEnvId,
                            }));
                          }}
                        >
                          <RefreshCw className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs"
                          onClick={() => {
                            setSelectedCollectionForEnv(collection);
                            setShowEnvironmentModal(true);
                          }}
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 pt-2">
                    <Button
                      size="sm"
                      className="flex-1 h-8 text-xs"
                      onClick={() => handleRunCollection(collection)}
                      disabled={isExecuting}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {isExecuting ? "Running..." : "Run"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDownloadCollection(collection)}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => handleDeleteCollection(collection.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Empty State */
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? "No collections found" : "No collections yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Upload your first Postman collection to get started with API testing"}
              </p>
              {!searchTerm && (
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Collection
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadCollection
            onUploadSuccess={handleUploadSuccess}
            onClose={() => setShowUploadModal(false)}
          />
        )}

        {/* Execution Progress Modal */}
        {showProgressModal && (
          <ExecutionProgress
            isExecuting={isExecuting}
            totalRequests={totalRequests}
            completedRequests={completedRequests}
            results={executionResults}
            onClose={() => {
              setShowProgressModal(false);
              setIsExecuting(false);
            }}
          />
        )}

        {/* Execution Results Modal */}
        <ExecutionResults
          isOpen={showResultsModal}
          onClose={() => setShowResultsModal(false)}
          collection={collectionSummary}
          results={executionResults}
          isLoading={isExecuting}
        />

        {/* Environment Management Modal */}
        {showEnvironmentModal && selectedCollectionForEnv && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-gray-200 dark:border-gray-700">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold">
                    Environment Management
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedCollectionForEnv.name}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEnvironmentModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <EnvironmentManager
                  selectedEnvironmentId={
                    selectedEnvironmentIds[
                      selectedCollectionForEnv.id.toString()
                    ] || null
                  }
                  onEnvironmentSelect={(envId) => {
                    setSelectedEnvironmentIds((prev) => ({
                      ...prev,
                      [selectedCollectionForEnv.id.toString()]: envId,
                    }));
                  }}
                  onEnvironmentVariablesChange={(variables) => {
                    setEnvironmentVariables((prev) => ({
                      ...prev,
                      [selectedCollectionForEnv.id.toString()]: variables,
                    }));
                  }}
                  collectionId={selectedCollectionForEnv.id.toString()}
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 p-6 border-t dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setShowEnvironmentModal(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
