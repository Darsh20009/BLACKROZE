import { OrderModel, BranchModel, TableModel } from "./shared/schema";
import mongoose from "mongoose";

async function clearData() {
  await mongoose.connect(process.env.MONGODB_URI!);
  
  // Remove all orders
  await OrderModel.deleteMany({});
  console.log("Cleared all orders");

  // Ensure only one branch exists
  await BranchModel.deleteMany({ id: { $ne: "main-branch" } });
  const mainBranch = await BranchModel.findOne({ id: "main-branch" });
  if (!mainBranch) {
    await BranchModel.create({
      id: "main-branch",
      tenantId: "black-rose-tenant",
      cafeId: "black-rose-cafe",
      nameAr: "فرع بلاك روز الرئيسي",
      address: "الرياض",
      phone: "0500000000",
      workingHours: { open: "08:00", close: "23:00" },
      isMainBranch: true,
      isActive: true
    });
    console.log("Created main branch");
  }

  // Ensure 10 tables exist for main branch
  await TableModel.deleteMany({ branchId: "main-branch" });
  for (let i = 1; i <= 10; i++) {
    await TableModel.create({
      id: `table-${i}`,
      branchId: "main-branch",
      number: i.toString(),
      capacity: 4,
      status: "available",
      isActive: true
    });
  }
  console.log("Created 10 tables for main branch");
  
  await mongoose.disconnect();
}

clearData().catch(console.error);
