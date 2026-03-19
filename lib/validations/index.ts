/**
 * Validation schemas exports
 * Centralized export point for all Zod validation schemas
 */

// Product validations
export {
  productSchema,
  createProductSchema,
  updateProductSchema,
  calculateProductStatus,
  type ProductFormData,
} from "./product";

// Auth validations
export {
  loginSchema,
  type LoginFormData,
} from "./auth";

// Category validations
export {
  createCategorySchema,
  updateCategorySchema,
  type CategoryFormData,
} from "./category";

// Stock Allocation validations
export {
  createStockAllocationSchema,
  updateStockAllocationSchema,
  createStockTransferSchema,
  type CreateStockAllocationFormData,
  type UpdateStockAllocationFormData,
  type CreateStockTransferFormData,
} from "./stock-allocation";
