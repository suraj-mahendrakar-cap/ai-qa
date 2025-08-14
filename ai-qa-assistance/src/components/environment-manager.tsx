"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
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
import { UploadEnvironment } from "./upload-environment";
import { getApiUrl } from "@/lib/config";
import {
  Upload,
  Trash2,
  Settings,
  FileText,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface EnvironmentFile {
  id: string;
  name: string;
  filename: string;
  filepath: string;
  uploadedAt: string;
  size: number;
  variables: Record<string, string>;
}

interface EnvironmentManagerProps {
  selectedEnvironmentId: string | null;
  onEnvironmentSelect: (environmentId: string | null) => void;
  onEnvironmentVariablesChange: (variables: Record<string, string>) => void;
  collectionId?: string; // Optional collection ID for collection-specific environments
}

export function EnvironmentManager({
  selectedEnvironmentId,
  onEnvironmentSelect,
  onEnvironmentVariablesChange,
  collectionId,
}: EnvironmentManagerProps) {
  const [environments, setEnvironments] = useState<EnvironmentFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Fetch environments from API
  const fetchEnvironments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const url = collectionId
        ? getApiUrl(`/environment?collectionId=${collectionId}`)
        : getApiUrl("/environment");

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch environments");
      }

      const data = await response.json();
      setEnvironments(data.environments || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load environments"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvironments();
  }, []);

  // Handle environment selection
  const handleEnvironmentSelect = (environmentId: string) => {
    const environment = environments.find((env) => env.id === environmentId);
    if (environment) {
      onEnvironmentSelect(environmentId);
      onEnvironmentVariablesChange(environment.variables);
    }
  };

  // Handle environment deletion
  const handleDeleteEnvironment = async (environmentId: string) => {
    if (!confirm("Are you sure you want to delete this environment file?"))
      return;

    try {
      const url = collectionId
        ? getApiUrl(
            `/environment/${environmentId}?collectionId=${collectionId}`
          )
        : getApiUrl(`/environment/${environmentId}`);

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (response.ok) {
        setEnvironments((prev) =>
          prev.filter((env) => env.id !== environmentId)
        );

        // If the deleted environment was selected, clear the selection
        if (selectedEnvironmentId === environmentId) {
          onEnvironmentSelect(null);
          onEnvironmentVariablesChange({});
        }
      } else {
        throw new Error("Failed to delete environment");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete environment"
      );
    }
  };

  // Handle successful upload
  const handleUploadSuccess = (newEnvironment: EnvironmentFile) => {
    setEnvironments((prev) => [newEnvironment, ...prev]);
    setShowUploadModal(false);

    // Auto-select the newly uploaded environment
    onEnvironmentSelect(newEnvironment.id);
    onEnvironmentVariablesChange(newEnvironment.variables);
  };

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

  return (
    <div className="space-y-4">
      {/* Environment Selection */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium mb-2 block">
            Environment File
          </label>
          <Select
            value={selectedEnvironmentId || ""}
            onValueChange={handleEnvironmentSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an environment file" />
            </SelectTrigger>
            <SelectContent>
              {environments.map((environment) => (
                <SelectItem key={environment.id} value={environment.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{environment.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEnvironment(environment.id);
                      }}
                      className="ml-2 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchEnvironments}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploadModal(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Selected Environment Details */}
      {selectedEnvironmentId && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selected Environment</CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const environment = environments.find(
                (env) => env.id === selectedEnvironmentId
              );
              if (!environment) return null;

              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{environment.name}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Variables</p>
                      <p className="font-medium">
                        {Object.keys(environment.variables).length}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Uploaded</p>
                      <p className="font-medium">
                        {formatDate(environment.uploadedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Environment Variables Preview */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Variables:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-3 max-h-32 overflow-y-auto">
                      <div className="space-y-1">
                        {Object.entries(environment.variables).map(
                          ([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium">{key}:</span>{" "}
                              <span className="text-muted-foreground">
                                {value.length > 50
                                  ? `${value.substring(0, 50)}...`
                                  : value}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadEnvironment
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
          collectionId={collectionId}
        />
      )}
    </div>
  );
}
