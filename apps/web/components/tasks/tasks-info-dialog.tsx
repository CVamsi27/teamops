"use client";

import { InfoButton } from "@/components/ui/info-button";

export function TasksInfoDialog() {
  return (
    <InfoButton
      title="Tasks Information"
      description="Learn about task management and workflow"
      triggerClassName="ml-2"
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Task Creation</h3>
          <p className="text-sm text-gray-600">
            Project contributors and leads can create tasks within a project. Tasks help break down work into manageable units.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Task Status</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>TODO:</strong> Task has not been started
            </li>
            <li>
              <strong>IN_PROGRESS:</strong> Task is currently being worked on
            </li>
            <li>
              <strong>DONE:</strong> Task has been completed
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Task Priority</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>HIGH:</strong> Urgent or blocking other tasks
            </li>
            <li>
              <strong>MEDIUM:</strong> Standard priority
            </li>
            <li>
              <strong>LOW:</strong> Can be done when time permits
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Assigning Tasks</h3>
          <p className="text-sm text-gray-600">
            You can assign tasks to project members. Assigned members will receive notifications about task updates.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Task Editing</h3>
          <p className="text-sm text-gray-600">
            You can update task details including title, description, status, priority, due date, and assignee.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Viewing Tasks</h3>
          <p className="text-sm text-gray-600">
            View all tasks across projects or filter by project, assignee, status, and priority. The dashboard shows upcoming tasks due within 7 days.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Task Deletion</h3>
          <p className="text-sm text-gray-600">
            Task creators and project leads can delete tasks. This action is permanent.
          </p>
        </div>
      </div>
    </InfoButton>
  );
}
