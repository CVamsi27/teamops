"use client";
import { useTasks } from "@/hooks/tasks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Plus, Edit, Trash2, CheckCircle, Circle, Clock, AlertTriangle, Eye } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";

export default function TasksPage() {
  const tasksList = useTasks();
  const { list: projectsList } = useProjects();
  const [deletingTask, setDeletingTask] = useState<string | null>(null);

  const handleDelete = (taskId: string) => {
    setDeletingTask(taskId);
    // tasksList.remove.mutate({ id: taskId }, {
    //   onSuccess: () => {
    //     setDeletingTask(null);
    //   },
    //   onError: () => {
    //     setDeletingTask(null);
    //   }
    // });
  };

  const getProjectName = (projectId: string) => {
    const project = projectsList.data?.find(p => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'TODO': return <Circle className="h-4 w-4" />;
      case 'IN_PROGRESS': return <Clock className="h-4 w-4" />;
      case 'DONE': return <CheckCircle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'TODO': return 'secondary';
      case 'IN_PROGRESS': return 'default';
      case 'DONE': return 'default';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'MEDIUM': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'LOW': return <Circle className="h-4 w-4 text-yellow-500" />;
      default: return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const isOverdue = date < now;
    
    return {
      formatted: date.toLocaleDateString(),
      isOverdue,
    };
  };

  if (tasksList.list.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track your tasks across all projects
          </p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Tasks List */}
      <div className="grid gap-4">
        {tasksList.list.data?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No tasks yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first task to start tracking your work
              </p>
              <Button asChild>
                <Link href="/tasks/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          tasksList.list.data?.map((task) => {
            const dueDate = formatDueDate(task.dueDate || undefined);
            
            return (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Title and Status */}
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold truncate">
                            {task.title}
                          </h3>
                          {task.description && (
                            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={getStatusColor(task.status)} className="text-xs">
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        {task.priority && (
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs flex items-center gap-1">
                            {getPriorityIcon(task.priority)}
                            {task.priority}
                          </Badge>
                        )}
                        
                        <Badge variant="outline" className="text-xs">
                          {getProjectName(task.projectId || '')}
                        </Badge>
                        
                        {dueDate && (
                          <Badge 
                            variant={dueDate.isOverdue ? "destructive" : "secondary"} 
                            className="text-xs"
                          >
                            Due: {dueDate.formatted}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${task.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline ml-2">View</span>
                        </Link>
                      </Button>
                      
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/tasks/${task.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline ml-2">Edit</span>
                        </Link>
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            disabled={deletingTask === task.id}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Delete</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Task</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{task.title}&quot;? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(task.id)}
                              className="bg-destructive hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
