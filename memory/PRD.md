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
- [x] Completion summary with stats
- [x] Dashboard onboarding banner

### Phase 3 - Email Invitations - Jan 2026
- [x] Gmail SMTP configuration via Settings page
- [x] App Password support (16-digit codes)
- [x] Welcome emails with temporary passwords
- [x] Auto-create user accounts when employees are invited
- [x] Beautiful HTML email templates
- [x] Background email sending (non-blocking)
- [x] Test email functionality

### Phase 4 - Forgot Password Flow - Jan 2026
- [x] "Forgot password?" link on login page
- [x] Forgot Password page (/forgot-password)
- [x] 6-character reset token generation
- [x] Reset Password page (/reset-password)
- [x] Password reset email with token
- [x] Token expiry (1 hour)
- [x] Token verification API
- [x] Change Password UI in Settings
- [x] Current/New/Confirm password flow
- [x] Email enumeration protection

### Backend APIs Added (Password Reset)
- POST /api/auth/forgot-password - Request reset email
- POST /api/auth/reset-password - Reset with token
- POST /api/auth/change-password - Change for logged-in users
- GET /api/auth/verify-reset-token/{token} - Verify token

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
- [ ] Multi-tenant admin panel

## Next Tasks
1. Add employee profile edit functionality
2. Implement leave balance calculation per employee
3. Build timesheets module with project tracking
4. Add organization chart visualization
