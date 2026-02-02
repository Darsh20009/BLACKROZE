#!/usr/bin/env python3
"""
CLUNY CAFE System Backend API Testing
Testing all 12 features mentioned in the review request
"""

import requests
import json
import sys
from datetime import datetime
import time

class ClunyBackendTester:
    def __init__(self, base_url="http://localhost:5000"):
        self.base_url = base_url
        self.session = requests.Session()
        self.employee_token = None
        self.customer_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []
        
    def log(self, message):
        print(f"[{datetime.now().strftime('%H:%M:%S')}] {message}")
        
    def run_test(self, name, method, endpoint, expected_status=200, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)
            
        self.tests_run += 1
        self.log(f"🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = self.session.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = self.session.delete(url, headers=test_headers)
            else:
                raise ValueError(f"Unsupported method: {method}")

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}")
                self.passed_tests.append(name)
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json() if response.content else {"error": "No response body"}
                except:
                    error_data = {"error": f"Status {response.status_code}"}
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "error": error_data
                })
                return False, error_data

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {"error": str(e)}

    def test_health_check(self):
        """Test basic health endpoints"""
        self.log("🏥 Testing Health Endpoints...")
        self.run_test("Health Check", "GET", "/health")
        self.run_test("Health Check Z", "GET", "/healthz")
        
    def test_employee_auth(self):
        """Test employee authentication"""
        self.log("👨‍💼 Testing Employee Authentication...")
        
        # Try to login with default credentials
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        success, response = self.run_test("Employee Login", "POST", "/api/employees/login", 200, login_data)
        
        if not success:
            # Try alternative credentials
            login_data = {
                "username": "manager",
                "password": "manager123"
            }
            success, response = self.run_test("Employee Login Alt", "POST", "/api/employees/login", 200, login_data)
            
        if success and 'id' in response:
            self.log("✅ Employee authentication successful")
            return True
        else:
            self.log("❌ Employee authentication failed")
            return False
            
    def test_payment_methods(self):
        """Test Feature 3: Payment Methods API"""
        self.log("💳 Testing Payment Methods...")
        success, response = self.run_test("Get Payment Methods", "GET", "/api/payment-methods")
        
        if success and isinstance(response, list):
            expected_methods = ['cash', 'neoleap', 'neoleap-apple-pay', 'loyalty-card']
            found_methods = [method.get('id') for method in response if 'id' in method]
            
            for method in expected_methods:
                if method in found_methods:
                    self.log(f"✅ Payment method '{method}' found")
                else:
                    self.log(f"❌ Payment method '{method}' missing")
                    
        return success
        
    def test_kitchen_departments(self):
        """Test Feature 10: Kitchen Departments APIs"""
        self.log("🍳 Testing Kitchen Departments...")
        
        # Test GET kitchen departments
        success, response = self.run_test("Get Kitchen Departments", "GET", "/api/kitchen-departments")
        
        # Test POST kitchen department (might fail due to auth)
        kitchen_data = {
            "nameAr": "مطبخ القهوة",
            "nameEn": "Coffee Kitchen", 
            "type": "drinks",
            "description": "مطبخ تحضير المشروبات"
        }
        self.run_test("Create Kitchen Department", "POST", "/api/kitchen-departments", 
                     expected_status=401, data=kitchen_data)  # Expect 401 without auth
        
        return success
        
    def test_categories(self):
        """Test categories API"""
        self.log("📂 Testing Categories...")
        return self.run_test("Get Categories", "GET", "/api/categories")[0]
        
    def test_coffee_items(self):
        """Test coffee items API"""
        self.log("☕ Testing Coffee Items...")
        return self.run_test("Get Coffee Items", "GET", "/api/coffee-items")[0]
        
    def test_loyalty_system(self):
        """Test Feature 1: Loyalty System APIs"""
        self.log("🎁 Testing Loyalty System...")
        
        # Test loyalty cards endpoint
        success1, _ = self.run_test("Get Loyalty Cards", "GET", "/api/loyalty/cards", expected_status=401)
        
        # Test loyalty rewards
        success2, _ = self.run_test("Get Loyalty Rewards", "GET", "/api/loyalty/rewards")
        
        return success1 or success2  # At least one should work
        
    def test_orders_system(self):
        """Test orders system"""
        self.log("📋 Testing Orders System...")
        
        # Test orders endpoint (should require auth)
        success, _ = self.run_test("Get Orders", "GET", "/api/orders", expected_status=401)
        return success
        
    def test_tables_system(self):
        """Test tables system for Feature 6: Table Barcodes"""
        self.log("🪑 Testing Tables System...")
        
        # Test tables endpoint (should require auth)
        success, _ = self.run_test("Get Tables", "GET", "/api/tables", expected_status=401)
        return success
        
    def test_pos_system(self):
        """Test POS system endpoints"""
        self.log("🏪 Testing POS System...")
        
        # Test POS hardware status
        success1, _ = self.run_test("POS Hardware Status", "GET", "/api/pos/hardware-status", expected_status=401)
        
        # Test POS toggle
        success2, _ = self.run_test("POS Toggle", "POST", "/api/pos/toggle", expected_status=401)
        
        return success1 or success2
        
    def test_inventory_system(self):
        """Test inventory system"""
        self.log("📦 Testing Inventory System...")
        
        # Test ingredients
        success1, _ = self.run_test("Get Ingredients", "GET", "/api/ingredients", expected_status=401)
        
        # Test inventory movements
        success2, _ = self.run_test("Get Inventory Movements", "GET", "/api/inventory/movements", expected_status=401)
        
        return success1 or success2
        
    def test_websocket_support(self):
        """Test WebSocket support (Feature 11)"""
        self.log("🔌 Testing WebSocket Support...")
        
        # We can't easily test WebSocket in this script, but we can check if the endpoint exists
        # This is a placeholder - in a real test we'd use websocket-client library
        self.log("ℹ️  WebSocket testing requires separate client - marking as manual test needed")
        return True
        
    def test_accounting_system(self):
        """Test accounting system (Feature 12)"""
        self.log("💰 Testing Accounting System...")
        
        # Test reports endpoint
        success, _ = self.run_test("Get Sales Reports", "GET", "/api/reports/sales", expected_status=401)
        return success
        
    def run_all_tests(self):
        """Run all backend tests"""
        self.log("🚀 Starting CLUNY CAFE Backend API Tests...")
        self.log(f"🎯 Target URL: {self.base_url}")
        
        # Basic connectivity
        self.test_health_check()
        
        # Authentication
        auth_success = self.test_employee_auth()
        
        # Core Features Testing
        self.test_payment_methods()          # Feature 3
        self.test_kitchen_departments()      # Feature 10 
        self.test_categories()
        self.test_coffee_items()
        self.test_loyalty_system()           # Feature 1
        self.test_orders_system()            # Feature 7
        self.test_tables_system()            # Feature 6
        self.test_pos_system()               # Feature 4
        self.test_inventory_system()         # Feature 12
        self.test_websocket_support()        # Feature 11
        self.test_accounting_system()        # Feature 12
        
        # Summary
        self.log("\n" + "="*60)
        self.log("📊 TEST SUMMARY")
        self.log("="*60)
        self.log(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        self.log(f"❌ Tests Failed: {len(self.failed_tests)}")
        
        if self.passed_tests:
            self.log("\n🎉 PASSED TESTS:")
            for test in self.passed_tests:
                self.log(f"  ✅ {test}")
                
        if self.failed_tests:
            self.log("\n💥 FAILED TESTS:")
            for failure in self.failed_tests:
                self.log(f"  ❌ {failure['test']}: {failure.get('error', 'Unknown error')}")
                
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 70:
            self.log("🎯 Backend API testing completed with acceptable results")
            return 0
        else:
            self.log("⚠️  Backend API testing completed with issues that need attention")
            return 1

def main():
    # Try different possible URLs
    possible_urls = [
        "http://localhost:5000",
        "http://127.0.0.1:5000", 
        "http://0.0.0.0:5000"
    ]
    
    tester = None
    for url in possible_urls:
        try:
            # Quick connectivity test
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ Backend found at {url}")
                tester = ClunyBackendTester(url)
                break
        except:
            continue
            
    if not tester:
        print("❌ Could not connect to backend server")
        print("💡 Make sure the backend is running on port 5000")
        return 1
        
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())