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
- [x] Bulk department creation with pre-filled defaults
- [x] Leave types configuration with carry forward/encash
- [x] Team member invitation form
- [x] Dashboard onboarding banner

### Phase 3 - Email Invitations - Jan 2026
- [x] Gmail SMTP configuration via Settings
- [x] Welcome emails with temporary passwords
- [x] Auto-create user accounts when employees are invited
- [x] Beautiful HTML email templates
- [x] Test email functionality

### Phase 4 - Forgot Password Flow - Jan 2026
- [x] "Forgot password?" link on login page
- [x] Forgot Password page (/forgot-password)
- [x] 6-character reset token generation
- [x] Reset Password page (/reset-password)
- [x] Password reset email with token
- [x] Change Password UI in Settings

### Phase 5 - Employee Self-Service Portal - Jan 2026
- [x] Role-aware sidebar navigation
- [x] My Profile page (/my-profile)
- [x] Profile card with avatar, name, designation
- [x] Personal Information editing (phone, DOB, blood group, address)
- [x] Emergency Contact editing
- [x] Leave Balance display with progress bars
- [x] Employee dashboard with personal stats
- [x] My Attendance view
- [x] My Leaves view

### Backend APIs Added (Self-Service)
- GET /api/me/profile - Get my profile
- PUT /api/me/profile - Update my profile
- GET /api/me/leave-balance - Get my leave balance
- GET /api/me/leaves - Get my leave requests
- GET /api/me/attendance - Get my attendance
- GET /api/me/dashboard - Get employee dashboard

## Role-Based Navigation
- **Employees**: Dashboard, My Profile, My Attendance, My Leaves
- **HR/Admin**: Dashboard, Employees, Departments, Attendance, Leave, Settings

## Prioritized Backlog

### P0 - Critical
- [ ] Timesheets module (Client/Project/Task)

### P1 - High Priority
- [ ] Organization chart visualization
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
- [ ] Mobile responsive optimization

## Next Tasks
1. Build timesheets module with project tracking
2. Add organization chart visualization
3. Implement payroll structure with India compliance
4. Add reports and analytics dashboard
