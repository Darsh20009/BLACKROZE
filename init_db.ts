import mongoose from 'mongoose';
import { TableModel, BranchModel, OrderModel } from './shared/schema';

async function init() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI not set");
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Clear old data
  await OrderModel.deleteMany({});
  console.log("Cleared orders");

  // Setup single branch
  const branchId = "main-branch";
  await BranchModel.updateOne(
    { id: branchId },
    { 
      id: branchId,
      tenantId: "black-rose-tenant",
      nameAr: "فرع بلاك روز الرئيسي",
      isActive: true,
      isMainBranch: true 
    },
    { upsert: true }
  );
  console.log("Setup main branch");

  // Setup 10 tables
  await TableModel.deleteMany({ branchId });
  for (let i = 1; i <= 10; i++) {
    await TableModel.create({
      id: `table-${branchId}-${i}`,
      branchId,
      number: i.toString(),
      capacity: 4,
      status: "available",
      isActive: true
    });
  }
  console.log("Created 10 tables");
  
  await mongoose.disconnect();
}
init().catch(console.error);
