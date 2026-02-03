#!/usr/bin/env python3
"""
اختبار شامل لنظام BLACK ROSE
يختبر جميع الميزات والصفحات والـ APIs
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:5000"
ISSUES = []
PASSED = []

def log_issue(category, severity, description):
    """تسجيل مشكلة"""
    ISSUES.append({
        "category": category,
        "severity": severity,
        "description": description,
        "timestamp": datetime.now().isoformat()
    })
    print(f"❌ [{severity}] {category}: {description}")

def log_pass(test_name):
    """تسجيل نجاح"""
    PASSED.append(test_name)
    print(f"✅ {test_name}")

def test_api_endpoint(endpoint, test_name, expected_status=200):
    """اختبار endpoint"""
    try:
        response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
        if response.status_code == expected_status:
            log_pass(test_name)
            return response.json() if response.content else None
        else:
            log_issue("API", "HIGH", f"{test_name} - Expected {expected_status}, got {response.status_code}")
            return None
    except Exception as e:
        log_issue("API", "CRITICAL", f"{test_name} - {str(e)}")
        return None

def test_payment_methods():
    """اختبار طرق الدفع"""
    print("\n🔍 اختبار طرق الدفع...")
    data = test_api_endpoint("/api/payment-methods", "Payment Methods API")
    
    if data:
        required_methods = ['cash', 'network', 'qahwa-card', 'newleap']
        found_methods = [m['id'] for m in data]
        
        for method in required_methods:
            if method in found_methods:
                log_pass(f"طريقة الدفع '{method}' متوفرة")
            else:
                log_issue("Payment", "HIGH", f"طريقة الدفع '{method}' مفقودة")

def test_coffee_items():
    """اختبار المنتجات"""
    print("\n🔍 اختبار منتجات القهوة...")
    data = test_api_endpoint("/api/coffee-items", "Coffee Items API")
    
    if data:
        if len(data) > 0:
            log_pass(f"تم تحميل {len(data)} منتج")
            
            # فحص بنية المنتج الأول
            first_item = data[0]
            required_fields = ['id', 'nameAr', 'price', 'category']
            for field in required_fields:
                if field in first_item:
                    log_pass(f"حقل '{field}' موجود في المنتج")
                else:
                    log_issue("Data", "MEDIUM", f"حقل '{field}' مفقود في المنتج")
        else:
            log_issue("Data", "HIGH", "لا توجد منتجات في القاعدة")

def test_categories():
    """اختبار الفئات"""
    print("\n🔍 اختبار الفئات...")
    data = test_api_endpoint("/api/categories", "Categories API")
    
    if data and len(data) > 0:
        log_pass(f"تم تحميل {len(data)} فئة")
    else:
        log_issue("Data", "MEDIUM", "لا توجد فئات في القاعدة")

def test_tables():
    """اختبار الطاولات"""
    print("\n🔍 اختبار الطاولات...")
    data = test_api_endpoint("/api/tables", "Tables API")
    
    if data:
        if len(data) > 0:
            log_pass(f"تم تحميل {len(data)} طاولة")
            
            # فحص qrToken
            if data[0].get('qrToken'):
                log_pass("رمز QR موجود للطاولات")
            else:
                log_issue("Tables", "MEDIUM", "رمز QR مفقود للطاولات")
        else:
            log_issue("Data", "LOW", "لا توجد طاولات في القاعدة")

def test_loyalty_system():
    """اختبار نظام الولاء"""
    print("\n🔍 اختبار نظام الولاء...")
    
    # اختبار loyalty rewards
    data = test_api_endpoint("/api/loyalty/rewards", "Loyalty Rewards API")
    if data:
        log_pass("نظام الولاء والمكافآت يعمل")

def test_branches():
    """اختبار الفروع"""
    print("\n🔍 اختبار الفروع...")
    
    # جلب الفروع (يتطلب authentication)
    try:
        response = requests.get(f"{BASE_URL}/api/branches", timeout=5)
        if response.status_code == 401:
            log_pass("حماية API الفروع (يتطلب authentication)")
        elif response.status_code == 200:
            data = response.json()
            if len(data) <= 1:
                log_pass("تقييد الفرع الواحد يعمل بشكل صحيح")
            else:
                log_issue("Business Logic", "HIGH", f"يوجد {len(data)} فرع - يجب أن يكون واحد فقط")
        else:
            log_issue("API", "MEDIUM", f"Branches API - Unexpected status {response.status_code}")
    except Exception as e:
        log_issue("API", "MEDIUM", f"Branches API - {str(e)}")

def test_order_creation():
    """اختبار إنشاء طلب (simulation)"""
    print("\n🔍 اختبار منطق الطلبات...")
    
    # اختبار structure فقط (بدون authentication)
    try:
        response = requests.post(
            f"{BASE_URL}/api/orders",
            json={
                "items": [{"id": "coffee-001", "quantity": 2}],
                "totalAmount": 30,
                "paymentMethod": "cash"
            },
            timeout=5
        )
        
        if response.status_code == 401:
            log_pass("حماية API الطلبات (يتطلب authentication)")
        elif response.status_code in [200, 201]:
            log_pass("API إنشاء الطلبات يعمل")
        else:
            log_issue("API", "MEDIUM", f"Orders API - Status {response.status_code}")
    except Exception as e:
        log_issue("API", "LOW", f"Orders API test - {str(e)}")

def test_homepage():
    """اختبار الصفحة الرئيسية"""
    print("\n🔍 اختبار الصفحة الرئيسية...")
    
    try:
        response = requests.get(BASE_URL, timeout=10)
        if response.status_code == 200:
            log_pass("الصفحة الرئيسية تعمل")
            
            # فحص المحتوى
            content = response.text
            if 'CLUNY' in content or 'cluny' in content.lower():
                log_pass("علامة CLUNY موجودة")
            else:
                log_issue("Frontend", "LOW", "علامة CLUNY غير واضحة في الصفحة")
                
            if 'script' in content.lower():
                log_pass("JavaScript محمّل")
            else:
                log_issue("Frontend", "HIGH", "JavaScript غير محمّل بشكل صحيح")
        else:
            log_issue("Frontend", "CRITICAL", f"الصفحة الرئيسية لا تعمل - Status {response.status_code}")
    except Exception as e:
        log_issue("Frontend", "CRITICAL", f"الصفحة الرئيسية - {str(e)}")

def generate_report():
    """إنشاء تقرير شامل"""
    print("\n" + "="*60)
    print("📊 تقرير الاختبار الشامل")
    print("="*60)
    
    total_tests = len(PASSED) + len(ISSUES)
    pass_rate = (len(PASSED) / total_tests * 100) if total_tests > 0 else 0
    
    print(f"\n✅ اختبارات ناجحة: {len(PASSED)}")
    print(f"❌ مشاكل مكتشفة: {len(ISSUES)}")
    print(f"📈 نسبة النجاح: {pass_rate:.1f}%")
    
    if ISSUES:
        print("\n🔴 المشاكل حسب الخطورة:")
        
        critical = [i for i in ISSUES if i['severity'] == 'CRITICAL']
        high = [i for i in ISSUES if i['severity'] == 'HIGH']
        medium = [i for i in ISSUES if i['severity'] == 'MEDIUM']
        low = [i for i in ISSUES if i['severity'] == 'LOW']
        
        if critical:
            print(f"\n  🔴 CRITICAL ({len(critical)}):")
            for issue in critical:
                print(f"    - {issue['description']}")
        
        if high:
            print(f"\n  🟠 HIGH ({len(high)}):")
            for issue in high:
                print(f"    - {issue['description']}")
        
        if medium:
            print(f"\n  🟡 MEDIUM ({len(medium)}):")
            for issue in medium:
                print(f"    - {issue['description']}")
        
        if low:
            print(f"\n  🟢 LOW ({len(low)}):")
            for issue in low:
                print(f"    - {issue['description']}")
    
    # حفظ التقرير
    report = {
        "timestamp": datetime.now().isoformat(),
        "summary": {
            "total_tests": total_tests,
            "passed": len(PASSED),
            "failed": len(ISSUES),
            "pass_rate": pass_rate
        },
        "passed_tests": PASSED,
        "issues": ISSUES
    }
    
    with open('/app/test_reports/comprehensive_test.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n💾 التقرير محفوظ في: /app/test_reports/comprehensive_test.json")
    print("="*60)

def main():
    """تشغيل جميع الاختبارات"""
    print("🚀 بدء الاختبار الشامل لنظام BLACK ROSE")
    print("="*60)
    
    # اختبار الواجهة الأمامية
    test_homepage()
    
    # اختبار APIs
    test_payment_methods()
    test_coffee_items()
    test_categories()
    test_tables()
    test_loyalty_system()
    test_branches()
    test_order_creation()
    
    # إنشاء التقرير
    generate_report()

if __name__ == "__main__":
    main()
