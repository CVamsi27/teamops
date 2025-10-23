"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { X } from "lucide-react";

export type TaskFilterOptions = {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
};

interface TaskFiltersProps {
  tasks: any[];
  onFiltersChange: (filters: TaskFilterOptions) => void;
  currentFilters?: TaskFilterOptions;
}

export function TaskFilters({
  tasks,
  onFiltersChange,
  currentFilters = {},
}: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFilterOptions>(currentFilters);

  // Get unique assignees from tasks
  const uniqueAssignees = Array.from(
    new Map(
      tasks
        .filter((t) => t.assignee)
        .map((t) => [t.assignee.id, t.assignee])
    ).values()
  );

  // Get unique projects from tasks
  const uniqueProjects = Array.from(
    new Map(
      tasks
        .filter((t) => t.project)
        .map((t) => [t.project.id, t.project])
    ).values()
  );

  const statusOptions = ["TODO", "IN_PROGRESS", "DONE"];
  const priorityOptions = ["LOW", "MEDIUM", "HIGH"];

  const handleFilterChange = (key: string, value: string | undefined) => {
    const newFilters = { ...filters };
    if (value) {
      newFilters[key as keyof TaskFilterOptions] = value;
    } else {
      delete newFilters[key as keyof TaskFilterOptions];
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    setFilters({});
    onFiltersChange({});
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Filter Tasks</h3>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="h-6"
          >
            <X className="h-3 w-3 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Status
          </label>
          <Select
            value={filters.status || ""}
            onValueChange={(value) =>
              handleFilterChange("status", value || undefined)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Priority Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Priority
          </label>
          <Select
            value={filters.priority || ""}
            onValueChange={(value) =>
              handleFilterChange("priority", value || undefined)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All priorities" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Assignee Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Assignee
          </label>
          <Select
            value={filters.assigneeId || ""}
            onValueChange={(value) =>
              handleFilterChange("assigneeId", value || undefined)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              {uniqueAssignees.map((assignee) => (
                <SelectItem key={assignee.id} value={assignee.id}>
                  {assignee.name || assignee.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Project Filter */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
            Project
          </label>
          <Select
            value={filters.projectId || ""}
            onValueChange={(value) =>
              handleFilterChange("projectId", value || undefined)
            }
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="All projects" />
            </SelectTrigger>
            <SelectContent>
              {uniqueProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {filters.status && (
            <Badge variant="secondary" className="text-xs gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("status", undefined)}
              />
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="secondary" className="text-xs gap-1">
              Priority: {filters.priority}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("priority", undefined)}
              />
            </Badge>
          )}
          {filters.assigneeId && (
            <Badge variant="secondary" className="text-xs gap-1">
              Assignee:{" "}
              {
                uniqueAssignees.find((a) => a.id === filters.assigneeId)?.name ||
                  "Unknown"
              }
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("assigneeId", undefined)}
              />
            </Badge>
          )}
          {filters.projectId && (
            <Badge variant="secondary" className="text-xs gap-1">
              Project:{" "}
              {uniqueProjects.find((p) => p.id === filters.projectId)?.name ||
                "Unknown"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleFilterChange("projectId", undefined)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
