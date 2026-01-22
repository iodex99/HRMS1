from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from bson import ObjectId
from dotenv import load_dotenv
import os
import smtplib
import secrets
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

load_dotenv()

app = FastAPI(title="BambooClone HR API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")
JWT_SECRET = os.environ.get("JWT_SECRET")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("ACCESS_TOKEN_EXPIRE_MINUTES", 480))

# Database
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# Security
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Helper
def str_id(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

def serialize_doc(doc):
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        else:
            result[key] = value
    return result

# Models
class TenantCreate(BaseModel):
    name: str
    domain: str
    industry: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    tenant_id: Optional[str] = None
    role: str = "employee"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    department_id: Optional[str] = None
    designation: Optional[str] = None
    date_of_joining: Optional[str] = None
    reporting_to: Optional[str] = None
    employment_type: str = "full-time"
    status: str = "active"

class DepartmentCreate(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    head_id: Optional[str] = None
    parent_id: Optional[str] = None

class LeaveTypeCreate(BaseModel):
    name: str
    code: str
    days_allowed: int
    carry_forward: bool = False
    encashable: bool = False

class LeaveRequestCreate(BaseModel):
    leave_type_id: str
    start_date: str
    end_date: str
    reason: Optional[str] = None
    half_day: bool = False

class AttendanceCreate(BaseModel):
    date: str
    check_in: Optional[str] = None
    check_out: Optional[str] = None
    status: str = "present"

# Email Configuration Models
class EmailConfigCreate(BaseModel):
    smtp_email: EmailStr
    smtp_password: str  # App Password (16 digits)
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    company_name: Optional[str] = None

class EmailConfigUpdate(BaseModel):
    smtp_email: Optional[EmailStr] = None
    smtp_password: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    company_name: Optional[str] = None

# Email Helper Functions
def generate_temp_password(length=12):
    """Generate a secure temporary password"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))

async def get_email_config(tenant_id: Optional[str] = None):
    """Get email configuration for tenant"""
    query = {"tenant_id": tenant_id} if tenant_id else {"tenant_id": None}
    config = await db.email_config.find_one(query)
    return config

def send_welcome_email(
    to_email: str,
    employee_name: str,
    temp_password: str,
    company_name: str,
    smtp_email: str,
    smtp_password: str,
    smtp_host: str = "smtp.gmail.com",
    smtp_port: int = 587,
    login_url: str = ""
):
    """Send welcome email to new employee"""
    try:
        msg = MIMEMultipart('alternative')
        msg['Subject'] = f"Welcome to {company_name} - Your Account Details"
        msg['From'] = smtp_email
        msg['To'] = to_email
        
        # Plain text version
        text = f"""
Welcome to {company_name}!

Hi {employee_name},

Your HR account has been created. Here are your login details:

Email: {to_email}
Temporary Password: {temp_password}

Please login and change your password immediately.

Login URL: {login_url if login_url else 'Contact your HR admin for the login link'}

Best regards,
{company_name} HR Team
        """
        
        # HTML version
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #334155; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
        .header {{ text-align: center; margin-bottom: 30px; }}
        .logo {{ width: 60px; height: 60px; background: #46A758; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; }}
        .logo svg {{ width: 32px; height: 32px; fill: white; }}
        h1 {{ color: #0F172A; font-size: 24px; margin: 20px 0 10px; }}
        .card {{ background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin: 20px 0; }}
        .credentials {{ background: white; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 16px 0; }}
        .label {{ font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }}
        .value {{ font-size: 16px; font-weight: 600; color: #0F172A; margin-top: 4px; }}
        .password {{ font-family: monospace; background: #FEF3C7; padding: 8px 12px; border-radius: 6px; display: inline-block; }}
        .btn {{ display: inline-block; background: #46A758; color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 500; margin-top: 20px; }}
        .footer {{ text-align: center; margin-top: 30px; font-size: 14px; color: #64748B; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
            </div>
            <h1>Welcome to {company_name}!</h1>
            <p style="color: #64748B;">Your HR account has been created</p>
        </div>
        
        <div class="card">
            <p>Hi <strong>{employee_name}</strong>,</p>
            <p>We're excited to have you on board! Your account has been set up in our HR system. Please use the credentials below to log in.</p>
            
            <div class="credentials">
                <div style="margin-bottom: 12px;">
                    <div class="label">Email</div>
                    <div class="value">{to_email}</div>
                </div>
                <div>
                    <div class="label">Temporary Password</div>
                    <div class="value"><span class="password">{temp_password}</span></div>
                </div>
            </div>
            
            <p style="color: #DC2626; font-size: 14px;">⚠️ Please change your password immediately after your first login.</p>
            
            {f'<a href="{login_url}" class="btn">Login to Your Account</a>' if login_url else ''}
        </div>
        
        <div class="footer">
            <p>Best regards,<br><strong>{company_name} HR Team</strong></p>
            <p style="font-size: 12px; color: #94A3B8;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
        """
        
        part1 = MIMEText(text, 'plain')
        part2 = MIMEText(html, 'html')
        msg.attach(part1)
        msg.attach(part2)
        
        # Send email
        with smtplib.SMTP(smtp_host, smtp_port) as server:
            server.starttls()
            server.login(smtp_email, smtp_password)
            server.sendmail(smtp_email, to_email, msg.as_string())
        
        return True
    except Exception as e:
        print(f"Failed to send email to {to_email}: {str(e)}")
        return False

# Auth helpers
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return serialize_doc(user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Health check
@app.get("/api/health")
async def health():
    return {"status": "healthy", "service": "BambooClone HR API"}

# Auth Routes
@app.post("/api/auth/register")
async def register(user: UserCreate):
    existing = await db.users.find_one({"email": user.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = pwd_context.hash(user.password)
    user_doc = {
        "email": user.email,
        "password": hashed_password,
        "full_name": user.full_name,
        "role": user.role,
        "tenant_id": user.tenant_id,
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    result = await db.users.insert_one(user_doc)
    token = create_access_token({"sub": str(result.inserted_id)})
    return {
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": str(result.inserted_id),
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "tenant_id": user.tenant_id
        }
    }

@app.post("/api/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not pwd_context.verify(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": str(user["_id"])})
    return {
        "token": token,
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "role": user.get("role", "employee"),
            "tenant_id": user.get("tenant_id")
        }
    }

@app.get("/api/auth/me")
async def get_me(user: dict = Depends(get_current_user)):
    return {"user": {k: v for k, v in user.items() if k != "password"}}

# Tenant Routes
@app.post("/api/tenants")
async def create_tenant(tenant: TenantCreate, user: dict = Depends(get_current_user)):
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Only super admin can create tenants")
    
    tenant_doc = {
        "name": tenant.name,
        "domain": tenant.domain,
        "industry": tenant.industry,
        "created_at": datetime.now(timezone.utc),
        "is_active": True,
        "settings": {}
    }
    result = await db.tenants.insert_one(tenant_doc)
    return serialize_doc({**tenant_doc, "_id": result.inserted_id})

@app.get("/api/tenants")
async def get_tenants(user: dict = Depends(get_current_user)):
    if user.get("role") != "super_admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    tenants = await db.tenants.find().to_list(100)
    return [serialize_doc(t) for t in tenants]

# Department Routes
@app.post("/api/departments")
async def create_department(dept: DepartmentCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    dept_doc = {
        "name": dept.name,
        "code": dept.code,
        "description": dept.description,
        "head_id": dept.head_id,
        "parent_id": dept.parent_id,
        "tenant_id": user.get("tenant_id"),
        "created_at": datetime.now(timezone.utc),
        "is_active": True
    }
    result = await db.departments.insert_one(dept_doc)
    return serialize_doc({**dept_doc, "_id": result.inserted_id})

@app.get("/api/departments")
async def get_departments(user: dict = Depends(get_current_user)):
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    
    departments = await db.departments.find(query).to_list(100)
    return [serialize_doc(d) for d in departments]

@app.get("/api/departments/{dept_id}")
async def get_department(dept_id: str, user: dict = Depends(get_current_user)):
    dept = await db.departments.find_one({"_id": ObjectId(dept_id)})
    if not dept:
        raise HTTPException(status_code=404, detail="Department not found")
    return serialize_doc(dept)

@app.put("/api/departments/{dept_id}")
async def update_department(dept_id: str, dept: DepartmentCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {
        "name": dept.name,
        "code": dept.code,
        "description": dept.description,
        "head_id": dept.head_id,
        "parent_id": dept.parent_id,
        "updated_at": datetime.now(timezone.utc)
    }
    result = await db.departments.update_one({"_id": ObjectId(dept_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department updated"}

@app.delete("/api/departments/{dept_id}")
async def delete_department(dept_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.departments.delete_one({"_id": ObjectId(dept_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Department not found")
    return {"message": "Department deleted"}

# Employee Routes
@app.post("/api/employees")
async def create_employee(emp: EmployeeCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    existing = await db.employees.find_one({
        "$or": [
            {"employee_id": emp.employee_id, "tenant_id": user.get("tenant_id")},
            {"email": emp.email, "tenant_id": user.get("tenant_id")}
        ]
    })
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID or email already exists")
    
    emp_doc = {
        "employee_id": emp.employee_id,
        "full_name": emp.full_name,
        "email": emp.email,
        "phone": emp.phone,
        "department_id": emp.department_id,
        "designation": emp.designation,
        "date_of_joining": emp.date_of_joining,
        "reporting_to": emp.reporting_to,
        "employment_type": emp.employment_type,
        "status": emp.status,
        "tenant_id": user.get("tenant_id"),
        "created_at": datetime.now(timezone.utc),
        "created_by": user.get("id")
    }
    result = await db.employees.insert_one(emp_doc)
    return serialize_doc({**emp_doc, "_id": result.inserted_id})

@app.get("/api/employees")
async def get_employees(
    status: Optional[str] = None,
    department_id: Optional[str] = None,
    search: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    if status:
        query["status"] = status
    if department_id:
        query["department_id"] = department_id
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
            {"employee_id": {"$regex": search, "$options": "i"}}
        ]
    
    employees = await db.employees.find(query).to_list(500)
    return [serialize_doc(e) for e in employees]

@app.get("/api/employees/{emp_id}")
async def get_employee(emp_id: str, user: dict = Depends(get_current_user)):
    emp = await db.employees.find_one({"_id": ObjectId(emp_id)})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return serialize_doc(emp)

@app.put("/api/employees/{emp_id}")
async def update_employee(emp_id: str, emp: EmployeeCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {
        "employee_id": emp.employee_id,
        "full_name": emp.full_name,
        "email": emp.email,
        "phone": emp.phone,
        "department_id": emp.department_id,
        "designation": emp.designation,
        "date_of_joining": emp.date_of_joining,
        "reporting_to": emp.reporting_to,
        "employment_type": emp.employment_type,
        "status": emp.status,
        "updated_at": datetime.now(timezone.utc)
    }
    result = await db.employees.update_one({"_id": ObjectId(emp_id)}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee updated"}

@app.delete("/api/employees/{emp_id}")
async def delete_employee(emp_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.employees.delete_one({"_id": ObjectId(emp_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Employee not found")
    return {"message": "Employee deleted"}

# Leave Type Routes
@app.post("/api/leave-types")
async def create_leave_type(lt: LeaveTypeCreate, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    lt_doc = {
        "name": lt.name,
        "code": lt.code,
        "days_allowed": lt.days_allowed,
        "carry_forward": lt.carry_forward,
        "encashable": lt.encashable,
        "tenant_id": user.get("tenant_id"),
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.leave_types.insert_one(lt_doc)
    return serialize_doc({**lt_doc, "_id": result.inserted_id})

@app.get("/api/leave-types")
async def get_leave_types(user: dict = Depends(get_current_user)):
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    
    leave_types = await db.leave_types.find(query).to_list(50)
    return [serialize_doc(lt) for lt in leave_types]

# Leave Request Routes
@app.post("/api/leave-requests")
async def create_leave_request(lr: LeaveRequestCreate, user: dict = Depends(get_current_user)):
    # Get employee for this user
    employee = await db.employees.find_one({"email": user.get("email")})
    
    lr_doc = {
        "employee_id": employee["_id"] if employee else None,
        "user_id": user.get("id"),
        "leave_type_id": lr.leave_type_id,
        "start_date": lr.start_date,
        "end_date": lr.end_date,
        "reason": lr.reason,
        "half_day": lr.half_day,
        "status": "pending",
        "tenant_id": user.get("tenant_id"),
        "created_at": datetime.now(timezone.utc)
    }
    result = await db.leave_requests.insert_one(lr_doc)
    return serialize_doc({**lr_doc, "_id": result.inserted_id})

@app.get("/api/leave-requests")
async def get_leave_requests(
    status: Optional[str] = None,
    employee_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    if status:
        query["status"] = status
    if employee_id:
        query["employee_id"] = ObjectId(employee_id)
    elif user.get("role") == "employee":
        query["user_id"] = user.get("id")
    
    requests = await db.leave_requests.find(query).to_list(100)
    return [serialize_doc(r) for r in requests]

@app.put("/api/leave-requests/{req_id}/approve")
async def approve_leave(req_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.leave_requests.update_one(
        {"_id": ObjectId(req_id)},
        {"$set": {"status": "approved", "approved_by": user.get("id"), "approved_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return {"message": "Leave approved"}

@app.put("/api/leave-requests/{req_id}/reject")
async def reject_leave(req_id: str, user: dict = Depends(get_current_user)):
    if user.get("role") not in ["super_admin", "admin", "hr", "manager"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.leave_requests.update_one(
        {"_id": ObjectId(req_id)},
        {"$set": {"status": "rejected", "rejected_by": user.get("id"), "rejected_at": datetime.now(timezone.utc)}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Leave request not found")
    return {"message": "Leave rejected"}

# Attendance Routes
@app.post("/api/attendance/clock-in")
async def clock_in(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.attendance.find_one({
        "user_id": user.get("id"),
        "date": today
    })
    if existing and existing.get("check_in"):
        raise HTTPException(status_code=400, detail="Already clocked in today")
    
    now = datetime.now(timezone.utc)
    if existing:
        await db.attendance.update_one(
            {"_id": existing["_id"]},
            {"$set": {"check_in": now.isoformat(), "status": "present"}}
        )
    else:
        await db.attendance.insert_one({
            "user_id": user.get("id"),
            "tenant_id": user.get("tenant_id"),
            "date": today,
            "check_in": now.isoformat(),
            "status": "present",
            "created_at": now
        })
    return {"message": "Clocked in successfully", "time": now.isoformat()}

@app.post("/api/attendance/clock-out")
async def clock_out(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    existing = await db.attendance.find_one({
        "user_id": user.get("id"),
        "date": today
    })
    if not existing or not existing.get("check_in"):
        raise HTTPException(status_code=400, detail="Not clocked in yet")
    if existing.get("check_out"):
        raise HTTPException(status_code=400, detail="Already clocked out today")
    
    now = datetime.now(timezone.utc)
    await db.attendance.update_one(
        {"_id": existing["_id"]},
        {"$set": {"check_out": now.isoformat()}}
    )
    return {"message": "Clocked out successfully", "time": now.isoformat()}

@app.get("/api/attendance")
async def get_attendance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    user_id: Optional[str] = None,
    user: dict = Depends(get_current_user)
):
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    if user.get("role") == "employee":
        query["user_id"] = user.get("id")
    elif user_id:
        query["user_id"] = user_id
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        query.setdefault("date", {})["$lte"] = end_date
    
    records = await db.attendance.find(query).sort("date", -1).to_list(100)
    return [serialize_doc(r) for r in records]

@app.get("/api/attendance/today")
async def get_today_attendance(user: dict = Depends(get_current_user)):
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    record = await db.attendance.find_one({
        "user_id": user.get("id"),
        "date": today
    })
    return serialize_doc(record) if record else None

# Dashboard Stats
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(user: dict = Depends(get_current_user)):
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    
    total_employees = await db.employees.count_documents({**query, "status": "active"})
    total_departments = await db.departments.count_documents(query)
    pending_leaves = await db.leave_requests.count_documents({**query, "status": "pending"})
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    present_today = await db.attendance.count_documents({**query, "date": today, "status": "present"})
    
    return {
        "total_employees": total_employees,
        "total_departments": total_departments,
        "pending_leaves": pending_leaves,
        "present_today": present_today,
        "attendance_rate": round((present_today / total_employees * 100) if total_employees > 0 else 0, 1)
    }

# Onboarding Models
class OnboardingStatus(BaseModel):
    departments_created: bool = False
    leave_types_created: bool = False
    employees_invited: bool = False
    completed: bool = False

class BulkDepartmentCreate(BaseModel):
    departments: List[DepartmentCreate]

class BulkLeaveTypeCreate(BaseModel):
    leave_types: List[LeaveTypeCreate]

class EmployeeInvite(BaseModel):
    email: EmailStr
    full_name: str
    department_id: Optional[str] = None
    designation: Optional[str] = None

class BulkEmployeeInvite(BaseModel):
    employees: List[EmployeeInvite]

# Onboarding Routes
@app.get("/api/onboarding/status")
async def get_onboarding_status(user: dict = Depends(get_current_user)):
    """Check if user has completed onboarding"""
    query = {}
    if user.get("tenant_id"):
        query["tenant_id"] = user["tenant_id"]
    
    dept_count = await db.departments.count_documents(query)
    leave_type_count = await db.leave_types.count_documents(query)
    employee_count = await db.employees.count_documents(query)
    
    # Check if onboarding was explicitly completed
    onboarding = await db.onboarding.find_one({"user_id": user.get("id")})
    
    return {
        "departments_created": dept_count > 0,
        "leave_types_created": leave_type_count > 0,
        "employees_invited": employee_count > 0,
        "completed": onboarding.get("completed", False) if onboarding else False,
        "counts": {
            "departments": dept_count,
            "leave_types": leave_type_count,
            "employees": employee_count
        }
    }

@app.post("/api/onboarding/departments")
async def create_onboarding_departments(data: BulkDepartmentCreate, user: dict = Depends(get_current_user)):
    """Create multiple departments during onboarding"""
    created = []
    for dept in data.departments:
        dept_doc = {
            "name": dept.name,
            "code": dept.code,
            "description": dept.description,
            "head_id": dept.head_id,
            "parent_id": dept.parent_id,
            "tenant_id": user.get("tenant_id"),
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        }
        result = await db.departments.insert_one(dept_doc)
        created.append(serialize_doc({**dept_doc, "_id": result.inserted_id}))
    
    return {"message": f"Created {len(created)} departments", "departments": created}

@app.post("/api/onboarding/leave-types")
async def create_onboarding_leave_types(data: BulkLeaveTypeCreate, user: dict = Depends(get_current_user)):
    """Create multiple leave types during onboarding"""
    created = []
    for lt in data.leave_types:
        lt_doc = {
            "name": lt.name,
            "code": lt.code,
            "days_allowed": lt.days_allowed,
            "carry_forward": lt.carry_forward,
            "encashable": lt.encashable,
            "tenant_id": user.get("tenant_id"),
            "created_at": datetime.now(timezone.utc)
        }
        result = await db.leave_types.insert_one(lt_doc)
        created.append(serialize_doc({**lt_doc, "_id": result.inserted_id}))
    
    return {"message": f"Created {len(created)} leave types", "leave_types": created}

@app.post("/api/onboarding/employees")
async def invite_onboarding_employees(
    data: BulkEmployeeInvite, 
    background_tasks: BackgroundTasks,
    user: dict = Depends(get_current_user)
):
    """Invite multiple employees during onboarding and send welcome emails"""
    created = []
    skipped = []
    emails_queued = []
    
    # Get email config
    email_config = await get_email_config(user.get("tenant_id"))
    
    for i, emp in enumerate(data.employees):
        # Check if employee already exists
        existing = await db.employees.find_one({
            "email": emp.email,
            "tenant_id": user.get("tenant_id")
        })
        if existing:
            skipped.append(emp.email)
            continue
        
        # Generate temp password
        temp_password = generate_temp_password()
        
        # Create employee record
        emp_doc = {
            "employee_id": f"EMP{str(i+1).zfill(4)}",
            "full_name": emp.full_name,
            "email": emp.email,
            "department_id": emp.department_id,
            "designation": emp.designation,
            "employment_type": "full-time",
            "status": "active",
            "tenant_id": user.get("tenant_id"),
            "created_at": datetime.now(timezone.utc),
            "created_by": user.get("id"),
            "invited": True
        }
        result = await db.employees.insert_one(emp_doc)
        
        # Create user account for employee
        user_exists = await db.users.find_one({"email": emp.email})
        if not user_exists:
            await db.users.insert_one({
                "email": emp.email,
                "password": pwd_context.hash(temp_password),
                "full_name": emp.full_name,
                "role": "employee",
                "tenant_id": user.get("tenant_id"),
                "created_at": datetime.now(timezone.utc),
                "is_active": True,
                "must_change_password": True
            })
        
        created.append(serialize_doc({**emp_doc, "_id": result.inserted_id}))
        
        # Queue welcome email if config exists
        if email_config:
            background_tasks.add_task(
                send_welcome_email,
                to_email=emp.email,
                employee_name=emp.full_name,
                temp_password=temp_password,
                company_name=email_config.get("company_name", "BambooClone HR"),
                smtp_email=email_config.get("smtp_email"),
                smtp_password=email_config.get("smtp_password"),
                smtp_host=email_config.get("smtp_host", "smtp.gmail.com"),
                smtp_port=email_config.get("smtp_port", 587),
                login_url=email_config.get("login_url", "")
            )
            emails_queued.append(emp.email)
    
    return {
        "message": f"Invited {len(created)} employees",
        "employees": created,
        "skipped": skipped,
        "emails_queued": emails_queued,
        "email_configured": email_config is not None
    }

@app.post("/api/onboarding/complete")
async def complete_onboarding(user: dict = Depends(get_current_user)):
    """Mark onboarding as complete"""
    await db.onboarding.update_one(
        {"user_id": user.get("id")},
        {
            "$set": {
                "user_id": user.get("id"),
                "tenant_id": user.get("tenant_id"),
                "completed": True,
                "completed_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    return {"message": "Onboarding completed", "completed": True}

@app.post("/api/onboarding/skip")
async def skip_onboarding(user: dict = Depends(get_current_user)):
    """Skip onboarding for now"""
    await db.onboarding.update_one(
        {"user_id": user.get("id")},
        {
            "$set": {
                "user_id": user.get("id"),
                "tenant_id": user.get("tenant_id"),
                "completed": True,
                "skipped": True,
                "completed_at": datetime.now(timezone.utc)
            }
        },
        upsert=True
    )
    return {"message": "Onboarding skipped", "completed": True}

# Email Configuration Routes
@app.get("/api/settings/email")
async def get_email_settings(user: dict = Depends(get_current_user)):
    """Get email configuration (password masked)"""
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    config = await get_email_config(user.get("tenant_id"))
    if config:
        return {
            "configured": True,
            "smtp_email": config.get("smtp_email"),
            "smtp_host": config.get("smtp_host", "smtp.gmail.com"),
            "smtp_port": config.get("smtp_port", 587),
            "company_name": config.get("company_name", ""),
            "login_url": config.get("login_url", ""),
            "password_set": bool(config.get("smtp_password"))
        }
    return {"configured": False}

@app.post("/api/settings/email")
async def save_email_settings(config: EmailConfigCreate, user: dict = Depends(get_current_user)):
    """Save email configuration"""
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    config_doc = {
        "smtp_email": config.smtp_email,
        "smtp_password": config.smtp_password,
        "smtp_host": config.smtp_host,
        "smtp_port": config.smtp_port,
        "company_name": config.company_name,
        "tenant_id": user.get("tenant_id"),
        "updated_at": datetime.now(timezone.utc),
        "updated_by": user.get("id")
    }
    
    await db.email_config.update_one(
        {"tenant_id": user.get("tenant_id")},
        {"$set": config_doc},
        upsert=True
    )
    
    return {"message": "Email configuration saved", "configured": True}

@app.put("/api/settings/email")
async def update_email_settings(config: EmailConfigUpdate, user: dict = Depends(get_current_user)):
    """Update email configuration"""
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {"updated_at": datetime.now(timezone.utc), "updated_by": user.get("id")}
    if config.smtp_email:
        update_data["smtp_email"] = config.smtp_email
    if config.smtp_password:
        update_data["smtp_password"] = config.smtp_password
    if config.smtp_host:
        update_data["smtp_host"] = config.smtp_host
    if config.smtp_port:
        update_data["smtp_port"] = config.smtp_port
    if config.company_name is not None:
        update_data["company_name"] = config.company_name
    
    result = await db.email_config.update_one(
        {"tenant_id": user.get("tenant_id")},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Email configuration not found")
    
    return {"message": "Email configuration updated"}

@app.post("/api/settings/email/test")
async def test_email_settings(user: dict = Depends(get_current_user)):
    """Send a test email to verify configuration"""
    if user.get("role") not in ["super_admin", "admin", "hr"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    config = await get_email_config(user.get("tenant_id"))
    if not config:
        raise HTTPException(status_code=400, detail="Email not configured")
    
    try:
        success = send_welcome_email(
            to_email=user.get("email"),
            employee_name=user.get("full_name"),
            temp_password="TEST-PASSWORD-123",
            company_name=config.get("company_name", "BambooClone HR"),
            smtp_email=config.get("smtp_email"),
            smtp_password=config.get("smtp_password"),
            smtp_host=config.get("smtp_host", "smtp.gmail.com"),
            smtp_port=config.get("smtp_port", 587),
            login_url=config.get("login_url", "")
        )
        if success:
            return {"message": "Test email sent successfully", "sent_to": user.get("email")}
        else:
            raise HTTPException(status_code=500, detail="Failed to send test email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Email error: {str(e)}")

@app.delete("/api/settings/email")
async def delete_email_settings(user: dict = Depends(get_current_user)):
    """Delete email configuration"""
    if user.get("role") not in ["super_admin", "admin"]:
        raise HTTPException(status_code=403, detail="Access denied")
    
    result = await db.email_config.delete_one({"tenant_id": user.get("tenant_id")})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Email configuration not found")
    
    return {"message": "Email configuration deleted"}

# Seed initial super admin
@app.on_event("startup")
async def seed_data():
    admin = await db.users.find_one({"email": "admin@bambooclone.com"})
    if not admin:
        await db.users.insert_one({
            "email": "admin@bambooclone.com",
            "password": pwd_context.hash("admin123"),
            "full_name": "Super Admin",
            "role": "super_admin",
            "tenant_id": None,
            "created_at": datetime.now(timezone.utc),
            "is_active": True
        })
        print("Seeded super admin: admin@bambooclone.com / admin123")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
