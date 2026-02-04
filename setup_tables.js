import mongoose from 'mongoose';
import { TableModel, BranchModel } from './shared/schema';

async function setup() {
  await mongoose.connect(process.env.MONGODB_URI);
  const branchId = "main-branch";
  const tables = await TableModel.find({ branchId });
  if (tables.length === 0) {
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
  }
  await mongoose.disconnect();
}
setup().catch(console.error);
