"use client";

import { InfoButton } from "@/components/ui/info-button";

export function TeamsInfoDialog() {
  return (
    <InfoButton
      title="Teams Information"
      description="Learn about team management and roles"
      triggerClassName="ml-2"
    >
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Team Creation</h3>
          <p className="text-sm text-gray-600">
            Only users with ADMIN or MEMBER roles can create teams. Teams allow you to organize projects and collaborate with team members.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Team Roles</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              <strong>Team Lead:</strong> Full control over team, members, and projects
            </li>
            <li>
              <strong>Member:</strong> Can create and manage projects, invite members
            </li>
            <li>
              <strong>Reviewer:</strong> Can view and comment on projects and tasks
            </li>
            <li>
              <strong>Viewer:</strong> Read-only access to team content
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Team Editing</h3>
          <p className="text-sm text-gray-600">
            Team leads can edit team details including name, description, and settings.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Member Management</h3>
          <p className="text-sm text-gray-600">
            Invite team members via email and assign roles. Members can be promoted, demoted, or removed.
          </p>
        </div>

        <div>
          <h3 className="font-semibold mb-2">Team Deletion</h3>
          <p className="text-sm text-gray-600">
            Only team leads can delete teams. Deletion is permanent and removes all associated projects and data.
          </p>
        </div>
      </div>
    </InfoButton>
  );
}
