#!/bin/bash
# Implementation Verification Checklist
# Run this script to verify all changes are in place

echo "🔍 TeamOps Global Role & Project Member Implementation Verification"
echo "=================================================================="
echo ""

PASS=0
FAIL=0

check_file() {
  if [ -f "$1" ]; then
    echo "✅ $1"
    ((PASS++))
  else
    echo "❌ $1 - MISSING"
    ((FAIL++))
  fi
}

check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo "✅ $1 contains '$2'"
    ((PASS++))
  else
    echo "❌ $1 missing '$2'"
    ((FAIL++))
  fi
}

echo "📁 Checking Files..."
check_file "apps/api/src/modules/project/project-membership.repository.ts"
check_file "apps/api/src/modules/project/project.service.ts"
check_file "apps/api/src/modules/project/project.controller.ts"
check_file "apps/api/prisma/schema.prisma"
check_file "packages/api/src/schemas/project-membership.schema.ts"
check_file "apps/api/src/modules/team/team.controller.ts"
check_file "docs/PROJECT_MEMBER_IMPLEMENTATION.md"
check_file "docs/IMPLEMENTATION_SUMMARY.md"
check_file "docs/API_USAGE_EXAMPLES.md"

echo ""
echo "🔐 Checking Security Features..."
check_content "apps/api/src/modules/team/team.controller.ts" "Only administrators can create teams"
check_content "apps/api/src/modules/project/project.service.ts" "Only project leads can add members"
check_content "apps/api/src/modules/project/project.service.ts" "Cannot remove the last project lead"

echo ""
echo "📊 Checking Database Schema..."
check_content "apps/api/prisma/schema.prisma" "model ProjectMembership"
check_content "apps/api/prisma/schema.prisma" "enum ProjectRole"
check_content "apps/api/prisma/schema.prisma" "LEAD"
check_content "apps/api/prisma/schema.prisma" "CONTRIBUTOR"
check_content "apps/api/prisma/schema.prisma" "REVIEWER"
check_content "apps/api/prisma/schema.prisma" "VIEWER"

echo ""
echo "🛣️  Checking API Endpoints..."
check_content "apps/api/src/modules/project/project.controller.ts" "getMembers"
check_content "apps/api/src/modules/project/project.controller.ts" "addMember"
check_content "apps/api/src/modules/project/project.controller.ts" "updateMemberRole"
check_content "apps/api/src/modules/project/project.controller.ts" "removeMember"

echo ""
echo "🏗️  Checking Repository..."
check_content "apps/api/src/modules/project/project-membership.repository.ts" "create"
check_content "apps/api/src/modules/project/project-membership.repository.ts" "findByUserAndProject"
check_content "apps/api/src/modules/project/project-membership.repository.ts" "findAllByProjectId"
check_content "apps/api/src/modules/project/project-membership.repository.ts" "updateRole"
check_content "apps/api/src/modules/project/project-membership.repository.ts" "delete"

echo ""
echo "📋 Checking Schemas..."
check_content "packages/api/src/schemas/project-membership.schema.ts" "ProjectRoleEnum"
check_content "packages/api/src/schemas/project-membership.schema.ts" "ProjectMembershipSchema"
check_content "packages/api/src/schemas/project-membership.schema.ts" "CreateProjectMembershipSchema"

echo ""
echo "📚 Checking Documentation..."
check_content "docs/PROJECT_MEMBER_IMPLEMENTATION.md" "ProjectMembership"
check_content "docs/IMPLEMENTATION_SUMMARY.md" "Global Role Enforcement"
check_content "docs/API_USAGE_EXAMPLES.md" "Complete Workflow Example"

echo ""
echo "🔗 Checking Module Exports..."
check_content "apps/api/src/modules/project/project.module.ts" "ProjectMembershipRepository"
check_content "packages/api/src/index.ts" "project-membership.schema"

echo ""
echo "=================================================================="
echo "Results: ✅ $PASS passed, ❌ $FAIL failed"
echo ""

if [ $FAIL -eq 0 ]; then
  echo "🎉 All checks passed! Implementation is complete."
  exit 0
else
  echo "⚠️  Some checks failed. Please review the implementation."
  exit 1
fi
