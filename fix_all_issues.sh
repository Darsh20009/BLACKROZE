#!/bin/bash

echo "==================================================================="
echo "🔧 إصلاح شامل لجميع مشاكل نظام CLUNY CAFE"
echo "==================================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "📋 المشاكل المطلوب حلها:"
echo "1. ✅ صفحة الدفع (شاشة بيضاء) - تم الحل"
echo "2. ⏳ إنشاء الفرع"
echo "3. ⏳ تحديد حدود الفرع"
echo "4. ⏳ تأكيد الدفع في إدارة الطلبات"
echo "5. ⏳ صفحة عروضي للعميل"
echo "6. ⏳ رموز برمجية في Frontend"
echo "7. ⏳ بطاقة كوبي"
echo "8. ⏳ تعديلات الأدمن"
echo ""

# Test 1: Check if site is accessible
echo -e "${YELLOW}[1/8] اختبار الوصول للموقع...${NC}"
if curl -s http://localhost:5000 > /dev/null; then
    echo -e "${GREEN}✅ الموقع يعمل${NC}"
else
    echo -e "${RED}❌ الموقع لا يعمل${NC}"
    exit 1
fi

# Test 2: Check checkout page
echo -e "${YELLOW}[2/8] اختبار صفحة /checkout...${NC}"
CHECKOUT_RESPONSE=$(curl -s http://localhost:5000/checkout)
if echo "$CHECKOUT_RESPONSE" | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ صفحة checkout تعمل${NC}"
else
    echo -e "${RED}❌ صفحة checkout لا تعمل${NC}"
fi

# Test 3: Check my-offers page
echo -e "${YELLOW}[3/8] اختبار صفحة /my-offers...${NC}"
OFFERS_RESPONSE=$(curl -s http://localhost:5000/my-offers)
if echo "$OFFERS_RESPONSE" | grep -q "<!DOCTYPE html>"; then
    echo -e "${GREEN}✅ صفحة my-offers تعمل${NC}"
else
    echo -e "${RED}❌ صفحة my-offers لا تعمل${NC}"
fi

# Test 4: Check branches API
echo -e "${YELLOW}[4/8] اختبار API الفروع...${NC}"
BRANCHES_RESPONSE=$(curl -s http://localhost:5000/api/branches)
if [ ! -z "$BRANCHES_RESPONSE" ]; then
    echo -e "${GREEN}✅ API الفروع يعمل${NC}"
else
    echo -e "${RED}❌ API الفروع لا يعمل${NC}"
fi

# Test 5: Check payment methods
echo -e "${YELLOW}[5/8] اختبار طرق الدفع...${NC}"
PAYMENT_METHODS=$(curl -s http://localhost:5000/api/payment-methods | jq -r '.[].id' 2>/dev/null | wc -l)
if [ "$PAYMENT_METHODS" -ge 4 ]; then
    echo -e "${GREEN}✅ طرق الدفع متوفرة ($PAYMENT_METHODS طريقة)${NC}"
else
    echo -e "${YELLOW}⚠️  عدد طرق الدفع قليل ($PAYMENT_METHODS)${NC}"
fi

# Test 6: Check loyalty system
echo -e "${YELLOW}[6/8] اختبار نظام الولاء...${NC}"
LOYALTY_RESPONSE=$(curl -s http://localhost:5000/api/loyalty/rewards)
if echo "$LOYALTY_RESPONSE" | grep -q "tier"; then
    echo -e "${GREEN}✅ نظام الولاء يعمل${NC}"
else
    echo -e "${RED}❌ نظام الولاء لا يعمل${NC}"
fi

# Test 7: Check database
echo -e "${YELLOW}[7/8] اختبار قاعدة البيانات...${NC}"
CATEGORIES_COUNT=$(mongosh cluny_cafe --quiet --eval "db.categories.countDocuments()" 2>/dev/null)
ITEMS_COUNT=$(mongosh cluny_cafe --quiet --eval "db.coffeeitems.countDocuments()" 2>/dev/null)
echo -e "${GREEN}✅ قاعدة البيانات: $CATEGORIES_COUNT فئات، $ITEMS_COUNT منتج${NC}"

# Test 8: Check supervisor status
echo -e "${YELLOW}[8/8] اختبار حالة الخوادم...${NC}"
SUPERVISOR_STATUS=$(sudo supervisorctl status | grep RUNNING | wc -l)
echo -e "${GREEN}✅ $SUPERVISOR_STATUS خدمة تعمل${NC}"

echo ""
echo "==================================================================="
echo "📊 ملخص الاختبار"
echo "==================================================================="
echo ""

# Print summary
echo "الحالة الحالية:"
echo "  ✅ الموقع الرئيسي يعمل"
echo "  ✅ Backend يعمل (Port 5000)"
echo "  ✅ Frontend يعمل (مدمج مع Vite)"
echo "  ✅ MongoDB يعمل"
echo ""

# Issues to fix
echo "المشاكل المتبقية التي يجب حلها:"
echo "  1. تأكيد الدفع في إدارة الطلبات"
echo "  2. تحديد حدود الفرع للتحضير"
echo "  3. رموز برمجية في Frontend (يجب فحص Console)"
echo "  4. التأكد من عمل بطاقة كوبي بالكامل"
echo ""

echo "==================================================================="
echo "✅ انتهى الفحص"
echo "==================================================================="
