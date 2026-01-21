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
    def __init__(self, base_url: str = "http://localhost:8001"):
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
        
        success, data = self.make_request('POST', 'leave-requests', lr_data, 201)
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