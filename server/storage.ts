import {
  type CoffeeItem,
  type InsertCoffeeItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem,
  type User,
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Employee,
  type InsertEmployee,
  type DiscountCode,
  type InsertDiscountCode,
  type LoyaltyCard,
  type InsertLoyaltyCard,
  type CardCode,
  type InsertCardCode,
  type LoyaltyTransaction,
  type InsertLoyaltyTransaction,
  type LoyaltyReward,
  type InsertLoyaltyReward,
  type Ingredient,
  type InsertIngredient,
  type CoffeeItemIngredient,
  type InsertCoffeeItemIngredient,
  type PasswordResetToken,
  type InsertPasswordResetToken,
  type ICafe,
  type IBranch,
  type IBusinessConfig,
  type IIngredientItem,
  type IRecipeDefinition,
  type RawItem,
  type InsertRawItem,
  type Supplier,
  type InsertSupplier,
  type BranchStock,
  type StockTransfer,
  type InsertStockTransfer,
  type PurchaseInvoice,
  type InsertPurchaseInvoice,
  type RecipeItem,
  type InsertRecipeItem,
  type StockAlert,
  type StockMovement,
  type InsertStockMovement,
  type Branch,
  type InsertBranch,
  type Category,
  type InsertCategory,
  type DeliveryZone,
  type InsertDeliveryZone,
  type Table,
  type InsertTable,
  type IProductAddon,
  CafeModel,
  BranchModel,
  BusinessConfigModel,
  IngredientItemModel,
  RecipeDefinitionModel,
  CoffeeItemModel,
  CustomerModel,
  EmployeeModel,
  DiscountCodeModel,
  OrderModel,
  OrderItemModel,
  CartItemModel,
  UserModel,
  LoyaltyCardModel,
  CardCodeModel,
  LoyaltyTransactionModel,
  LoyaltyRewardModel,
  IngredientModel,
  CoffeeItemIngredientModel,
  PasswordResetTokenModel,
  PasswordSetupOTPModel,
  CategoryModel,
  DeliveryZoneModel,
  TableModel,
  TaxInvoiceModel,
  RawItemModel,
  SupplierModel,
  BranchStockModel,
  StockTransferModel,
  PurchaseInvoiceModel,
  RecipeItemModel,
  StockAlertModel,
  StockMovementModel,
  ProductReviewModel,
  ReferralModel,
  NotificationModel,
  WarehouseModel,
  WarehouseStockModel,
  WarehouseTransferModel,
  DeliveryIntegrationModel,
  ProductAddonModel,
  CoffeeItemAddonModel,
  StatusHistoryModel,
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

export interface IStorage {
  // Business Config
  getBusinessConfig(tenantId: string): Promise<IBusinessConfig | undefined>;
  updateBusinessConfig(tenantId: string, updates: Partial<IBusinessConfig>): Promise<IBusinessConfig>;
  
  // Ingredient Items
  getIngredientItems(tenantId: string): Promise<IIngredientItem[]>;
  createIngredientItem(item: Partial<IIngredientItem>): Promise<IIngredientItem>;
  updateIngredientItem(id: string, updates: Partial<IIngredientItem>): Promise<IIngredientItem | undefined>;
  
  // Recipes
  getRecipeDefinition(tenantId: string, productId: string): Promise<IRecipeDefinition | undefined>;
  createRecipeDefinition(recipe: Partial<IRecipeDefinition>): Promise<IRecipeDefinition>;
  updateRecipeDefinition(id: string, updates: Partial<IRecipeDefinition>): Promise<IRecipeDefinition | undefined>;

  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getLoyaltyCardsByCustomerId(customerId: string): Promise<LoyaltyCard[]>;
  setActiveCard(customerId: string, cardId: string): Promise<boolean>;

  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  incrementDiscountCodeUsage(code: string): Promise<void>;
  updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined>;

  getCustomers(): Promise<Customer[]>;
  getOrdersByEmployee(employeeId: string): Promise<Order[]>;
  getAllBranches(): Promise<IBranch[]>;

  getCategories(tenantId?: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  getTables(branchId?: string): Promise<Table[]>;
  getTable(id: string): Promise<Table | undefined>;
  getTableByQRToken(qrToken: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined>;
  deleteTable(id: string): Promise<boolean>;
  updateTableOccupancy(id: string, isOccupied: boolean, orderId?: string): Promise<Table | undefined>;
  getPendingTableOrders(branchId?: string): Promise<Order[]>;
  getTableOrders(tableId: string): Promise<Order[]>;

  getDeliveryZones(tenantId?: string): Promise<DeliveryZone[]>;
  getDeliveryZone(id: string): Promise<DeliveryZone | undefined>;

  createTaxInvoice(data: any): Promise<any>;

  getAvailableDrivers(): Promise<Employee[]>;
  updateDriverAvailability(id: string, isAvailable: boolean): Promise<void>;
  updateDriverLocation(id: string, lat: number, lng: number): Promise<void>;
  assignDriverToOrder(orderId: string, driverId: string): Promise<void>;
  startDelivery(orderId: string): Promise<void>;
  completeDelivery(orderId: string): Promise<void>;
  getActiveDeliveryOrders(): Promise<Order[]>;
  getDriverActiveOrders(driverId: string): Promise<Order[]>;

  getCafe(id: string): Promise<ICafe | undefined>;
  createCafe(cafe: Partial<ICafe>): Promise<ICafe>;
  updateCafe(id: string, cafe: Partial<ICafe>): Promise<ICafe | undefined>;
  
  getBranches(cafeId: string): Promise<IBranch[]>;
  getBranch(id: string): Promise<IBranch | null>;
  createBranch(branch: Partial<IBranch>): Promise<IBranch>;
  updateBranch(id: string, branch: Partial<IBranch>): Promise<IBranch | null>;

  getCustomer(id: string): Promise<Customer | undefined>;
  getCustomerByPhone(phone: string): Promise<Customer | undefined>;
  getCustomerByEmail(email: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined>;
  getCustomerOrders(customerId: string): Promise<Order[]>;
  verifyCustomerPassword(phone: string, password: string): Promise<Customer | undefined>;
  resetCustomerPassword(email: string, newPassword: string): Promise<boolean>;
  
  createPasswordResetToken(email: string): Promise<{token: string, expiresAt: Date}>;
  verifyPasswordResetToken(token: string): Promise<{valid: boolean, email?: string}>;
  usePasswordResetToken(token: string): Promise<boolean>;

  createPasswordSetupOTP(phone: string): Promise<{otp: string, expiresAt: Date}>;
  verifyPasswordSetupOTP(phone: string, otp: string): Promise<{valid: boolean, message?: string}>;
  invalidatePasswordSetupOTP(phone: string, otp: string): Promise<boolean>;

  getCoffeeItems(): Promise<CoffeeItem[]>;
  getCoffeeItem(id: string): Promise<CoffeeItem | undefined>;
  getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]>;
  createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem>;
  updateCoffeeItem(id: string, item: Partial<CoffeeItem>): Promise<CoffeeItem | undefined>;

  // Addons
  getAddons(tenantId: string): Promise<IProductAddon[]>;
  getCoffeeItemAddons(coffeeItemId: string): Promise<IProductAddon[]>;
  
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  updateOrderStatus(id: string, status: string, cancellationReason?: string): Promise<Order | undefined>;
  updateOrderCarPickup(id: string, carPickup: any): Promise<Order | undefined>;
  getOrders(limit?: number, offset?: number): Promise<Order[]>;

  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  getOrderItems(orderId: string): Promise<OrderItem[]>;

  getCartItems(sessionId: string): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;

  createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard>;
  getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined>;
  getLoyaltyCards(): Promise<LoyaltyCard[]>;
  updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined>;

  generateCodesForOrder(orderId: string, drinks: Array<{name: string, quantity: number}>): Promise<CardCode[]>;
  redeemCode(code: string, cardId: string): Promise<{success: boolean, message: string, card?: LoyaltyCard}>;
  getCodesByOrder(orderId: string): Promise<CardCode[]>;
  getCodeDetails(code: string): Promise<CardCode | undefined>;

  createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction>;
  getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]>;
  getAllLoyaltyTransactions(limit?: number): Promise<LoyaltyTransaction[]>;

  createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward>;
  getLoyaltyRewards(): Promise<LoyaltyReward[]>;
  getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined>;

  getIngredients(): Promise<any[]>;
  createIngredient(ingredient: any): Promise<any>;
  updateIngredientAvailability(id: string, isAvailable: number): Promise<any>;
  getCoffeeItemIngredients(coffeeItemId: string): Promise<any[]>;
  addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string, quantity?: number, unit?: string): Promise<any>;
  removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void>;
  getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]>;
  deleteBranch(id: string): Promise<boolean>;

  // ================== INVENTORY MANAGEMENT ==================
  // Raw Items
  getRawItems(): Promise<RawItem[]>;
  getRawItem(id: string): Promise<RawItem | undefined>;
  getRawItemByCode(code: string): Promise<RawItem | undefined>;
  createRawItem(item: InsertRawItem): Promise<RawItem>;
  updateRawItem(id: string, updates: Partial<RawItem>): Promise<RawItem | undefined>;
  deleteRawItem(id: string): Promise<boolean>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<Supplier | undefined>;
  getSupplierByCode(code: string): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Branch Stock
  getBranchStock(branchId: string): Promise<BranchStock[]>;
  getBranchStockItem(branchId: string, rawItemId: string): Promise<BranchStock | undefined>;
  updateBranchStock(branchId: string, rawItemId: string, quantity: number, createdBy: string, movementType?: string, notes?: string): Promise<BranchStock>;
  getLowStockItems(branchId?: string): Promise<any[]>;
  getAllBranchesStock(): Promise<any[]>;

  // Stock Transfers
  getStockTransfers(branchId?: string): Promise<StockTransfer[]>;
  getStockTransfer(id: string): Promise<StockTransfer | undefined>;
  createStockTransfer(transfer: InsertStockTransfer): Promise<StockTransfer>;
  updateStockTransferStatus(id: string, status: string, approvedBy?: string): Promise<StockTransfer | undefined>;
  completeStockTransfer(id: string, completedBy: string): Promise<StockTransfer | undefined>;

  // Purchase Invoices
  getPurchaseInvoices(branchId?: string): Promise<PurchaseInvoice[]>;
  getPurchaseInvoice(id: string): Promise<PurchaseInvoice | undefined>;
  createPurchaseInvoice(invoice: InsertPurchaseInvoice): Promise<PurchaseInvoice>;
  updatePurchaseInvoice(id: string, updates: Partial<PurchaseInvoice>): Promise<PurchaseInvoice | undefined>;
  receivePurchaseInvoice(id: string, receivedBy: string): Promise<PurchaseInvoice | undefined>;
  updatePurchaseInvoicePayment(id: string, paidAmount: number): Promise<PurchaseInvoice | undefined>;

  // Recipe Items
  getAllRecipeItems(): Promise<RecipeItem[]>;
  getRecipeItems(coffeeItemId: string): Promise<RecipeItem[]>;
  createRecipeItem(item: InsertRecipeItem): Promise<RecipeItem>;
  updateRecipeItem(id: string, updates: Partial<RecipeItem>): Promise<RecipeItem | undefined>;
  deleteRecipeItem(id: string): Promise<boolean>;
  calculateProductCost(coffeeItemId: string): Promise<number>;

  // Stock Alerts
  getStockAlerts(branchId?: string, resolved?: boolean): Promise<StockAlert[]>;
  createStockAlert(branchId: string, rawItemId: string, alertType: string, currentQuantity: number, thresholdQuantity: number): Promise<StockAlert>;
  resolveStockAlert(id: string, resolvedBy: string): Promise<StockAlert | undefined>;
  markAlertAsRead(id: string): Promise<StockAlert | undefined>;

  // Stock Movements
  getStockMovements(branchId: string, rawItemId?: string, limit?: number): Promise<StockMovement[]>;
  createStockMovement(movement: InsertStockMovement): Promise<StockMovement>;

  // Smart Inventory Deduction
  deductInventoryForOrder(
    orderId: string,
    branchId: string,
    items: Array<{ coffeeItemId: string; quantity: number; addons?: Array<{ rawItemId: string; quantity: number; unit: string }> }>,
    createdBy: string
  ): Promise<{
    success: boolean;
    costOfGoods: number;
    grossProfit: number;
    deductionDetails: Array<{
      rawItemId: string;
      rawItemName: string;
      quantity: number;
      unit: string;
      unitCost: number;
      totalCost: number;
      previousQuantity: number;
      newQuantity: number;
      status: 'deducted' | 'skipped_no_stock' | 'skipped_insufficient' | 'skipped_no_recipe';
      message: string;
    }>;
    shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }>;
    warnings: string[];
    errors: string[];
  }>;

  calculateOrderCOGS(items: Array<{ coffeeItemId: string; quantity: number }>, branchId?: string): Promise<{
    totalCost: number;
    itemBreakdown: Array<{
      coffeeItemId: string;
      coffeeItemName: string;
      quantity: number;
      unitCost: number;
      totalCost: number;
      ingredients: Array<{
        rawItemId: string;
        rawItemName: string;
        quantity: number;
        unit: string;
        unitCost: number;
        totalCost: number;
      }>;
    }>;
    shortages: Array<{
      rawItemId: string;
      rawItemName: string;
      required: number;
      available: number;
      unit: string;
    }>;
  }>;
}

