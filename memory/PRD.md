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
- **Email**: Gmail SMTP with App Passwords

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
- [x] Bulk department creation
- [x] Leave types configuration
- [x] Team member invitation
- [x] Dashboard onboarding banner

### Phase 3 - Email Invitations - Jan 2026
- [x] Gmail SMTP configuration
- [x] Welcome emails with temporary passwords
- [x] Auto-create user accounts
- [x] Test email functionality

### Phase 4 - Forgot Password Flow - Jan 2026
- [x] Forgot password page
- [x] 6-character reset tokens
- [x] Password reset email
- [x] Change password in Settings

### Phase 5 - Employee Self-Service Portal - Jan 2026
- [x] Role-aware sidebar navigation
- [x] My Profile page with editing
- [x] Leave balance display
- [x] Personal info & emergency contact

### Phase 6 - Timesheets Module - Jan 2026
- [x] Client Management (CRUD)
- [x] Project Management (CRUD with budget hours)
- [x] Task creation per project
- [x] Weekly timesheet grid view
- [x] Time entry logging (hours, description, billable flag)
- [x] Week navigation (prev/next)
- [x] Summary cards (Total, Billable, Non-Billable, Billable %)
- [x] Submit for approval workflow
- [x] Manager approval/rejection
- [x] Pending approvals view
- [x] Project/client-wise hour breakdown

### Backend APIs Added (Timesheets)
- GET/POST /api/clients - Client management
- GET/POST /api/projects - Project management
- GET/POST /api/tasks - Task management
- GET/POST/DELETE /api/timesheets/entries - Time entries
- POST /api/timesheets/submit - Submit for approval
- PUT /api/timesheets/approve - Approve entries
- PUT /api/timesheets/reject - Reject entries
- GET /api/timesheets/summary - Hours summary
- GET /api/timesheets/pending-approvals - Pending list

## Role-Based Navigation
- **Employees**: Dashboard, My Profile, Timesheets, My Attendance, My Leaves
- **HR/Admin**: Dashboard, Employees, Departments, Timesheets, Projects, Attendance, Leave, Settings

## Prioritized Backlog

### P0 - Critical
- [ ] Organization chart visualization

### P1 - High Priority
- [ ] Payroll structure setup
- [ ] India compliance (PF, ESIC, PT, TDS)
- [ ] Reports & Analytics

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
- [ ] Bulk import/export
- [ ] Multi-tenant admin panel

## Next Tasks
1. Add organization chart visualization
2. Implement payroll structure with India compliance
3. Add reports and analytics dashboard
4. Build expense claims module
