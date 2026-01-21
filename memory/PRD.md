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

## What's Been Implemented (Phase 1 MVP) - Jan 2026

### Authentication
- [x] User registration
- [x] User login with JWT
- [x] Protected routes
- [x] Role-based access

### Dashboard
- [x] Stats overview (employees, departments, pending leaves, attendance)
- [x] Quick actions panel
- [x] Today's attendance status
- [x] Clock In/Out functionality

### Employee Management
- [x] Employee directory with search
- [x] Add new employee (full form)
- [x] Delete employee
- [x] Department assignment

### Department Management
- [x] Department cards view
- [x] Add department with code
- [x] Delete department

### Leave Management
- [x] Leave request submission
- [x] Leave type selection
- [x] Approve/Reject workflow (for HR/Admin)
- [x] Leave types configuration

### Attendance
- [x] Clock In/Out
- [x] Attendance history view
- [x] Daily attendance status

### Settings
- [x] Leave types CRUD
- [x] Account information display

## Prioritized Backlog

### P0 - Critical
- [ ] Tenant onboarding flow
- [ ] Employee profile edit
- [ ] Leave balance tracking

### P1 - High Priority
- [ ] Timesheets module (Client/Project/Task)
- [ ] Organization chart visualization
- [ ] Payroll structure setup
- [ ] India compliance (PF, ESIC, PT, TDS)

### P2 - Medium Priority
- [ ] Hiring/ATS module
- [ ] Onboarding checklists
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

## Next Tasks
1. Add employee profile edit functionality
2. Implement leave balance calculation
3. Build timesheets module
4. Add organization chart view
5. Implement payroll structure with India compliance
