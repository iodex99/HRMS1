# BambooClone HR - Product Requirements Document

## Original Problem Statement
Build a BambooHR-style HRMS clone platform - a greenfield, multi-tenant HRMS platform with:
- Core HR modules (Employee Management, Departments, Organization Structure)
- Time & Work (Attendance, Leave Management, Timesheets)
- Hiring & Onboarding
- Performance Management
- Payroll & Compliance (India-First)
- Expenses
- Workflow Engine, Audit Logs, Analytics

Target: Small/mid-size companies, professional firms, India-first organizations

## User Choices
- **Authentication**: JWT-based custom auth
- **Multi-tenancy**: Database-level isolation (tenant_id pattern)
- **Design**: Clean professional light theme like BambooHR
- **AI Features**: None required

## Architecture
- **Frontend**: React 18 + Tailwind CSS + Lucide Icons
- **Backend**: FastAPI (Python) with Motor (async MongoDB)
- **Database**: MongoDB with tenant isolation via tenant_id
- **Auth**: JWT tokens with bcrypt password hashing

## User Personas
1. **Super Admin**: Platform owner, manages tenants
2. **Company Admin/HR**: Manages company employees, departments, policies
3. **Employee**: Self-service (attendance, leave requests, profile)

## Core Requirements (Static)
- Multi-tenant data isolation
- Role-based access control (RBAC)
- JWT authentication
- Clean BambooHR-style UI

## What's Been Implemented

### Phase 1 MVP - Jan 2026
- [x] JWT Authentication (login/register)
- [x] Dashboard with stats overview
- [x] Employee Management (CRUD)
- [x] Department Management (CRUD)
- [x] Leave Management (request/approve/reject)
- [x] Attendance (clock in/out)
- [x] Leave Types Configuration
- [x] Settings page

### Phase 2 - Quick Onboarding Wizard - Jan 2026
- [x] Multi-step setup wizard (4 steps)
- [x] Step 1: Bulk department creation with pre-filled defaults
- [x] Step 2: Leave types configuration with carry forward/encash
- [x] Step 3: Team member invitation form
- [x] Step 4: Completion summary with stats
- [x] Dashboard onboarding banner (shows until completed)
- [x] Skip onboarding option
- [x] Progress indicators and success notifications

### Backend APIs Added
- GET /api/onboarding/status - Check completion status
- POST /api/onboarding/departments - Bulk create departments
- POST /api/onboarding/leave-types - Bulk create leave types
- POST /api/onboarding/employees - Bulk invite employees
- POST /api/onboarding/complete - Mark onboarding complete
- POST /api/onboarding/skip - Skip onboarding

## Prioritized Backlog

### P0 - Critical
- [ ] Employee profile edit
- [ ] Leave balance tracking per employee

### P1 - High Priority
- [ ] Timesheets module (Client/Project/Task)
- [ ] Organization chart visualization
- [ ] Payroll structure setup
- [ ] India compliance (PF, ESIC, PT, TDS)

### P2 - Medium Priority
- [ ] Hiring/ATS module
- [ ] Onboarding checklists (post-hire)
- [ ] Performance reviews
- [ ] Goals/OKRs
- [ ] Expense claims
- [ ] Document vault

### P3 - Future
- [ ] Workflow engine configuration UI
- [ ] Audit logs viewer
- [ ] Reports & Analytics
- [ ] Bulk import/export
- [ ] Email notifications
- [ ] Multi-tenant admin panel

## Next Tasks
1. Add employee profile edit functionality
2. Implement leave balance calculation per employee
3. Build timesheets module with project tracking
4. Add organization chart visualization