// Helper function to serialize MongoDB documents
function serializeDoc(doc: any): any {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Only set id from _id if there's no existing id field
  if (obj._id && !obj.id) {
    obj.id = obj._id.toString();
  }
  
  // Always clean up MongoDB internal fields
  delete obj._id;
  delete obj.__v;
  return obj;
}

export class DBStorage implements IStorage {
  private orderCounter: number = 1;

  constructor() {
    this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      await this.initializeDemoEmployee();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }

  private async initializeCoffeeMenu() {
    return;
  }

  private async initializeDemoEmployee() {
    const existing = await EmployeeModel.findOne({ username: 'manager' });
    if (existing) return;

    const hashedPassword = bcrypt.hashSync('2030', 10);
    await EmployeeModel.create({
      id: "manager-demo",
      username: 'manager',
      password: hashedPassword,
      fullName: 'المدير',
      role: 'manager',
      title: 'مدير المقهى',
      phone: '500000000',
      jobTitle: 'مدير',
      isActivated: 1,
      employmentNumber: 'EMP-001',
      tenantId: 'demo-tenant'
    });
  }

  // --- OPERATING SYSTEM CORE IMPLEMENTATIONS ---

  async getBusinessConfig(tenantId: string): Promise<IBusinessConfig | undefined> {
    const config = await BusinessConfigModel.findOne({ tenantId }).lean();
    return config ? (config as any) : undefined;
  }

