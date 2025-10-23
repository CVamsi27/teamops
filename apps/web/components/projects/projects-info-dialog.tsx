"use client";

import { InfoButton } from "@/components/ui/info-button";

export function ProjectsInfoDialog() {
  return (
    <InfoButton
      title="Projects Information"
      description="Learn about project management and roles"
      triggerClassName="ml-2"
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Project Creation</h3>
          <p className="text-sm text-gray-600">
            Team members and leads can create projects within a team. Projects are used to organize and track tasks.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Project Roles</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Lead:</strong> Full control over project, members, and tasks
            </li>
            <li>
              <strong>Contributor:</strong> Can create, edit, and manage tasks
            </li>
            <li>
              <strong>Reviewer:</strong> Can view and comment on tasks and discussions
            </li>
            <li>
              <strong>Viewer:</strong> Read-only access to project content
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Managing Members</h3>
          <p className="text-sm text-gray-600">
            Project leads can add members, assign roles, and manage permissions. Members can be added from the team or invited via email.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Project Editing</h3>
          <p className="text-sm text-gray-600">
            Project leads can edit project details including name, description, status, and settings.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Viewing Details</h3>
          <p className="text-sm text-gray-600">
            Click on a project to view all tasks, members, and project details. You can filter tasks by status and assignee.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Project Deletion</h3>
          <p className="text-sm text-gray-600">
            Only project leads can delete projects. Deletion is permanent and removes all associated tasks and data.
          </p>
        </div>
      </div>
    </InfoButton>
  );
}
