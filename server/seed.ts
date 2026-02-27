import { storage } from "./storage";
import { TenantModel } from "@shared/tenant-schema";
import { EmployeeModel } from "@shared/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

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

    console.log("✅ System re-initialized successfully with clean state.");
  } catch (error) {
    console.error("❌ Error during re-initialization:", error);
  }
}