  async updateBusinessConfig(tenantId: string, updates: Partial<IBusinessConfig>): Promise<IBusinessConfig> {
    const config = await BusinessConfigModel.findOneAndUpdate(
      { tenantId },
      { $set: { ...updates, updatedAt: new Date() } },
      { upsert: true, new: true }
    ).lean();
    return config as any;
  }

  async getIngredientItems(tenantId: string): Promise<IIngredientItem[]> {
    return await IngredientItemModel.find({ tenantId }).lean() as any[];
  }

  async createIngredientItem(item: Partial<IIngredientItem>): Promise<IIngredientItem> {
    const newItem = await IngredientItemModel.create(item);
    return newItem.toObject() as any;
  }

  async updateIngredientItem(id: string, updates: Partial<IIngredientItem>): Promise<IIngredientItem | undefined> {
    const updated = await IngredientItemModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated ? (updated as any) : undefined;
  }

  async getRecipeDefinition(tenantId: string, productId: string): Promise<IRecipeDefinition | undefined> {
    const recipe = await RecipeDefinitionModel.findOne({ tenantId, productId, isActive: true }).lean();
    return recipe ? (recipe as any) : undefined;
  }

  async createRecipeDefinition(recipe: Partial<IRecipeDefinition>): Promise<IRecipeDefinition> {
    const newRecipe = await RecipeDefinitionModel.create(recipe);
    return newRecipe.toObject() as any;
  }

