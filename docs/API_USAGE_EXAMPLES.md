# API Usage Examples

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 1. Create Team (Admin Only)

### Request
```bash
POST /teams
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "name": "Design Team",
  "description": "UI/UX Design Team"
}
```

### Success Response (201 Created)
```json
{
  "id": "team-123",
  "name": "Design Team",
  "description": "UI/UX Design Team",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### Error Response (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Only administrators can create teams",
  "error": "Forbidden"
}
```

---

## 2. Create Project

### Request
```bash
POST /projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Landing Page Redesign",
  "description": "Redesign the main landing page",
  "teamId": "team-123"
}
```

### Success Response (201 Created)
```json
{
  "id": "proj-456",
  "name": "Landing Page Redesign",
  "description": "Redesign the main landing page",
  "teamId": "team-123",
  "createdById": "user-100",
  "isCompleted": false,
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

> **Note**: Creator is automatically added as LEAD to the project.

---

## 3. Get Project Members

### Request
```bash
GET /projects/proj-456/members
Authorization: Bearer <token>
```

### Success Response (200 OK)
```json
[
  {
    "id": "mem-1",
    "userId": "user-100",
    "projectId": "proj-456",
    "role": "LEAD",
    "createdAt": "2024-01-15T11:00:00Z",
    "updatedAt": "2024-01-15T11:00:00Z",
    "user": {
      "id": "user-100",
      "email": "lead@company.com",
      "name": "John Lead"
    }
  }
]
```

### Error Response (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "You do not have access to this project",
  "error": "Forbidden"
}
```

---

## 4. Add Member to Project (LEAD Only)

### Request
```bash
POST /projects/proj-456/members/user-200
Content-Type: application/json
Authorization: Bearer <lead_token>

{
  "role": "CONTRIBUTOR"
}
```

### Roles Available
- `LEAD` - Full project management
- `CONTRIBUTOR` - Can create/edit tasks
- `REVIEWER` - Can review/comment
- `VIEWER` - Read-only access

### Success Response (201 Created)
```json
{
  "id": "mem-2",
  "userId": "user-200",
  "projectId": "proj-456",
  "role": "CONTRIBUTOR",
  "createdAt": "2024-01-15T11:15:00Z",
  "updatedAt": "2024-01-15T11:15:00Z",
  "user": {
    "id": "user-200",
    "email": "dev@company.com",
    "name": "Jane Developer"
  }
}
```

### Error: Not LEAD (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Only project leads can add members",
  "error": "Forbidden"
}
```

### Error: User Already Member (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "User is already a member of this project",
  "error": "Forbidden"
}
```

---

## 5. Update Member Role (LEAD Only)

### Request
```bash
PATCH /projects/proj-456/members/user-200/role
Content-Type: application/json
Authorization: Bearer <lead_token>

{
  "role": "REVIEWER"
}
```

### Success Response (200 OK)
```json
{
  "id": "mem-2",
  "userId": "user-200",
  "projectId": "proj-456",
  "role": "REVIEWER",
  "createdAt": "2024-01-15T11:15:00Z",
  "updatedAt": "2024-01-15T11:20:00Z",
  "user": {
    "id": "user-200",
    "email": "dev@company.com",
    "name": "Jane Developer"
  }
}
```

### Error: Not LEAD (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Only project leads can change member roles",
  "error": "Forbidden"
}
```

### Error: User Not Member (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User is not a member of this project",
  "error": "Not Found"
}
```

### Error: Can't Remove Last LEAD (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Cannot remove the last project lead",
  "error": "Forbidden"
}
```

---

## 6. Remove Member from Project (LEAD Only)

### Request
```bash
DELETE /projects/proj-456/members/user-200
Authorization: Bearer <lead_token>
```

### Success Response (204 No Content)
```
(empty response body)
```

### Error: Not LEAD (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Only project leads can remove members",
  "error": "Forbidden"
}
```

### Error: User Not Member (404 Not Found)
```json
{
  "statusCode": 404,
  "message": "User is not a member of this project",
  "error": "Not Found"
}
```

---

## Complete Workflow Example

### Step 1: Admin creates team
```bash
curl -X POST http://localhost:3000/teams \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer admin_token" \
  -d '{
    "name": "Backend Team",
    "description": "API development"
  }'
```
Returns: `team-123`

### Step 2: Team member creates project
```bash
curl -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer member_token" \
  -d '{
    "name": "Auth Service",
    "description": "Authentication API",
    "teamId": "team-123"
  }'
```
Returns: `proj-456` (creator is auto LEAD)

### Step 3: LEAD views project members
```bash
curl http://localhost:3000/projects/proj-456/members \
  -H "Authorization: Bearer member_token"
```
Returns array with 1 member (the creator)

### Step 4: LEAD adds another developer
```bash
curl -X POST http://localhost:3000/projects/proj-456/members/user-200 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer member_token" \
  -d '{ "role": "CONTRIBUTOR" }'
```
Success

### Step 5: LEAD views members again
```bash
curl http://localhost:3000/projects/proj-456/members \
  -H "Authorization: Bearer member_token"
```
Returns array with 2 members

### Step 6: LEAD promotes developer to REVIEWER
```bash
curl -X PATCH http://localhost:3000/projects/proj-456/members/user-200/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer member_token" \
  -d '{ "role": "REVIEWER" }'
```
Success

### Step 7: LEAD removes developer
```bash
curl -X DELETE http://localhost:3000/projects/proj-456/members/user-200 \
  -H "Authorization: Bearer member_token"
```
Success (204 No Content)

---

## Status Codes Reference

| Code | Meaning | Example |
|------|---------|---------|
| 200 | Success (data returned) | GET members, PATCH role |
| 201 | Created | POST member, POST project |
| 204 | No Content (success) | DELETE member |
| 400 | Bad Request | Invalid role value |
| 403 | Forbidden | Not enough permissions |
| 404 | Not Found | User/project doesn't exist |
| 500 | Server Error | Database error |

---

## Common Issues

### Issue: "Cannot remove the last project lead"

**What**: Trying to remove or demote the only LEAD in a project

**Solution**: 
1. Add another LEAD first: `POST /projects/:id/members/:userId` with `role: "LEAD"`
2. Then remove/demote the other

### Issue: "Only project leads can add members"

**What**: Trying to add member without LEAD role

**Solution**:
1. Ask a LEAD to add you to the project
2. OR ask current LEAD to promote you to LEAD
3. OR contact admin to manage roles

### Issue: "User is already a member of this project"

**What**: Trying to add someone who's already in the project

**Solution**:
1. Check current members: `GET /projects/:id/members`
2. If they're already there, update role instead: `PATCH /projects/:id/members/:userId/role`

### Issue: "Only administrators can create teams"

**What**: Non-admin user tried to create team

**Solution**:
1. Contact admin to create team
2. OR ask admin to promote your user to ADMIN role
3. Once team exists, MEMBER role can create projects

---

## Rate Limiting

Currently no rate limiting. Add these headers when needed:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640000000
```

---

## Pagination

List endpoints don't paginate currently. Add `?page=1&limit=20` when needed:
```bash
GET /projects/proj-456/members?page=1&limit=50
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Jan 2024 | Initial implementation |

## Questions?

Refer to:
- `/docs/PROJECT_MEMBER_IMPLEMENTATION.md` - Comprehensive guide
- `/docs/IMPLEMENTATION_SUMMARY.md` - What was changed
- API schema files in `/packages/api/src/schemas/`
