import React, { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface TaskTemplate {
  id: string;
  name: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  projectId: string;
  assignees: Array<{
    id: string;
    name: string | null;
    email: string;
  }>;
  createdBy: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface TaskTemplateListProps {
  templates: TaskTemplate[];
  onCreateFromTemplate?: (template: TaskTemplate) => void;
  onEditTemplate?: (template: TaskTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
  isLoading?: boolean;
}

/**
 * TaskTemplateList component - displays available task templates
 * Allows users to create tasks from templates with pre-assigned members
 */
export function TaskTemplateList({
  templates,
  onCreateFromTemplate,
  onEditTemplate,
  onDeleteTemplate,
  isLoading = false,
}: TaskTemplateListProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate || !taskTitle.trim()) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    setIsCreating(true);
    try {
      // Call the callback if provided
      if (onCreateFromTemplate) {
        await onCreateFromTemplate(template);
      }

      // Reset form
      setTaskTitle('');
      setSelectedTemplate(null);
    } finally {
      setIsCreating(false);
    }
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No task templates yet</p>
      </div>
    );
  }

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-4">
      {/* Template List */}
      <div className="grid gap-3">
        {templates.map(template => (
          <div
            key={template.id}
            className={`p-4 border rounded-lg cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{template.name}</h3>
                {template.description && (
                  <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      template.priority === 'HIGH'
                        ? 'bg-red-100 text-red-700'
                        : template.priority === 'MEDIUM'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {template.priority}
                  </span>

                  {template.assignees.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-600">Assigns to:</span>
                      <div className="flex gap-1">
                        {template.assignees.slice(0, 3).map(assignee => (
                          <span
                            key={assignee.id}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {assignee.name || assignee.email}
                          </span>
                        ))}
                        {template.assignees.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{template.assignees.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1 ml-2">
                {onEditTemplate && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onEditTemplate(template);
                    }}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Edit template"
                  >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                  </button>
                )}
                {onDeleteTemplate && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm('Delete this template?')) {
                        onDeleteTemplate(template.id);
                      }
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Create From Template */}
      {selectedTemplateData && (
        <div className="border-t pt-4 mt-4">
          <h4 className="font-semibold text-sm mb-3">
            Create task from &quot;{selectedTemplateData.name}&quot;
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-600">Task Title</label>
              <input
                type="text"
                value={taskTitle}
                onChange={e => setTaskTitle(e.target.value)}
                placeholder="Enter task title..."
                className="w-full mt-1 px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedTemplateData.assignees.length > 0 && (
              <div className="bg-blue-50 p-3 rounded text-sm">
                <p className="font-medium text-blue-900 mb-2">Will be assigned to&colon;</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplateData.assignees.map(assignee => (
                    <span
                      key={assignee.id}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-xs"
                    >
                      {assignee.name || assignee.email}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleCreateFromTemplate}
                disabled={!taskTitle.trim() || isCreating || isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                Create Task
              </button>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-3 py-2 border border-gray-300 text-sm font-medium rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
