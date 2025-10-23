# Global Role & Project Member Implementation Guide

## Overview

This document describes the implementation of a three-level permission system for the TeamOps application:
1. **Global Role** - User account-level permissions
2. **Team Role** - Team membership permissions  
3. **Project Role** - Project membership permissions

## Architecture

### Global Role (User Level)

The `User` model has a global `role` field with three possible values:

```typescript
enum Role {
  ADMIN       // Can create teams, manage platform
  MEMBER      // Can join teams, create projects
  VIEWER      // Read-only access
}
```

**Only ADMIN users can create teams** - enforced in `TeamController.create()`

### Team Role (Team Level)

The `Membership` model manages team-level roles:

```typescript
model Membership {
  id: String
  role: Role        // ADMIN, MEMBER, or VIEWER
  userId: String
  teamId: String
  // ... relationships
}
```

### Project Role (Project Level) - NEW

The new `ProjectMembership` model manages project-level permissions:

```typescript
model ProjectMembership {
  id: String
  role: ProjectRole  // LEAD, CONTRIBUTOR, REVIEWER, VIEWER
  userId: String
  projectId: String
  // ... relationships
}

enum ProjectRole {
  LEAD        // Full project management
  CONTRIBUTOR // Can create/edit tasks
  REVIEWER    // Can review/comment
  VIEWER      // Read-only access
}
```

## Database Changes

### New Migrations

Added `ProjectMembership` model to Prisma schema:

```prisma
model ProjectMembership {
  id        String    @id @default(uuid())
  role      ProjectRole @default(CONTRIBUTOR)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  userId    String
  projectId String
  project   Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, projectId])
  @@index([userId])
  @@index([projectId])
}
```

Updated models:
- `Project` - Now has `memberships: ProjectMembership[]`
- `User` - Now has `projectMemberships: ProjectMembership[]`

### To Apply Migration

```bash
cd apps/api
pnpm exec prisma generate
pnpm exec prisma migrate dev --name add-project-membership
```

## API Schemas

New schema file: `packages/api/src/schemas/project-membership.schema.ts`

```typescript
export const ProjectRoleEnum = z.enum(['LEAD', 'CONTRIBUTOR', 'REVIEWER', 'VIEWER']);

export const ProjectMembershipSchema = z.object({
  id: ID,
  role: ProjectRoleEnum,
  userId: ID,
  projectId: ID,
  createdAt: ISODateString.optional(),
  updatedAt: ISODateString.optional(),
});

export const CreateProjectMembershipSchema = z.object({
  userId: ID,
  projectId: ID,
  role: ProjectRoleEnum.default('CONTRIBUTOR'),
});

export const UpdateProjectMembershipSchema = z.object({
  role: ProjectRoleEnum,
});

export const AssignProjectRoleSchema = z.object({
  userId: ID,
  role: ProjectRoleEnum,
});
```

## Repository Layer

### ProjectMembershipRepository

Location: `apps/api/src/modules/project/project-membership.repository.ts`

Methods:
- `create()` - Add a user to a project
- `findByUserAndProject()` - Get membership for specific user-project
- `findAllByProjectId()` - List all members
- `findAllByProjectIdWithUser()` - List members with user details
- `updateRole()` - Change member role
- `delete()` - Remove member

## Service Layer

### ProjectService Updates

Location: `apps/api/src/modules/project/project.service.ts`

New methods:
- `getProjectMembers()` - List project members (access check: any member)
- `addProjectMember()` - Add member (access check: LEAD only)
- `updateProjectMemberRole()` - Update role (access check: LEAD only)
- `removeProjectMember()` - Remove member (access check: LEAD only)

**Key Features:**
- Access control enforced at every method
- Prevents removing last project LEAD
- Validates user membership before operations

## Controller Layer

### ProjectController Updates

Location: `apps/api/src/modules/project/project.controller.ts`

New endpoints:
```typescript
// Get all project members
GET /projects/:id/members

// Add member to project
POST /projects/:id/members/:userId
Body: { role: ProjectRole }

// Update member role
PATCH /projects/:id/members/:userId/role
Body: { role: ProjectRole }

// Remove member from project
DELETE /projects/:id/members/:userId
```

## Permission Matrix

| Action | Global | Team | Project | Notes |
|--------|--------|------|---------|-------|
| Create Team | ADMIN only | - | - | Enforced in controller |
| Invite to Team | - | ADMIN/MEMBER | - | Existing functionality |
| Create Project | MEMBER+ | MEMBER+ | - | Existing functionality |
| View Project | - | - | MEMBER+ | Any member can view |
| Add to Project | - | - | LEAD | New endpoint |
| Change Project Role | - | - | LEAD | New endpoint |
| Remove from Project | - | - | LEAD | New endpoint |
| Manage Project Tasks | - | - | CONTRIBUTOR+ | Role-based |

## Security Features

### 1. Role-Based Access Control (RBAC)

Every operation checks:
```typescript
if (requesterMembership.role !== 'LEAD') {
  throw new ForbiddenException('Only project leads can...');
}
```

### 2. Membership Verification

Operations verify requester is a member:
```typescript
const membership = await membershipRepo.findByUserAndProject(userId, projectId);
if (!membership) {
  throw new ForbiddenException('You do not have access to this project');
}
```

