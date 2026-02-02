#!/usr/bin/env python3
"""
اختبار إضافة موظف جديد
"""

import requests
import json

BASE_URL = "http://localhost:5000"

# أولاً: تسجيل دخول كمدير
def login_as_manager():
    """تسجيل دخول كمدير"""
    # استخدم بيانات الأدمن من قاعدة البيانات
    response = requests.post(
        f"{BASE_URL}/api/employee/login",
        json={
            "username": "admin",
            "password": "admin123"  # يجب تغييرها للبيانات الحقيقية
        }
    )
    
    print(f"Login Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ تم تسجيل الدخول بنجاح")
        print(f"Token: {data.get('token', 'N/A')[:20]}...")
        return data.get('token')
    else:
        print(f"❌ فشل تسجيل الدخول: {response.text}")
        return None

# ثانياً: إضافة موظف جديد
def add_employee(token):
    """إضافة موظف جديد"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    employee_data = {
        "username": "test_employee_001",
        "fullName": "موظف تجريبي",
        "phone": "0501234567",
        "jobTitle": "كاشير",
        "role": "cashier",
        "permissions": ["create_order"],
        "allowedPages": ["/employee/pos", "/employee/orders"],
        "deviceBalance": 0,
        "commissionPercentage": 5
    }
    
    print("\n📤 جاري إضافة موظف...")
    print(f"البيانات: {json.dumps(employee_data, ensure_ascii=False, indent=2)}")
    
    response = requests.post(
        f"{BASE_URL}/api/employees",
        headers=headers,
        json=employee_data
    )
    
    print(f"\nالاستجابة Status: {response.status_code}")
    
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"✅ تم إضافة الموظف بنجاح!")
        print(f"ID: {data.get('id', 'N/A')}")
        print(f"Username: {data.get('username', 'N/A')}")
        print(f"Role: {data.get('role', 'N/A')}")
        return True
    else:
        print(f"❌ فشل إضافة الموظف")
        print(f"الخطأ: {response.text}")
        return False

# ثالثاً: الحصول على قائمة الموظفين
def get_employees(token):
    """الحصول على قائمة الموظفين"""
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    print("\n📋 جاري جلب قائمة الموظفين...")
    
    response = requests.get(
        f"{BASE_URL}/api/employees",
        headers=headers
    )
    
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        employees = response.json()
        print(f"✅ تم جلب {len(employees)} موظف")
        for emp in employees:
            print(f"  - {emp.get('fullName', 'N/A')} ({emp.get('role', 'N/A')})")
        return True
    else:
        print(f"❌ فشل جلب الموظفين: {response.text}")
        return False

def main():
    print("="*60)
    print("🧪 اختبار نظام إضافة الموظفين")
    print("="*60)
    
    # 1. تسجيل الدخول
    token = login_as_manager()
    
    if not token:
        print("\n❌ لم نتمكن من الحصول على token")
        print("💡 تأكد من وجود مدير في قاعدة البيانات")
        return
    
    # 2. إضافة موظف
    success = add_employee(token)
    
    if success:
        # 3. جلب قائمة الموظفين
        get_employees(token)
    
    print("\n" + "="*60)
    print("✅ انتهى الاختبار")
    print("="*60)

if __name__ == "__main__":
    main()
