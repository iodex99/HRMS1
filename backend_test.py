#!/usr/bin/env python3
"""
BambooClone HRMS Backend API Test Suite
Tests all major API endpoints for the HRMS platform
"""

import requests
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

class HRMSAPITester:
    def __init__(self, base_url: str = "https://hrmate-8.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'employees': [],
            'departments': [],
            'leave_types': [],
            'leave_requests': []
        }

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    expected_status: int = 200) -> tuple[bool, Dict]:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}

            success = response.status_code == expected_status
            try:
                response_data = response.json()
            except:
                response_data = {"status_code": response.status_code, "text": response.text}

            return success, response_data

        except requests.exceptions.RequestException as e:
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test API health endpoint"""
        success, data = self.make_request('GET', 'health')
        self.log_test("Health Check", success and data.get('status') == 'healthy')
        return success

    def test_login(self, email: str = "admin@bambooclone.com", password: str = "admin123"):
        """Test user login"""
        success, data = self.make_request('POST', 'auth/login', {
            'email': email,
            'password': password
        })
        
        if success and 'token' in data:
            self.token = data['token']
            self.user_id = data['user']['id']
            self.log_test("Login", True, f"- User: {data['user']['full_name']}")
            return True
        else:
            self.log_test("Login", False, f"- {data.get('detail', 'Unknown error')}")
            return False

    def test_get_current_user(self):
        """Test getting current user info"""
        success, data = self.make_request('GET', 'auth/me')
        self.log_test("Get Current User", success and 'user' in data)
        return success

    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, data = self.make_request('GET', 'dashboard/stats')
        expected_keys = ['total_employees', 'total_departments', 'pending_leaves', 'present_today']
        has_all_keys = all(key in data for key in expected_keys) if success else False
        self.log_test("Dashboard Stats", success and has_all_keys, 
                     f"- Stats: {data}" if success else "")
        return success

    def test_create_department(self):
        """Test creating a department"""
        dept_data = {
            'name': f'Test Department {datetime.now().strftime("%H%M%S")}',
            'code': f'TD{datetime.now().strftime("%H%M%S")}',
            'description': 'Test department for API testing'
        }
        
        success, data = self.make_request('POST', 'departments', dept_data, 200)
        if success and 'id' in data:
            self.created_resources['departments'].append(data['id'])
            self.log_test("Create Department", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Department", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_departments(self):
        """Test getting all departments"""
        success, data = self.make_request('GET', 'departments')
        self.log_test("Get Departments", success and isinstance(data, list))
        return success

    def test_create_employee(self, department_id: Optional[str] = None):
        """Test creating an employee"""
        timestamp = datetime.now().strftime("%H%M%S")
        emp_data = {
            'employee_id': f'EMP{timestamp}',
            'full_name': f'Test Employee {timestamp}',
            'email': f'test.employee.{timestamp}@bambooclone.com',
            'phone': '+1234567890',
            'department_id': department_id,
            'designation': 'Software Engineer',
            'date_of_joining': datetime.now().strftime('%Y-%m-%d'),
            'employment_type': 'full-time',
            'status': 'active'
        }
        
        success, data = self.make_request('POST', 'employees', emp_data, 200)
        if success and 'id' in data:
            self.created_resources['employees'].append(data['id'])
            self.log_test("Create Employee", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Employee", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_employees(self):
        """Test getting all employees"""
        success, data = self.make_request('GET', 'employees')
        self.log_test("Get Employees", success and isinstance(data, list))
        return success

    def test_create_leave_type(self):
        """Test creating a leave type"""
        timestamp = datetime.now().strftime("%H%M%S")
        lt_data = {
            'name': f'Test Leave {timestamp}',
            'code': f'TL{timestamp}',
            'days_allowed': 10,
            'carry_forward': True,
            'encashable': False
        }
        
        success, data = self.make_request('POST', 'leave-types', lt_data, 200)
        if success and 'id' in data:
            self.created_resources['leave_types'].append(data['id'])
            self.log_test("Create Leave Type", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Leave Type", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_leave_types(self):
        """Test getting all leave types"""
        success, data = self.make_request('GET', 'leave-types')
        self.log_test("Get Leave Types", success and isinstance(data, list))
        return success

    def test_create_leave_request(self, leave_type_id: Optional[str] = None):
        """Test creating a leave request"""
        if not leave_type_id:
            # Try to get existing leave types first
            success, data = self.make_request('GET', 'leave-types')
            if success and data:
                leave_type_id = data[0]['id']
            else:
                self.log_test("Create Leave Request", False, "- No leave types available")
                return None

        start_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        end_date = (datetime.now() + timedelta(days=3)).strftime('%Y-%m-%d')
        
        lr_data = {
            'leave_type_id': leave_type_id,
            'start_date': start_date,
            'end_date': end_date,
            'reason': 'Test leave request for API testing'
        }
        
        success, data = self.make_request('POST', 'leave-requests', lr_data, 200)
        if success and 'id' in data:
            self.created_resources['leave_requests'].append(data['id'])
            self.log_test("Create Leave Request", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Leave Request", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_leave_requests(self):
        """Test getting all leave requests"""
        success, data = self.make_request('GET', 'leave-requests')
        self.log_test("Get Leave Requests", success and isinstance(data, list))
        return success

    def test_clock_in(self):
        """Test clock in functionality"""
        success, data = self.make_request('POST', 'attendance/clock-in', {}, 200)
        self.log_test("Clock In", success and 'message' in data)
        return success

    def test_get_today_attendance(self):
        """Test getting today's attendance"""
        success, data = self.make_request('GET', 'attendance/today')
        # Note: This might return None if no attendance, which is valid
        self.log_test("Get Today Attendance", success)
        return success

    def test_clock_out(self):
        """Test clock out functionality"""
        success, data = self.make_request('POST', 'attendance/clock-out', {}, 200)
        self.log_test("Clock Out", success and 'message' in data)
        return success

    def test_get_attendance(self):
        """Test getting attendance records"""
        success, data = self.make_request('GET', 'attendance')
        self.log_test("Get Attendance", success and isinstance(data, list))
        return success

    def test_onboarding_status(self):
        """Test getting onboarding status"""
        success, data = self.make_request('GET', 'onboarding/status')
        expected_keys = ['departments_created', 'leave_types_created', 'employees_invited', 'completed']
        has_all_keys = all(key in data for key in expected_keys) if success else False
        self.log_test("Onboarding Status", success and has_all_keys, 
                     f"- Status: {data}" if success else "")
        return success

    def test_onboarding_bulk_departments(self):
        """Test bulk creating departments via onboarding"""
        timestamp = datetime.now().strftime("%H%M%S")
        departments_data = {
            'departments': [
                {
                    'name': f'Engineering {timestamp}',
                    'code': f'ENG{timestamp}',
                    'description': 'Software development team'
                },
                {
                    'name': f'HR {timestamp}',
                    'code': f'HR{timestamp}',
                    'description': 'Human resources team'
                }
            ]
        }
        
        success, data = self.make_request('POST', 'onboarding/departments', departments_data, 200)
        if success and 'departments' in data:
            # Store created department IDs for cleanup
            for dept in data['departments']:
                self.created_resources['departments'].append(dept['id'])
            self.log_test("Onboarding Bulk Departments", True, 
                         f"- Created {len(data['departments'])} departments")
            return data['departments']
        else:
            self.log_test("Onboarding Bulk Departments", False, 
                         f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_onboarding_bulk_leave_types(self):
        """Test bulk creating leave types via onboarding"""
        timestamp = datetime.now().strftime("%H%M%S")
        leave_types_data = {
            'leave_types': [
                {
                    'name': f'Casual Leave {timestamp}',
                    'code': f'CL{timestamp}',
                    'days_allowed': 12,
                    'carry_forward': False,
                    'encashable': False
                },
                {
                    'name': f'Sick Leave {timestamp}',
                    'code': f'SL{timestamp}',
                    'days_allowed': 10,
                    'carry_forward': False,
                    'encashable': False
                }
            ]
        }
        
        success, data = self.make_request('POST', 'onboarding/leave-types', leave_types_data, 200)
        if success and 'leave_types' in data:
            # Store created leave type IDs for cleanup
            for lt in data['leave_types']:
                self.created_resources['leave_types'].append(lt['id'])
            self.log_test("Onboarding Bulk Leave Types", True, 
                         f"- Created {len(data['leave_types'])} leave types")
            return data['leave_types']
        else:
            self.log_test("Onboarding Bulk Leave Types", False, 
                         f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_onboarding_bulk_employees(self, department_id: Optional[str] = None):
        """Test bulk inviting employees via onboarding"""
        timestamp = datetime.now().strftime("%H%M%S")
        employees_data = {
            'employees': [
                {
                    'full_name': f'John Doe {timestamp}',
                    'email': f'john.doe.{timestamp}@bambooclone.com',
                    'designation': 'Software Engineer',
                    'department_id': department_id
                },
                {
                    'full_name': f'Jane Smith {timestamp}',
                    'email': f'jane.smith.{timestamp}@bambooclone.com',
                    'designation': 'HR Manager',
                    'department_id': department_id
                }
            ]
        }
        
        success, data = self.make_request('POST', 'onboarding/employees', employees_data, 200)
        if success and 'employees' in data:
            # Store created employee IDs for cleanup
            for emp in data['employees']:
                self.created_resources['employees'].append(emp['id'])
            self.log_test("Onboarding Bulk Employees", True, 
                         f"- Invited {len(data['employees'])} employees")
            return data['employees']
        else:
            self.log_test("Onboarding Bulk Employees", False, 
                         f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_onboarding_complete(self):
        """Test completing onboarding"""
        success, data = self.make_request('POST', 'onboarding/complete', {}, 200)
        self.log_test("Onboarding Complete", success and data.get('completed') == True)
        return success

    def test_onboarding_skip(self):
        """Test skipping onboarding"""
        success, data = self.make_request('POST', 'onboarding/skip', {}, 200)
        self.log_test("Onboarding Skip", success and data.get('completed') == True)
        return success

    def test_get_email_settings(self):
        """Test getting email configuration"""
        success, data = self.make_request('GET', 'settings/email')
        expected_keys = ['configured']
        has_all_keys = all(key in data for key in expected_keys) if success else False
        self.log_test("Get Email Settings", success and has_all_keys, 
                     f"- Config: {data}" if success else "")
        return success

    def test_save_email_settings(self):
        """Test saving email configuration"""
        email_config = {
            'smtp_email': 'test@gmail.com',
            'smtp_password': 'testapppassword123',
            'smtp_host': 'smtp.gmail.com',
            'smtp_port': 587,
            'company_name': 'Test Company'
        }
        
        success, data = self.make_request('POST', 'settings/email', email_config, 200)
        self.log_test("Save Email Settings", success and data.get('configured') == True)
        return success

    def test_email_test_endpoint(self):
        """Test email test functionality"""
        # This will likely fail without real SMTP credentials, but we test the endpoint
        success, data = self.make_request('POST', 'settings/email/test', {}, expected_status=500)
        # We expect 500 because we don't have real Gmail credentials
        # But the endpoint should exist and return proper error
        endpoint_exists = success or (not success and 'error' in data and 'Email error' in str(data))
        self.log_test("Email Test Endpoint", endpoint_exists, 
                     "- Expected failure due to test credentials")
        return endpoint_exists

    def test_forgot_password_request(self, email: str = "admin@bambooclone.com"):
        """Test forgot password request"""
        success, data = self.make_request('POST', 'auth/forgot-password', {
            'email': email
        }, 200)
        
        # Should always return success message to prevent email enumeration
        expected_message = "If an account exists with this email, you will receive a password reset link"
        message_correct = data.get('message') == expected_message if success else False
        
        self.log_test("Forgot Password Request", success and message_correct, 
                     f"- Email: {email}")
        return success and message_correct

    def test_forgot_password_invalid_email(self):
        """Test forgot password with invalid email"""
        success, data = self.make_request('POST', 'auth/forgot-password', {
            'email': 'nonexistent@example.com'
        }, 200)
        
        # Should still return success message to prevent email enumeration
        expected_message = "If an account exists with this email, you will receive a password reset link"
        message_correct = data.get('message') == expected_message if success else False
        
        self.log_test("Forgot Password Invalid Email", success and message_correct, 
                     "- Should not reveal if email exists")
        return success and message_correct

    def test_verify_reset_token_invalid(self):
        """Test verifying an invalid reset token"""
        success, data = self.make_request('GET', 'auth/verify-reset-token/INVALID', expected_status=400)
        
        # Should return 400 for invalid token
        self.log_test("Verify Invalid Reset Token", success, 
                     f"- Error: {data.get('detail', 'Unknown error')}")
        return success

    def test_reset_password_invalid_token(self):
        """Test reset password with invalid token"""
        success, data = self.make_request('POST', 'auth/reset-password', {
            'token': 'INVALID',
            'new_password': 'newpassword123'
        }, 400)
        
        # Should return 400 for invalid token
        expected_error = "Invalid or expired reset token"
        error_correct = data.get('detail') == expected_error if success else False
        
        self.log_test("Reset Password Invalid Token", success and error_correct, 
                     f"- Error: {data.get('detail', 'Unknown error')}")
        return success and error_correct

    def test_change_password_authenticated(self):
        """Test changing password for authenticated user"""
        # First ensure we're logged in
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('POST', 'auth/change-password', {
            'current_password': 'admin123',
            'new_password': 'newadmin123'
        }, 200)
        
        if success and data.get('message') == 'Password changed successfully':
            # Change it back to original
            success2, data2 = self.make_request('POST', 'auth/change-password', {
                'current_password': 'newadmin123',
                'new_password': 'admin123'
            }, 200)
            
            self.log_test("Change Password Authenticated", success and success2, 
                         "- Password changed and reverted")
            return success and success2
        else:
            self.log_test("Change Password Authenticated", False, 
                         f"- {data.get('detail', 'Unknown error')}")
            return False

    def test_change_password_wrong_current(self):
        """Test changing password with wrong current password"""
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('POST', 'auth/change-password', {
            'current_password': 'wrongpassword',
            'new_password': 'newpassword123'
        }, 400)
        
        expected_error = "Current password is incorrect"
        error_correct = data.get('detail') == expected_error if success else False
        
        self.log_test("Change Password Wrong Current", success and error_correct, 
                     f"- Error: {data.get('detail', 'Unknown error')}")
        return success and error_correct

    def test_get_my_profile(self):
        """Test getting current user's profile"""
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('GET', 'me/profile')
        expected_keys = ['full_name', 'email', 'role']
        has_basic_keys = all(key in data for key in expected_keys) if success else False
        
        self.log_test("Get My Profile", success and has_basic_keys, 
                     f"- Profile: {data.get('full_name', 'Unknown')} ({data.get('role', 'Unknown')})")
        return success and has_basic_keys

    def test_update_my_profile(self):
        """Test updating current user's profile"""
        if not self.token:
            self.test_login()
        
        # First get current profile to see if user is an employee
        success, profile_data = self.make_request('GET', 'me/profile')
        if not success:
            self.log_test("Update My Profile", False, "- Could not get current profile")
            return False
        
        if not profile_data.get('is_employee', False):
            self.log_test("Update My Profile", True, "- Skipped (user is not an employee)")
            return True
        
        # Update profile data
        update_data = {
            'phone': '+1234567890',
            'emergency_contact': 'Emergency Contact Name',
            'emergency_phone': '+0987654321',
            'address': '123 Test Street, Test City',
            'blood_group': 'O+',
            'date_of_birth': '1990-01-01'
        }
        
        success, data = self.make_request('PUT', 'me/profile', update_data)
        self.log_test("Update My Profile", success and data.get('message') == 'Profile updated successfully')
        return success

    def test_get_my_leave_balance(self):
        """Test getting current user's leave balance"""
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('GET', 'me/leave-balance')
        expected_keys = ['year', 'balances']
        has_keys = all(key in data for key in expected_keys) if success else False
        
        self.log_test("Get My Leave Balance", success and has_keys, 
                     f"- Year: {data.get('year', 'Unknown')}, Balances: {len(data.get('balances', []))}")
        return success and has_keys

    def test_get_my_leaves(self):
        """Test getting current user's leave requests"""
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('GET', 'me/leaves')
        self.log_test("Get My Leaves", success and isinstance(data, list), 
                     f"- Found {len(data) if isinstance(data, list) else 0} leave requests")
        return success

    def test_get_my_attendance(self):
        """Test getting current user's attendance records"""
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('GET', 'me/attendance')
        expected_keys = ['records', 'summary']
        has_keys = all(key in data for key in expected_keys) if success else False
        
        self.log_test("Get My Attendance", success and has_keys, 
                     f"- Records: {len(data.get('records', []))}, Summary: {data.get('summary', {})}")
        return success and has_keys

    def test_get_employee_dashboard(self):
        """Test getting employee dashboard data"""
        if not self.token:
            self.test_login()
        
        success, data = self.make_request('GET', 'me/dashboard')
        expected_keys = ['pending_leaves', 'present_this_month']
        has_keys = all(key in data for key in expected_keys) if success else False
        
        self.log_test("Get Employee Dashboard", success and has_keys, 
                     f"- Pending leaves: {data.get('pending_leaves', 0)}, Present this month: {data.get('present_this_month', 0)}")
        return success and has_keys

    # ============== TIMESHEET MODULE TESTS ==============
    
    def test_create_client(self):
        """Test creating a client"""
        timestamp = datetime.now().strftime("%H%M%S")
        client_data = {
            'name': f'Test Client {timestamp}',
            'code': f'TC{timestamp}',
            'description': 'Test client for API testing',
            'contact_person': 'John Doe',
            'contact_email': f'contact.{timestamp}@testclient.com',
            'is_active': True
        }
        
        success, data = self.make_request('POST', 'clients', client_data, 200)
        if success and 'id' in data:
            self.created_resources.setdefault('clients', []).append(data['id'])
            self.log_test("Create Client", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Client", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_clients(self):
        """Test getting all clients"""
        success, data = self.make_request('GET', 'clients')
        self.log_test("Get Clients", success and isinstance(data, list))
        return success

    def test_get_client_by_id(self, client_id: str):
        """Test getting a specific client"""
        success, data = self.make_request('GET', f'clients/{client_id}')
        self.log_test("Get Client by ID", success and 'id' in data, 
                     f"- Client: {data.get('name', 'Unknown')}")
        return success

    def test_create_project(self, client_id: Optional[str] = None):
        """Test creating a project"""
        if not client_id:
            # Create a client first
            client_id = self.test_create_client()
            if not client_id:
                self.log_test("Create Project", False, "- No client available")
                return None

        timestamp = datetime.now().strftime("%H%M%S")
        project_data = {
            'name': f'Test Project {timestamp}',
            'code': f'TP{timestamp}',
            'client_id': client_id,
            'description': 'Test project for API testing',
            'start_date': datetime.now().strftime('%Y-%m-%d'),
            'end_date': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'budget_hours': 100.0,
            'is_billable': True,
            'is_active': True
        }
        
        success, data = self.make_request('POST', 'projects', project_data, 200)
        if success and 'id' in data:
            self.created_resources.setdefault('projects', []).append(data['id'])
            self.log_test("Create Project", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Project", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_projects(self):
        """Test getting all projects"""
        success, data = self.make_request('GET', 'projects')
        self.log_test("Get Projects", success and isinstance(data, list))
        return success

    def test_get_project_by_id(self, project_id: str):
        """Test getting a specific project"""
        success, data = self.make_request('GET', f'projects/{project_id}')
        expected_keys = ['id', 'name', 'client_name', 'logged_hours', 'billable_hours']
        has_keys = all(key in data for key in expected_keys) if success else False
        self.log_test("Get Project by ID", success and has_keys, 
                     f"- Project: {data.get('name', 'Unknown')}, Hours: {data.get('logged_hours', 0)}")
        return success

    def test_create_task(self, project_id: Optional[str] = None):
        """Test creating a task"""
        if not project_id:
            # Create a project first
            project_id = self.test_create_project()
            if not project_id:
                self.log_test("Create Task", False, "- No project available")
                return None

        timestamp = datetime.now().strftime("%H%M%S")
        task_data = {
            'name': f'Test Task {timestamp}',
            'project_id': project_id,
            'description': 'Test task for API testing',
            'is_billable': True
        }
        
        success, data = self.make_request('POST', 'tasks', task_data, 200)
        if success and 'id' in data:
            self.created_resources.setdefault('tasks', []).append(data['id'])
            self.log_test("Create Task", True, f"- ID: {data['id']}")
            return data['id']
        else:
            self.log_test("Create Task", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_tasks(self, project_id: Optional[str] = None):
        """Test getting tasks"""
        endpoint = 'tasks'
        if project_id:
            endpoint += f'?project_id={project_id}'
        
        success, data = self.make_request('GET', endpoint)
        self.log_test("Get Tasks", success and isinstance(data, list), 
                     f"- Found {len(data) if isinstance(data, list) else 0} tasks")
        return success

    def test_create_timesheet_entry(self, project_id: Optional[str] = None, task_id: Optional[str] = None):
        """Test creating a timesheet entry"""
        if not project_id:
            # Create a project first
            project_id = self.test_create_project()
            if not project_id:
                self.log_test("Create Timesheet Entry", False, "- No project available")
                return None

        entry_data = {
            'date': datetime.now().strftime('%Y-%m-%d'),
            'project_id': project_id,
            'task_id': task_id,
            'hours': 8.0,
            'description': 'Test timesheet entry for API testing',
            'is_billable': True
        }
        
        success, data = self.make_request('POST', 'timesheets/entries', entry_data, 200)
        if success and 'id' in data:
            self.created_resources.setdefault('timesheet_entries', []).append(data['id'])
            self.log_test("Create Timesheet Entry", True, f"- ID: {data['id']}, Hours: {entry_data['hours']}")
            return data['id']
        else:
            self.log_test("Create Timesheet Entry", False, f"- {data.get('detail', 'Unknown error')}")
            return None

    def test_get_timesheet_entries(self):
        """Test getting timesheet entries"""
        success, data = self.make_request('GET', 'timesheets/entries')
        self.log_test("Get Timesheet Entries", success and isinstance(data, list), 
                     f"- Found {len(data) if isinstance(data, list) else 0} entries")
        return success

    def test_get_timesheet_entries_by_week(self):
        """Test getting timesheet entries for a specific week"""
        # Get current week start (Monday)
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        success, data = self.make_request('GET', f'timesheets/entries?week_start={week_start}')
        self.log_test("Get Timesheet Entries by Week", success and isinstance(data, list), 
                     f"- Week {week_start}: {len(data) if isinstance(data, list) else 0} entries")
        return success

    def test_submit_timesheet(self):
        """Test submitting timesheet for approval"""
        # Get current week start (Monday)
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        # First create a timesheet entry for this week
        project_id = self.test_create_project()
        if project_id:
            entry_data = {
                'date': week_start,
                'project_id': project_id,
                'hours': 8.0,
                'description': 'Test entry for submission',
                'is_billable': True
            }
            success, entry = self.make_request('POST', 'timesheets/entries', entry_data, 200)
            if success:
                self.created_resources.setdefault('timesheet_entries', []).append(entry['id'])

        submit_data = {
            'week_start': week_start,
            'entries': []  # Backend will find all draft entries for the week
        }
        
        success, data = self.make_request('POST', 'timesheets/submit', submit_data, 200)
        self.log_test("Submit Timesheet", success and 'count' in data, 
                     f"- Submitted {data.get('count', 0)} entries")
        return success

    def test_get_timesheet_summary(self):
        """Test getting timesheet summary"""
        # Get current week start (Monday)
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        success, data = self.make_request('GET', f'timesheets/summary?week_start={week_start}')
        expected_keys = ['total_hours', 'billable_hours', 'non_billable_hours', 'billable_percentage']
        has_keys = all(key in data for key in expected_keys) if success else False
        
        self.log_test("Get Timesheet Summary", success and has_keys, 
                     f"- Total: {data.get('total_hours', 0)}h, Billable: {data.get('billable_hours', 0)}h")
        return success

    def test_get_pending_approvals(self):
        """Test getting pending timesheet approvals (admin only)"""
        success, data = self.make_request('GET', 'timesheets/pending-approvals')
        self.log_test("Get Pending Approvals", success and isinstance(data, list), 
                     f"- Found {len(data) if isinstance(data, list) else 0} pending approvals")
        return success

    def test_approve_timesheet(self, user_id: Optional[str] = None):
        """Test approving timesheet entries"""
        if not user_id:
            user_id = self.user_id
        
        # Get current week start (Monday)
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        success, data = self.make_request('PUT', f'timesheets/approve?user_id={user_id}&week_start={week_start}', 
                                        expected_status=200)
        self.log_test("Approve Timesheet", success and 'count' in data, 
                     f"- Approved {data.get('count', 0)} entries")
        return success

    def test_reject_timesheet(self, user_id: Optional[str] = None):
        """Test rejecting timesheet entries"""
        if not user_id:
            user_id = self.user_id
        
        # Get current week start (Monday)
        today = datetime.now()
        week_start = (today - timedelta(days=today.weekday())).strftime('%Y-%m-%d')
        
        success, data = self.make_request('PUT', f'timesheets/reject?user_id={user_id}&week_start={week_start}&reason=Test rejection', 
                                        expected_status=200)
        self.log_test("Reject Timesheet", success and 'count' in data, 
                     f"- Rejected {data.get('count', 0)} entries")
        return success

    def test_delete_timesheet_entry(self, entry_id: str):
        """Test deleting a timesheet entry"""
        success, data = self.make_request('DELETE', f'timesheets/entries/{entry_id}', expected_status=200)
        self.log_test("Delete Timesheet Entry", success and data.get('message') == 'Entry deleted')
        return success

    def cleanup_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Delete employees
        for emp_id in self.created_resources['employees']:
            success, _ = self.make_request('DELETE', f'employees/{emp_id}', expected_status=200)
            if success:
                print(f"   Deleted employee: {emp_id}")

        # Delete departments  
        for dept_id in self.created_resources['departments']:
            success, _ = self.make_request('DELETE', f'departments/{dept_id}', expected_status=200)
            if success:
                print(f"   Deleted department: {dept_id}")

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting BambooClone HRMS API Test Suite")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Basic connectivity
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False

        # Authentication
        if not self.test_login():
            print("❌ Login failed - stopping tests")
            return False

        self.test_get_current_user()

        # Dashboard
        self.test_dashboard_stats()

        # Onboarding flow tests
        print("\n🎯 Testing Onboarding APIs...")
        self.test_onboarding_status()
        
        # Test bulk operations
        created_depts = self.test_onboarding_bulk_departments()
        created_leave_types = self.test_onboarding_bulk_leave_types()
        
        # Use first created department for employee invitation
        dept_id = created_depts[0]['id'] if created_depts else None
        created_employees = self.test_onboarding_bulk_employees(dept_id)
        
        # Test onboarding completion
        self.test_onboarding_complete()
        
        # Test onboarding skip (this will mark as completed again)
        # self.test_onboarding_skip()  # Commented out as complete already called

        # Department management
        dept_id = self.test_create_department()
        self.test_get_departments()

        # Employee management
        emp_id = self.test_create_employee(dept_id)
        self.test_get_employees()

        # Leave management
        lt_id = self.test_create_leave_type()
        self.test_get_leave_types()
        lr_id = self.test_create_leave_request(lt_id)
        self.test_get_leave_requests()

        # Attendance
        self.test_clock_in()
        self.test_get_today_attendance()
        self.test_clock_out()
        self.test_get_attendance()

        # Email Configuration Tests
        print("\n📧 Testing Email Configuration APIs...")
        self.test_get_email_settings()
        self.test_save_email_settings()
        self.test_email_test_endpoint()

        # Password Reset Tests
        print("\n🔐 Testing Password Reset APIs...")
        self.test_forgot_password_request()
        self.test_forgot_password_invalid_email()
        self.test_verify_reset_token_invalid()
        self.test_reset_password_invalid_token()
        self.test_change_password_authenticated()
        self.test_change_password_wrong_current()

        # Employee Self-Service Tests
        print("\n👤 Testing Employee Self-Service APIs...")
        self.test_get_my_profile()
        self.test_update_my_profile()
        self.test_get_my_leave_balance()
        self.test_get_my_leaves()
        self.test_get_my_attendance()
        self.test_get_employee_dashboard()

        # Cleanup
        self.cleanup_resources()

        # Results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = HRMSAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())