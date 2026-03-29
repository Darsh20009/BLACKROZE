import { storage } from "./storage";
import { TenantModel } from "@shared/tenant-schema";
import { EmployeeModel, MenuCategoryModel } from "@shared/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

const SYSTEM_CATEGORIES = [
  // Drink categories
  { id: "sys-hot",               nameAr: "قهوة ساخنة",      nameEn: "Hot Coffee",         department: "drinks", icon: "Flame",     orderIndex: 1  },
  { id: "sys-cold",              nameAr: "قهوة باردة",       nameEn: "Iced Coffee",         department: "drinks", icon: "Snowflake", orderIndex: 2  },
  { id: "sys-specialty",        nameAr: "مشروبات مميزة",    nameEn: "Specialty Drinks",    department: "drinks", icon: "Star",      orderIndex: 3  },
  { id: "sys-basic",            nameAr: "قهوة كلاسيك",      nameEn: "Classic Coffee",      department: "drinks", icon: "Coffee",    orderIndex: 4  },
  { id: "sys-drinks",           nameAr: "المشروبات",         nameEn: "Drinks",              department: "drinks", icon: "Coffee",    orderIndex: 5  },
  { id: "sys-additional",       nameAr: "مشروبات إضافية",   nameEn: "Additional Drinks",   department: "drinks", icon: "Coffee",    orderIndex: 6  },
  { id: "sys-desserts-drinks",  nameAr: "حلويات",            nameEn: "Desserts",            department: "drinks", icon: "Cake",      orderIndex: 7  },
  // Food categories
  { id: "sys-food",             nameAr: "المأكولات",         nameEn: "Food",                department: "food",   icon: "Utensils",  orderIndex: 10 },
  { id: "sys-sandwiches",       nameAr: "السندوتشات",        nameEn: "Sandwiches",          department: "food",   icon: "Utensils",  orderIndex: 11 },
  { id: "sys-bakery",           nameAr: "المخبوزات",          nameEn: "Bakery",              department: "food",   icon: "Cake",      orderIndex: 12 },
  { id: "sys-croissant",        nameAr: "الكرواسون",          nameEn: "Croissant",           department: "food",   icon: "Cake",      orderIndex: 13 },
  { id: "sys-cake",             nameAr: "الكيك",              nameEn: "Cake",                department: "food",   icon: "Cake",      orderIndex: 14 },
  { id: "sys-desserts-food",    nameAr: "الحلويات والتحلية", nameEn: "Sweets & Desserts",   department: "food",   icon: "Star",      orderIndex: 15 },
];

export async function runSeeds() {
  console.log("🌱 Starting clean re-initialization...");

  try {
    // 1. Create Default Tenant
    let demoTenant = await TenantModel.findOne({ id: "demo-tenant" });
    if (!demoTenant) {
      demoTenant = await TenantModel.create({
        id: "demo-tenant",
        nameAr: "المنشأة الأساسية",
        nameEn: "Main Tenant",
        type: "client",
        status: "active",
        subscription: {
          plan: "professional",
          status: "active",
          startDate: new Date(),
          features: ["all"]
        }
      });
      console.log("✅ Created clean tenant: demo-tenant");
    }

    // 2. Create or repair Super Admin Employee
    const adminPhone = "0500000000";
    const rawAdmin = await EmployeeModel.findOne({ username: "admin" }).lean();

    if (!rawAdmin) {
      // Admin doesn't exist at all — create fresh
      const hashedPassword = await bcrypt.hash("admin", 10);
      await EmployeeModel.create({
        id: nanoid(12),
        username: "admin",
        fullName: "مدير النظام",
        role: "admin",
        phone: adminPhone,
        jobTitle: "Super Admin",
        password: hashedPassword,
        isActivated: 1,
        tenantId: "demo-tenant"
      });
      console.log("✅ Created Super Admin: admin / admin");
    } else {
      // Admin exists — ensure id field is present and password is correct
      const updates: Record<string, any> = {};

      if (!rawAdmin.id) {
        updates.id = (rawAdmin._id as any).toString();
        console.log("✅ Fixed missing id field on admin account");
      }

      // If phone doesn't match our seed phone, this admin was created externally
      // with an unknown password — reset it to default "admin"
      if (!rawAdmin.phone || rawAdmin.phone !== adminPhone) {
        updates.password = await bcrypt.hash("admin", 10);
        updates.phone = adminPhone;
        console.log("✅ Reset admin password to default: admin / admin");
      } else if (rawAdmin.password && !rawAdmin.password.startsWith("$2")) {
        // Password is plain text — re-hash it
        updates.password = await bcrypt.hash(rawAdmin.password, 10);
        console.log("✅ Fixed admin password: converted plain text to bcrypt hash");
      }

      if (Object.keys(updates).length > 0) {
        await EmployeeModel.updateOne({ username: "admin" }, { $set: updates });
      }
    }

    // 3. Seed system menu categories (idempotent — uses upsert)
    const tenantId = "demo-tenant";
    let seededCount = 0;
    for (const cat of SYSTEM_CATEGORIES) {
      const existing = await MenuCategoryModel.findOne({ id: cat.id });
      if (!existing) {
        await MenuCategoryModel.create({
          ...cat,
          tenantId,
          isSystem: true,
          isActive: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        seededCount++;
      } else {
        // Ensure isSystem flag is always set
        await MenuCategoryModel.updateOne({ id: cat.id }, { $set: { isSystem: true, tenantId } });
      }
    }
    if (seededCount > 0) {
      console.log(`✅ Seeded ${seededCount} system menu categories`);
    } else {
      console.log("✅ System menu categories already present");
    }

    console.log("✅ System re-initialized successfully with clean state.");
  } catch (error) {
    console.error("❌ Error during re-initialization:", error);
  }
}