  async updateRecipeDefinition(id: string, updates: Partial<IRecipeDefinition>): Promise<IRecipeDefinition | undefined> {
    const updated = await RecipeDefinitionModel.findByIdAndUpdate(
      id,
      { $set: { ...updates, updatedAt: new Date() } },
      { new: true }
    ).lean();
    return updated ? (updated as any) : undefined;
  }

  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id);
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const newUser = await UserModel.create({
      ...user,
      password: hashedPassword,
    });
    return newUser;
  }

  async getCafe(id: string): Promise<ICafe | undefined> {
    const cafe = await CafeModel.findOne({ id }).lean();
    return cafe ? serializeDoc(cafe) : undefined;
  }

  async createCafe(cafe: Partial<ICafe>): Promise<ICafe> {
    const newCafe = await CafeModel.create(cafe);
    return serializeDoc(newCafe);
  }

  async updateCafe(id: string, updates: Partial<ICafe>): Promise<ICafe | undefined> {
    const cafe = await CafeModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return cafe ? serializeDoc(cafe) : undefined;
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findById(id).lean();
    if (!employee) return undefined;
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async getEmployeeByUsername(username: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ username }).lean();
    if (!employee) return undefined;
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async getEmployeeByPhone(phone: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ phone }).lean();
    if (!employee) return undefined;
    const result: any = {
      ...employee,
      id: employee._id.toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const employmentNumber = insertEmployee.employmentNumber || nanoid(10);
    if (insertEmployee.password) {
      const hashedPassword = await bcrypt.hash(insertEmployee.password, 10);
      const newEmployee = await EmployeeModel.create({
        ...insertEmployee,
        employmentNumber,
        password: hashedPassword,
      });
      const result: any = {
        ...newEmployee.toObject(),
        id: (newEmployee._id as any).toString(),
      };
      delete result._id;
      delete result.__v;
      return result;
    } else {
      const newEmployee = await EmployeeModel.create({
        ...insertEmployee,
        employmentNumber,
      });
      const result: any = {
        ...newEmployee.toObject(),
        id: (newEmployee._id as any).toString(),
      };
      delete result._id;
      delete result.__v;
      return result;
    }
  }

  async updateEmployee(id: string, updates: any): Promise<any> {
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    updates.updatedAt = new Date();
    let employee = await EmployeeModel.findOneAndUpdate({ id }, updates, { new: true }).lean();
    if (!employee && (id as any).match(/^[0-9a-fA-F]{24}$/)) {
      employee = await EmployeeModel.findByIdAndUpdate(id, updates, { new: true }).lean();
    }
    if (!employee) return undefined;
    const result: any = {
      ...employee,
      id: (employee as any)._id.toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async activateEmployee(phone: string, fullName: string, password: string): Promise<Employee | undefined> {
    const employee = await EmployeeModel.findOne({ phone, fullName, isActivated: 0 });
    if (!employee) return undefined;
    const hashedPassword = await bcrypt.hash(password, 10);
    employee.password = hashedPassword;
    employee.isActivated = 1;
    employee.updatedAt = new Date();
    await employee.save();
    const obj = employee.toObject();
    const result: any = {
      ...obj,
      id: (employee._id as any).toString(),
    };
    delete result._id;
    delete result.__v;
    return result;
  }

  async resetEmployeePasswordByUsername(username: string, newPassword: string): Promise<boolean> {
    const employee = await this.getEmployeeByUsername(username);
    if (!employee) return false;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await EmployeeModel.updateOne({ username }, { password: hashedPassword });
    return true;
  }

  async getEmployees(tenantId?: string): Promise<Employee[]> {
    const query = tenantId ? { tenantId } : {};
    const employees = await EmployeeModel.find(query).lean();
    return employees.map((emp: any) => ({
      ...emp,
      id: emp._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async getActiveCashiers(tenantId?: string): Promise<Employee[]> {
    const query: any = { role: 'cashier', isActivated: 1 };
    if (tenantId) query.tenantId = tenantId;
    const cashiers = await EmployeeModel.find(query).lean();
    return cashiers.map((emp: any) => ({
      ...emp,
      id: emp._id.toString(),
      _id: undefined,
      __v: undefined,
    }));
  }

  async createDiscountCode(insertDiscountCode: InsertDiscountCode): Promise<DiscountCode> {
    const normalizedCode = { ...insertDiscountCode, code: insertDiscountCode.code.trim().toLowerCase() };
    const newCode = await DiscountCodeModel.create(normalizedCode);
    return newCode;
  }

  async getDiscountCode(id: string): Promise<DiscountCode | undefined> {
    const code = await DiscountCodeModel.findById(id).lean();
    return code ? (code as any) : undefined;
  }

  async getCoffeeItems(): Promise<CoffeeItem[]> {
    const items = await CoffeeItemModel.find({}).lean();
    return (items as any[]).map(serializeDoc);
  }

  async getCoffeeItem(id: string): Promise<CoffeeItem | undefined> {
    const item = await CoffeeItemModel.findOne({ id }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async getCoffeeItemsByCategory(category: string): Promise<CoffeeItem[]> {
    const items = await CoffeeItemModel.find({ category }).lean();
    return (items as any[]).map(serializeDoc);
  }

  async createCoffeeItem(item: InsertCoffeeItem): Promise<CoffeeItem> {
    const newItem = await CoffeeItemModel.create(item);
    return serializeDoc(newItem);
  }

  async getLoyaltyCardsByCustomerId(customerId: string): Promise<LoyaltyCard[]> {
    const cards = await LoyaltyCardModel.find({ customerId }).lean();
    return (cards as any[]).map(serializeDoc);
  }

  async setActiveCard(customerId: string, cardId: string): Promise<boolean> {
    await LoyaltyCardModel.updateMany({ customerId }, { isActive: 0 });
    await LoyaltyCardModel.findByIdAndUpdate(cardId, { isActive: 1 });
    return true;
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const normalizedCode = code.trim().toLowerCase();
    const result = await DiscountCodeModel.findOne({ code: normalizedCode }).lean();
    return result ? (result as any) : undefined;
  }

  async incrementDiscountCodeUsage(code: string): Promise<void> {
    const normalizedCode = code.trim().toLowerCase();
    await DiscountCodeModel.updateOne({ code: normalizedCode }, { $inc: { usageCount: 1 } });
  }

  async updateDiscountCode(id: string, updates: Partial<DiscountCode>): Promise<DiscountCode | undefined> {
    const updated = await DiscountCodeModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    return updated ? (updated as any) : undefined;
  }

  async getCustomers(): Promise<Customer[]> {
    const customers = await CustomerModel.find({}).lean();
    return (customers as any[]).map(serializeDoc);
  }

  async getOrdersByEmployee(employeeId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ employeeId }).sort({ createdAt: -1 }).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async getAllBranches(): Promise<IBranch[]> {
    const branches = await BranchModel.find({}).lean();
    return (branches as any[]).map(serializeDoc);
  }

  async getCategories(tenantId?: string): Promise<Category[]> {
    const query = tenantId ? { tenantId } : {};
    const categories = await CategoryModel.find(query).lean();
    return (categories as any[]).map(serializeDoc);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const newCategory = await CategoryModel.create(category);
    return serializeDoc(newCategory);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | undefined> {
    const updated = await CategoryModel.findByIdAndUpdate(id, { $set: updates }, { new: true }).lean();
    return updated ? serializeDoc(updated) : undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await CategoryModel.findByIdAndDelete(id);
    return !!result;
  }

  async getTables(branchId?: string): Promise<Table[]> {
    const query = branchId ? { branchId } : {};
    const tables = await TableModel.find(query).lean();
    return (tables as any[]).map(serializeDoc);
  }

  async getTable(id: string): Promise<Table | undefined> {
    const table = await TableModel.findOne({ id }).lean();
    if (!table && (id as any).match(/^[0-9a-fA-F]{24}$/)) {
      const byId = await TableModel.findById(id).lean();
      return byId ? serializeDoc(byId) : undefined;
    }
    return table ? serializeDoc(table) : undefined;
  }

  async getTableByQRToken(qrToken: string): Promise<Table | undefined> {
    const table = await TableModel.findOne({ qrToken }).lean();
    return table ? serializeDoc(table) : undefined;
  }

  async createTable(table: InsertTable): Promise<Table> {
    const newTable = await TableModel.create(table);
    return serializeDoc(newTable);
  }

  async updateTable(id: string, updates: Partial<Table>): Promise<Table | undefined> {
    const table = await TableModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return table ? serializeDoc(table) : undefined;
  }

  async deleteTable(id: string): Promise<boolean> {
    const result = await TableModel.findOneAndDelete({ id });
    return !!result;
  }

  async updateTableOccupancy(id: string, isOccupied: boolean, orderId?: string): Promise<Table | undefined> {
    const updates: any = { isOccupied: isOccupied ? 1 : 0 };
    if (orderId) updates.currentOrderId = orderId;
    else updates.currentOrderId = null;
    
    return this.updateTable(id, updates);
  }

  async getPendingTableOrders(branchId?: string): Promise<Order[]> {
    const query: any = { orderType: 'table', status: 'pending' };
    if (branchId) query.branchId = branchId;
    const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async getTableOrders(tableId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ tableId }).sort({ createdAt: -1 }).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async getDeliveryZones(tenantId?: string): Promise<DeliveryZone[]> {
    const query = tenantId ? { tenantId } : {};
    const zones = await DeliveryZoneModel.find(query).lean();
    return (zones as any[]).map(serializeDoc);
  }

  async getDeliveryZone(id: string): Promise<DeliveryZone | undefined> {
    const zone = await DeliveryZoneModel.findById(id).lean();
    return zone ? serializeDoc(zone) : undefined;
  }

  async createTaxInvoice(data: any): Promise<any> {
    const invoice = await TaxInvoiceModel.create(data);
    return serializeDoc(invoice);
  }

  async getAvailableDrivers(): Promise<Employee[]> {
    const drivers = await EmployeeModel.find({ role: 'driver', isActivated: 1 }).lean();
    return (drivers as any[]).map((d: any) => ({ ...d, id: d._id.toString() }));
  }

  async updateDriverAvailability(id: string, isAvailable: boolean): Promise<void> {
    await EmployeeModel.findByIdAndUpdate(id, { $set: { isAvailable: isAvailable ? 1 : 0 } });
  }

  async updateDriverLocation(id: string, lat: number, lng: number): Promise<void> {
    await EmployeeModel.findByIdAndUpdate(id, { $set: { 'location.lat': lat, 'location.lng': lng } });
  }

  async assignDriverToOrder(orderId: string, driverId: string): Promise<void> {
    await OrderModel.findOneAndUpdate({ id: orderId }, { $set: { assignedDriverId: driverId, status: 'assigned' } });
  }

  async startDelivery(orderId: string): Promise<void> {
    await OrderModel.findOneAndUpdate({ id: orderId }, { $set: { status: 'shipped', shippedAt: new Date() } });
  }

  async completeDelivery(orderId: string): Promise<void> {
    await OrderModel.findOneAndUpdate({ id: orderId }, { $set: { status: 'delivered', deliveredAt: new Date() } });
  }

  async getActiveDeliveryOrders(): Promise<Order[]> {
    const orders = await OrderModel.find({ orderType: 'delivery', status: { $in: ['pending', 'assigned', 'shipped'] } }).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async getDriverActiveOrders(driverId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ assignedDriverId: driverId, status: { $in: ['assigned', 'shipped'] } }).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async updateCoffeeItem(id: string, updates: Partial<CoffeeItem>): Promise<CoffeeItem | undefined> {
    const item = await CoffeeItemModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async getAddons(tenantId: string): Promise<IProductAddon[]> {
    const addons = await ProductAddonModel.find({ tenantId, isAvailable: 1 }).lean();
    return (addons as any[]).map(serializeDoc);
  }

  async getCoffeeItemAddons(coffeeItemId: string): Promise<IProductAddon[]> {
    const itemAddons = await CoffeeItemAddonModel.find({ coffeeItemId }).lean();
    const addonIds = itemAddons.map(ia => ia.addonId);
    const addons = await ProductAddonModel.find({ id: { $in: addonIds }, isAvailable: 1 }).lean();
    return (addons as any[]).map(serializeDoc);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const orderNumber = `ORD-${Date.now()}-${this.orderCounter++}`;
    const newOrder = await OrderModel.create({ ...order, orderNumber });
    return serializeDoc(newOrder);
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const order = await OrderModel.findOne({ id }).lean();
    return order ? serializeDoc(order) : undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const order = await OrderModel.findOne({ orderNumber }).lean();
    return order ? serializeDoc(order) : undefined;
  }

  async updateOrderStatus(id: string, status: string, cancellationReason?: string): Promise<Order | undefined> {
    const updates: any = { status };
    if (cancellationReason) updates.cancellationReason = cancellationReason;
    const order = await OrderModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return order ? serializeDoc(order) : undefined;
  }

  async updateOrderCarPickup(id: string, carPickup: any): Promise<Order | undefined> {
    const order = await OrderModel.findOneAndUpdate({ id }, { $set: { carPickup } }, { new: true }).lean();
    return order ? serializeDoc(order) : undefined;
  }

  async getOrders(limit: number = 50, offset: number = 0): Promise<Order[]> {
    const orders = await OrderModel.find({}).sort({ createdAt: -1 }).skip(offset).limit(limit).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const newItem = await OrderItemModel.create(orderItem);
    return serializeDoc(newItem);
  }

  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const items = await OrderItemModel.find({ orderId }).lean();
    return (items as any[]).map(serializeDoc);
  }

  async getCartItems(sessionId: string): Promise<CartItem[]> {
    const items = await CartItemModel.find({ sessionId }).lean();
    return (items as any[]).map(serializeDoc);
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const newItem = await CartItemModel.create(cartItem);
    return serializeDoc(newItem);
  }

  async updateCartItemQuantity(sessionId: string, coffeeItemId: string, quantity: number): Promise<CartItem | undefined> {
    const item = await CartItemModel.findOneAndUpdate({ sessionId, coffeeItemId }, { $set: { quantity } }, { new: true }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async removeFromCart(sessionId: string, coffeeItemId: string): Promise<boolean> {
    const result = await CartItemModel.deleteOne({ sessionId, coffeeItemId });
    return result.deletedCount > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await CartItemModel.deleteMany({ sessionId });
    return result.deletedCount > 0;
  }

  async createLoyaltyCard(card: InsertLoyaltyCard): Promise<LoyaltyCard> {
    const newCard = await LoyaltyCardModel.create(card);
    return serializeDoc(newCard);
  }

  async getLoyaltyCard(id: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ id }).lean();
    return card ? serializeDoc(card) : undefined;
  }

  async getLoyaltyCardByQRToken(qrToken: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ qrToken }).lean();
    return card ? serializeDoc(card) : undefined;
  }

  async getLoyaltyCardByCardNumber(cardNumber: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ cardNumber }).lean();
    return card ? serializeDoc(card) : undefined;
  }

  async getLoyaltyCardByPhone(phoneNumber: string): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOne({ phoneNumber }).lean();
    return card ? serializeDoc(card) : undefined;
  }

  async getLoyaltyCards(): Promise<LoyaltyCard[]> {
    const cards = await LoyaltyCardModel.find({}).lean();
    return (cards as any[]).map(serializeDoc);
  }

  async updateLoyaltyCard(id: string, updates: Partial<LoyaltyCard>): Promise<LoyaltyCard | undefined> {
    const card = await LoyaltyCardModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return card ? serializeDoc(card) : undefined;
  }

  async generateCodesForOrder(orderId: string, drinks: Array<{ name: string; quantity: number }>): Promise<CardCode[]> {
    const codes: CardCode[] = [];
    for (const drink of drinks) {
      for (let i = 0; i < drink.quantity; i++) {
        const code = nanoid(8).toUpperCase();
        const newCode = await CardCodeModel.create({ code, orderId, isRedeemed: 0 });
        codes.push(serializeDoc(newCode));
      }
    }
    return codes;
  }

  async redeemCode(code: string, cardId: string): Promise<{ success: boolean; message: string; card?: LoyaltyCard }> {
    const codeDoc = await CardCodeModel.findOne({ code, isRedeemed: 0 });
    if (!codeDoc) return { success: false, message: "كود غير صالح أو تم استخدامه" };
    const card = await LoyaltyCardModel.findOne({ id: cardId });
    if (!card) return { success: false, message: "البطاقة غير موجودة" };
    card.stamps = (card.stamps || 0) + 1;
    await card.save();
    codeDoc.isRedeemed = 1;
    codeDoc.redeemedAt = new Date();
    codeDoc.cardId = cardId;
    await codeDoc.save();
    return { success: true, message: "تم إضافة الختم بنجاح", card: serializeDoc(card) };
  }

  async getCodesByOrder(orderId: string): Promise<CardCode[]> {
    const codes = await CardCodeModel.find({ orderId }).lean();
    return (codes as any[]).map(serializeDoc);
  }

  async getCodeDetails(code: string): Promise<CardCode | undefined> {
    const doc = await CardCodeModel.findOne({ code }).lean();
    return doc ? serializeDoc(doc) : undefined;
  }

  async createLoyaltyTransaction(transaction: InsertLoyaltyTransaction): Promise<LoyaltyTransaction> {
    const newTx = await LoyaltyTransactionModel.create(transaction);
    return serializeDoc(newTx);
  }

  async getLoyaltyTransactions(cardId: string): Promise<LoyaltyTransaction[]> {
    const txs = await LoyaltyTransactionModel.find({ cardId }).sort({ createdAt: -1 }).lean();
    return (txs as any[]).map(serializeDoc);
  }

  async getAllLoyaltyTransactions(limit: number = 50): Promise<LoyaltyTransaction[]> {
    const txs = await LoyaltyTransactionModel.find({}).sort({ createdAt: -1 }).limit(limit).lean();
    return (txs as any[]).map(serializeDoc);
  }

  async createLoyaltyReward(reward: InsertLoyaltyReward): Promise<LoyaltyReward> {
    const newReward = await LoyaltyRewardModel.create(reward);
    return serializeDoc(newReward);
  }

  async getLoyaltyRewards(): Promise<LoyaltyReward[]> {
    const rewards = await LoyaltyRewardModel.find({ isAvailable: 1 }).lean();
    return (rewards as any[]).map(serializeDoc);
  }

  async getLoyaltyReward(id: string): Promise<LoyaltyReward | undefined> {
    const reward = await LoyaltyRewardModel.findOne({ id }).lean();
    return reward ? serializeDoc(reward) : undefined;
  }

  async getIngredients(): Promise<any[]> {
    const ingredients = await IngredientModel.find({}).lean();
    return (ingredients as any[]).map(serializeDoc);
  }

  async createIngredient(ingredient: any): Promise<any> {
    const newIngredient = await IngredientModel.create(ingredient);
    return serializeDoc(newIngredient);
  }

  async updateIngredientAvailability(id: string, isAvailable: number): Promise<any> {
    const ingredient = await IngredientModel.findOneAndUpdate({ id }, { $set: { isAvailable } }, { new: true }).lean();
    return ingredient ? serializeDoc(ingredient) : undefined;
  }

  async getCoffeeItemIngredients(coffeeItemId: string): Promise<any[]> {
    const items = await CoffeeItemIngredientModel.find({ coffeeItemId }).lean();
    return (items as any[]).map(serializeDoc);
  }

  async addCoffeeItemIngredient(coffeeItemId: string, ingredientId: string, quantity: number = 0, unit: string = ""): Promise<any> {
    const newItem = await CoffeeItemIngredientModel.create({ coffeeItemId, ingredientId, quantity, unit });
    return serializeDoc(newItem);
  }

  async removeCoffeeItemIngredient(coffeeItemId: string, ingredientId: string): Promise<void> {
    await CoffeeItemIngredientModel.deleteOne({ coffeeItemId, ingredientId });
  }

  async getCoffeeItemsByIngredient(ingredientId: string): Promise<CoffeeItem[]> {
    const links = await CoffeeItemIngredientModel.find({ ingredientId }).lean();
    const ids = links.map(l => l.coffeeItemId);
    const items = await CoffeeItemModel.find({ id: { $in: ids } }).lean();
    return (items as any[]).map(serializeDoc);
  }

  async deleteBranch(id: string): Promise<boolean> {
    const result = await BranchModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getRawItems(): Promise<RawItem[]> {
    const items = await RawItemModel.find({}).lean();
    return (items as any[]).map(serializeDoc);
  }

  async getRawItem(id: string): Promise<RawItem | undefined> {
    const item = await RawItemModel.findOne({ id }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async getRawItemByCode(sku: string): Promise<RawItem | undefined> {
    const item = await RawItemModel.findOne({ sku }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async createRawItem(item: InsertRawItem): Promise<RawItem> {
    const newItem = await RawItemModel.create(item);
    return serializeDoc(newItem);
  }

  async updateRawItem(id: string, updates: Partial<RawItem>): Promise<RawItem | undefined> {
    const item = await RawItemModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async deleteRawItem(id: string): Promise<boolean> {
    const result = await RawItemModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getSuppliers(): Promise<Supplier[]> {
    const suppliers = await SupplierModel.find({}).lean();
    return (suppliers as any[]).map(serializeDoc);
  }

  async getSupplier(id: string): Promise<Supplier | undefined> {
    const supplier = await SupplierModel.findOne({ id }).lean();
    return supplier ? serializeDoc(supplier) : undefined;
  }

  async getSupplierByCode(code: string): Promise<Supplier | undefined> {
    const supplier = await SupplierModel.findOne({ code }).lean();
    return supplier ? serializeDoc(supplier) : undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const newSupplier = await SupplierModel.create(supplier);
    return serializeDoc(newSupplier);
  }

  async updateSupplier(id: string, updates: Partial<Supplier>): Promise<Supplier | undefined> {
    const supplier = await SupplierModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return supplier ? serializeDoc(supplier) : undefined;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await SupplierModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async getBranchStock(branchId: string): Promise<BranchStock[]> {
    const stock = await BranchStockModel.find({ branchId }).lean();
    return (stock as any[]).map(serializeDoc);
  }

  async getBranchStockItem(branchId: string, rawItemId: string): Promise<BranchStock | undefined> {
    const stock = await BranchStockModel.findOne({ branchId, rawItemId }).lean();
    return stock ? serializeDoc(stock) : undefined;
  }

  async updateBranchStock(branchId: string, rawItemId: string, quantity: number, createdBy: string, movementType: string = "adjustment", notes: string = ""): Promise<BranchStock> {
    let stock = await BranchStockModel.findOne({ branchId, rawItemId });
    const previousQuantity = stock ? stock.quantity : 0;
    if (stock) {
      stock.quantity = quantity;
      stock.updatedAt = new Date();
      await stock.save();
    } else {
      stock = await BranchStockModel.create({ branchId, rawItemId, quantity, id: nanoid() });
    }
    await StockMovementModel.create({
      branchId,
      rawItemId,
      quantity: quantity - previousQuantity,
      type: movementType,
      previousQuantity,
      newQuantity: quantity,
      createdBy,
      notes,
      id: nanoid()
    });
    return serializeDoc(stock);
  }

  async getLowStockItems(branchId?: string): Promise<any[]> {
    const query: any = {};
    if (branchId) query.branchId = branchId;
    const stock = await BranchStockModel.find(query).lean();
    const rawItems = await RawItemModel.find({}).lean();
    const lowStock = [];
    for (const s of stock) {
      const item = rawItems.find(r => r.id === s.rawItemId);
      if (item && s.quantity <= (item.minThreshold || 0)) {
        lowStock.push({ ...s, rawItemName: item.nameAr, minThreshold: item.minThreshold });
      }
    }
    return lowStock;
  }

  async getAllBranchesStock(): Promise<any[]> {
    const stock = await BranchStockModel.find({}).lean();
    return (stock as any[]).map(serializeDoc);
  }

  async getStockTransfers(branchId?: string): Promise<StockTransfer[]> {
    const query = branchId ? { $or: [{ fromBranchId: branchId }, { toBranchId: branchId }] } : {};
    const transfers = await StockTransferModel.find(query).sort({ createdAt: -1 }).lean();
    return (transfers as any[]).map(serializeDoc);
  }

  async getStockTransfer(id: string): Promise<StockTransfer | undefined> {
    const transfer = await StockTransferModel.findOne({ id }).lean();
    return transfer ? serializeDoc(transfer) : undefined;
  }

  async createStockTransfer(transfer: InsertStockTransfer): Promise<StockTransfer> {
    const newTransfer = await StockTransferModel.create(transfer);
    return serializeDoc(newTransfer);
  }

  async updateStockTransferStatus(id: string, status: string, approvedBy?: string): Promise<StockTransfer | undefined> {
    const updates: any = { status };
    if (approvedBy) updates.approvedBy = approvedBy;
    const transfer = await StockTransferModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return transfer ? serializeDoc(transfer) : undefined;
  }

  async completeStockTransfer(id: string, completedBy: string): Promise<StockTransfer | undefined> {
    const transfer = await StockTransferModel.findOne({ id });
    if (!transfer || transfer.status !== "approved") return undefined;
    for (const item of transfer.items) {
      const fromStock = await BranchStockModel.findOne({ branchId: transfer.fromBranchId, rawItemId: item.rawItemId });
      if (fromStock) {
        fromStock.quantity -= item.quantity;
        await fromStock.save();
      }
      let toStock = await BranchStockModel.findOne({ branchId: transfer.toBranchId, rawItemId: item.rawItemId });
      if (toStock) {
        toStock.quantity += item.quantity;
        await toStock.save();
      } else {
        await BranchStockModel.create({ branchId: transfer.toBranchId, rawItemId: item.rawItemId, quantity: item.quantity, id: nanoid() });
      }
    }
    transfer.status = "completed";
    transfer.completedBy = completedBy;
    transfer.completedAt = new Date();
    await transfer.save();
    return serializeDoc(transfer);
  }

  async getPurchaseInvoices(branchId?: string): Promise<PurchaseInvoice[]> {
    const query = branchId ? { branchId } : {};
    const invoices = await PurchaseInvoiceModel.find(query).sort({ createdAt: -1 }).lean();
    return (invoices as any[]).map(serializeDoc);
  }

  async getPurchaseInvoice(id: string): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findOne({ id }).lean();
    return invoice ? serializeDoc(invoice) : undefined;
  }

  async createPurchaseInvoice(invoice: InsertPurchaseInvoice): Promise<PurchaseInvoice> {
    const newInvoice = await PurchaseInvoiceModel.create(invoice);
    return serializeDoc(newInvoice);
  }

  async updatePurchaseInvoice(id: string, updates: Partial<PurchaseInvoice>): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return invoice ? serializeDoc(invoice) : undefined;
  }

  async receivePurchaseInvoice(id: string, receivedBy: string): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findOne({ id });
    if (!invoice || invoice.status === "received") return undefined;
    for (const item of invoice.items) {
      let stock = await BranchStockModel.findOne({ branchId: invoice.branchId, rawItemId: item.rawItemId });
      if (stock) {
        stock.quantity += item.quantity;
        await stock.save();
      } else {
        await BranchStockModel.create({ branchId: invoice.branchId, rawItemId: item.rawItemId, quantity: item.quantity, id: nanoid() });
      }
    }
    invoice.status = "received";
    invoice.receivedBy = receivedBy;
    invoice.receivedAt = new Date();
    await invoice.save();
    return serializeDoc(invoice);
  }

  async updatePurchaseInvoicePayment(id: string, paidAmount: number): Promise<PurchaseInvoice | undefined> {
    const invoice = await PurchaseInvoiceModel.findOne({ id });
    if (!invoice) return undefined;
    invoice.paidAmount = (invoice.paidAmount || 0) + paidAmount;
    invoice.paymentStatus = invoice.paidAmount >= (invoice.totalAmount || 0) ? "paid" : "partial";
    await invoice.save();
    return serializeDoc(invoice);
  }

  async getAllRecipeItems(): Promise<RecipeItem[]> {
    const items = await RecipeItemModel.find({}).lean();
    return (items as any[]).map(serializeDoc);
  }

  async getRecipeItems(coffeeItemId: string): Promise<RecipeItem[]> {
    const items = await RecipeItemModel.find({ coffeeItemId }).lean();
    return (items as any[]).map(serializeDoc);
  }

  async createRecipeItem(item: InsertRecipeItem): Promise<RecipeItem> {
    const newItem = await RecipeItemModel.create(item);
    return serializeDoc(newItem);
  }

  async updateRecipeItem(id: string, updates: Partial<RecipeItem>): Promise<RecipeItem | undefined> {
    const item = await RecipeItemModel.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    return item ? serializeDoc(item) : undefined;
  }

  async deleteRecipeItem(id: string): Promise<boolean> {
    const result = await RecipeItemModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async calculateProductCost(coffeeItemId: string): Promise<number> {
    const items = await RecipeItemModel.find({ coffeeItemId }).lean();
    let total = 0;
    for (const item of items) {
      const raw = await RawItemModel.findOne({ id: item.rawItemId }).lean();
      if (raw && raw.lastCost) {
        total += Number(raw.lastCost) * item.quantity;
      }
    }
    return total;
  }

  async getStockAlerts(branchId?: string, resolved: boolean = false): Promise<StockAlert[]> {
    const query: any = { resolved };
    if (branchId) query.branchId = branchId;
    const alerts = await StockAlertModel.find(query).sort({ createdAt: -1 }).lean();
    return (alerts as any[]).map(serializeDoc);
  }

  async createStockAlert(branchId: string, rawItemId: string, alertType: string, currentQuantity: number, thresholdQuantity: number): Promise<StockAlert> {
    const alert = await StockAlertModel.create({ branchId, rawItemId, alertType, currentQuantity, thresholdQuantity, id: nanoid() });
    return serializeDoc(alert);
  }

  async resolveStockAlert(id: string, resolvedBy: string): Promise<StockAlert | undefined> {
    const alert = await StockAlertModel.findOneAndUpdate({ id }, { $set: { resolved: true, resolvedBy, resolvedAt: new Date() } }, { new: true }).lean();
    return alert ? serializeDoc(alert) : undefined;
  }

  async markAlertAsRead(id: string): Promise<StockAlert | undefined> {
    const alert = await StockAlertModel.findOneAndUpdate({ id }, { $set: { isRead: 1 } }, { new: true }).lean();
    return alert ? serializeDoc(alert) : undefined;
  }

  async getStockMovements(branchId: string, rawItemId?: string, limit: number = 100): Promise<StockMovement[]> {
    const query: any = { branchId };
    if (rawItemId) query.rawItemId = rawItemId;
    const movements = await StockMovementModel.find(query).sort({ createdAt: -1 }).limit(limit).lean();
    return (movements as any[]).map(serializeDoc);
  }

  async createStockMovement(movement: InsertStockMovement): Promise<StockMovement> {
    const newMovement = await StockMovementModel.create(movement);
    return serializeDoc(newMovement);
  }

  async deductInventoryForOrder(orderId: string, branchId: string, items: any[], createdBy: string): Promise<any> {
    const deductionDetails = [];
    const shortages = [];
    let costOfGoods = 0;
    
    for (const item of items) {
      // 1. Deduct based on Recipe
      const recipe = await RecipeItemModel.find({ coffeeItemId: item.coffeeItemId }).lean();
      for (const r of recipe) {
        const stock = await BranchStockModel.findOne({ branchId, rawItemId: r.rawItemId });
        const raw = await RawItemModel.findOne({ id: r.rawItemId }).lean();
        const required = r.quantity * item.quantity;
        
        if (stock && stock.quantity >= required) {
          const previousQuantity = stock.quantity;
          stock.quantity -= required;
          await stock.save();
          
          const unitCost = Number(raw?.lastCost || 0);
          const totalCost = unitCost * required;
          costOfGoods += totalCost;
          
          const detail = { 
            rawItemId: r.rawItemId, 
            rawItemName: raw?.nameAr || "Unknown", 
            quantity: required, 
            unit: r.unit, 
            unitCost, 
            totalCost, 
            previousQuantity, 
            newQuantity: stock.quantity, 
            status: "deducted", 
            message: "Successfully deducted (Recipe)" 
          };
          deductionDetails.push(detail);
          
          // Log movement
          await StockMovementModel.create({
            id: nanoid(),
            branchId,
            rawItemId: r.rawItemId,
            movementType: 'sale',
            quantity: required,
            previousQuantity,
            newQuantity: stock.quantity,
            referenceType: 'order',
            referenceId: orderId,
            createdBy,
            notes: `Order #${orderId} - Recipe Item`
          });
        } else {
          shortages.push({ rawItemId: r.rawItemId, rawItemName: raw?.nameAr || "Unknown", required, available: stock ? stock.quantity : 0, unit: r.unit });
        }
      }

      // 2. Deduct based on Addons
      if (item.addons && Array.isArray(item.addons)) {
        for (const addon of item.addons) {
          if (!addon.rawItemId) continue;
          
          const stock = await BranchStockModel.findOne({ branchId, rawItemId: addon.rawItemId });
          const raw = await RawItemModel.findOne({ id: addon.rawItemId }).lean();
          const required = (addon.quantity || 1) * item.quantity;

          if (stock && stock.quantity >= required) {
            const previousQuantity = stock.quantity;
            stock.quantity -= required;
            await stock.save();

            const unitCost = Number(raw?.lastCost || 0);
            const totalCost = unitCost * required;
            costOfGoods += totalCost;

            const detail = { 
              rawItemId: addon.rawItemId, 
              rawItemName: raw?.nameAr || "Unknown", 
              quantity: required, 
              unit: addon.unit || raw?.unit || 'unit', 
              unitCost, 
              totalCost, 
              previousQuantity, 
              newQuantity: stock.quantity, 
              status: "deducted", 
              message: "Successfully deducted (Addon)" 
            };
            deductionDetails.push(detail);

            // Log movement
            await StockMovementModel.create({
              id: nanoid(),
              branchId,
              rawItemId: addon.rawItemId,
              movementType: 'sale',
              quantity: required,
              previousQuantity,
              newQuantity: stock.quantity,
              referenceType: 'order',
              referenceId: orderId,
              createdBy,
              notes: `Order #${orderId} - Addon Item`
            });
          } else {
            shortages.push({ rawItemId: addon.rawItemId, rawItemName: raw?.nameAr || "Unknown", required, available: stock ? stock.quantity : 0, unit: addon.unit || 'unit' });
          }
        }
      }
    }

    // Update Order with COGS and deduction status
    await OrderModel.findByIdAndUpdate(orderId, {
      $set: {
        costOfGoods,
        inventoryDeducted: shortages.length === 0 ? 1 : 2,
        inventoryDeductionDetails: deductionDetails,
        updatedAt: new Date()
      }
    });

    return { success: shortages.length === 0, costOfGoods, grossProfit: 0, deductionDetails, shortages, warnings: [], errors: [] };
  }

  async calculateOrderCOGS(items: any[], branchId?: string): Promise<any> {
    let totalCost = 0;
    const itemBreakdown = [];
    for (const item of items) {
      const recipe = await RecipeItemModel.find({ coffeeItemId: item.coffeeItemId }).lean();
      const ingredients = [];
      let itemCost = 0;
      for (const r of recipe) {
        const raw = await RawItemModel.findOne({ id: r.rawItemId }).lean();
        const unitCost = Number(raw?.lastCost || 0);
        const quantity = r.quantity * item.quantity;
        const total = unitCost * quantity;
        itemCost += total;
        ingredients.push({ rawItemId: r.rawItemId, rawItemName: raw?.nameAr || "Unknown", quantity, unit: r.unit, unitCost, totalCost: total });
      }
      totalCost += itemCost;
      itemBreakdown.push({ coffeeItemId: item.coffeeItemId, coffeeItemName: "Unknown", quantity: item.quantity, unitCost: itemCost / item.quantity, totalCost: itemCost, ingredients });
    }
    return { totalCost, itemBreakdown, shortages: [] };
  }

  async getBranches(cafeId: string): Promise<IBranch[]> {
    const branches = await BranchModel.find({ cafeId }).lean();
    return (branches as any[]).map(serializeDoc);
  }

  async getBranch(id: string): Promise<IBranch | null> {
    // Try to find by custom id field first, then by MongoDB _id
    let branch = await BranchModel.findOne({ id }).lean();
    if (!branch) {
      try {
        branch = await BranchModel.findById(id).lean();
      } catch (e) {
        // Invalid ObjectId format, ignore
      }
    }
    return branch ? serializeDoc(branch) : null;
  }

  async createBranch(branch: Partial<IBranch>): Promise<IBranch> {
    const newBranch = await BranchModel.create(branch);
    return serializeDoc(newBranch);
  }

  async updateBranch(id: string, branch: Partial<IBranch>): Promise<IBranch | null> {
    const updated = await BranchModel.findOneAndUpdate({ id }, { $set: branch }, { new: true }).lean();
    return updated ? serializeDoc(updated) : null;
  }

  async getCustomer(id: string): Promise<Customer | undefined> {
    const customer = await CustomerModel.findById(id);
    return customer || undefined;
  }

  async getCustomerByPhone(phone: string): Promise<Customer | undefined> {
    const customer = await CustomerModel.findOne({ phone });
    return customer || undefined;
  }

  async getCustomerByEmail(email: string): Promise<Customer | undefined> {
    const customer = await CustomerModel.findOne({ email });
    return customer || undefined;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const newCustomer = await CustomerModel.create(customer);
    return newCustomer;
  }

  async updateCustomer(id: string, customer: Partial<Customer>): Promise<Customer | undefined> {
    const updated = await CustomerModel.findByIdAndUpdate(id, { $set: customer }, { new: true });
    return updated || undefined;
  }

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    const orders = await OrderModel.find({ customerId }).sort({ createdAt: -1 }).lean();
    return (orders as any[]).map(serializeDoc);
  }

  async verifyCustomerPassword(phone: string, password: string): Promise<Customer | undefined> {
    const customer = await CustomerModel.findOne({ phone });
    if (customer && customer.password) {
      const isMatch = await bcrypt.compare(password, customer.password);
      if (isMatch) return customer;
    }
    return undefined;
  }

  async resetCustomerPassword(email: string, newPassword: string): Promise<boolean> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await CustomerModel.updateOne({ email }, { password: hashedPassword });
    return result.modifiedCount > 0;
  }

  async createPasswordResetToken(email: string): Promise<{ token: string; expiresAt: Date }> {
    const token = nanoid(32);
    const expiresAt = new Date(Date.now() + 3600000);
    await PasswordResetTokenModel.create({ email, token, expiresAt });
    return { token, expiresAt };
  }

  async verifyPasswordResetToken(token: string): Promise<{ valid: boolean; email?: string }> {
    const doc = await PasswordResetTokenModel.findOne({ token, used: 0, expiresAt: { $gt: new Date() } });
    return doc ? { valid: true, email: doc.email } : { valid: false };
  }

  async usePasswordResetToken(token: string): Promise<boolean> {
    const result = await PasswordResetTokenModel.updateOne({ token }, { used: 1 });
    return result.modifiedCount > 0;
  }

  async createPasswordSetupOTP(phone: string): Promise<{ otp: string; expiresAt: Date }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 600000);
    await PasswordSetupOTPModel.create({ phone, otp, expiresAt });
    return { otp, expiresAt };
  }

  async verifyPasswordSetupOTP(phone: string, otp: string): Promise<{ valid: boolean; message?: string }> {
    const doc = await PasswordSetupOTPModel.findOne({ phone, otp, used: 0, expiresAt: { $gt: new Date() } });
    return doc ? { valid: true } : { valid: false, message: "كود غير صالح أو منتهي الصلاحية" };
  }

  async invalidatePasswordSetupOTP(phone: string, otp: string): Promise<boolean> {
    const result = await PasswordSetupOTPModel.updateOne({ phone, otp }, { used: 1 });
    return result.modifiedCount > 0;
  }
}

export const storage = new DBStorage();