### 3. Last Lead Protection

Prevents removing the last project lead:
```typescript
if (targetMembership.role === 'LEAD' && role !== 'LEAD') {
  const leadCount = await prisma.projectMembership.count({
    where: { projectId, role: 'LEAD' }
  });
  if (leadCount === 1) {
    throw new ForbiddenException('Cannot remove the last project lead');
  }
}
```

### 4. Duplicate Prevention

Prevents adding user twice:
```typescript
const existing = await membershipRepo.findByUserAndProject(userId, projectId);
if (existing) {
  throw new ForbiddenException('User is already a member');
}
```

## Implementation Checklist

- [x] Prisma schema updated with ProjectMembership model
- [x] ProjectRole enum created
- [x] Database types generated
- [x] ProjectMembershipRepository created
- [x] ProjectMembership schemas created
- [x] ProjectService updated with member management
- [x] ProjectController updated with new endpoints
- [x] Global role check added to TeamController
- [x] Module updated with new repository
- [x] No TypeScript errors
- [x] Documentation created

## Testing Recommendations

### Unit Tests

```typescript
// Test access control
describe('ProjectService', () => {
  it('should only allow LEAD to add members', async () => {
    // Create project member with CONTRIBUTOR role
    // Try to add another member - should throw ForbiddenException
  });

  it('should prevent removing last LEAD', async () => {
    // Create project with one LEAD
    // Try to remove LEAD - should throw ForbiddenException
  });
});
```

### Integration Tests

```typescript
// Test API endpoints
describe('ProjectController', () => {
  it('GET /projects/:id/members returns members', async () => {
    // Create project and add members
    // Call endpoint - should return member list
  });

  it('POST /projects/:id/members/:userId adds member', async () => {
    // Call endpoint with LEAD user
    // Should add member with specified role
  });

  it('POST /projects/:id/members/:userId rejects non-LEAD', async () => {
    // Call endpoint with CONTRIBUTOR user
    // Should return 403 Forbidden
  });
});
```

### End-to-End Tests

```typescript
// Full workflow
describe('Project Member Management', () => {
  it('complete member lifecycle', async () => {
    1. Create project (auto-adds creator as LEAD)
    2. Add member with CONTRIBUTOR role
    3. List members (should see both)
    4. Update member to REVIEWER role
    5. Remove member
    6. Verify member is gone
  });
});
```

## Migration Guide

### For Existing Teams and Projects

When deploying this update:

1. **Database Migration**: Run Prisma migration to create `ProjectMembership` table
2. **Data Population** (Optional): Create migration to auto-add project creators as LEAD
   ```typescript
   const projects = await prisma.project.findMany();
   for (const project of projects) {
     await prisma.projectMembership.create({
       data: {
         userId: project.createdById,
         projectId: project.id,
         role: 'LEAD'
       }
     });
   }
   ```
3. **Verify**: Check that all projects have at least one LEAD

## Future Enhancements

1. **Invite System for Projects** - Send invites to add project members
2. **Permission Templates** - Pre-defined role combinations
3. **Audit Logging** - Track member addition/removal
4. **Bulk Operations** - Add multiple members at once
5. **Role Inheritance** - Automatic roles based on team membership
6. **Activity Tracking** - Log who accessed what and when

## API Examples

### Add member to project

```bash
curl -X POST http://localhost:3000/projects/proj-123/members/user-456 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "role": "CONTRIBUTOR" }'
```

Response:
```json
{
  "id": "mem-789",
  "userId": "user-456",
  "projectId": "proj-123",
  "role": "CONTRIBUTOR",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Get project members

```bash
curl http://localhost:3000/projects/proj-123/members \
  -H "Authorization: Bearer <token>"
```

Response:
```json
[
  {
    "id": "mem-123",
    "userId": "user-100",
    "projectId": "proj-123",
    "role": "LEAD",
    "user": {
      "id": "user-100",
      "email": "lead@example.com",
      "name": "Project Lead"
    }
  },
  {
    "id": "mem-456",
    "userId": "user-456",
    "projectId": "proj-123",
    "role": "CONTRIBUTOR",
    "user": {
      "id": "user-456",
      "email": "dev@example.com",
      "name": "Developer"
    }
  }
]
```

### Update member role

```bash
curl -X PATCH http://localhost:3000/projects/proj-123/members/user-456/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{ "role": "REVIEWER" }'
```

## Troubleshooting

### Issue: ProjectMembership table not found

**Solution**: Run Prisma migration
```bash
cd apps/api
pnpm exec prisma migrate dev
```

### Issue: Cannot access projectMembership on PrismaService

**Solution**: Ensure Prisma types are generated
```bash
cd apps/api
pnpm exec prisma generate
```

### Issue: Only ADMIN can create teams error

**Verification**: Check user role in database
```sql
SELECT id, email, role FROM User WHERE id = 'user-id';
```

Update role to ADMIN if needed:
```sql
UPDATE User SET role = 'ADMIN' WHERE id = 'user-id';
```

## References

- Prisma Documentation: https://www.prisma.io/docs
- NestJS Guards: https://docs.nestjs.com/guards
- RBAC Pattern: https://en.wikipedia.org/wiki/Role-based_access_control
