export interface User { id: number; name: string; email: string; role: 'customer' | 'admin'; createdAt: string; }
export interface AuthResponse { token: string; user: User; }
export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { name: string; email: string; password: string; }
export interface Product { id: number; name: string; description: string; price: number; stock: number; imageUrl: string; categoryId: number; category?: Category; createdAt: string; }
export interface Category { id: number; name: string; description?: string; }
export interface ProductFilter { search?: string; categoryId?: number; minPrice?: number; maxPrice?: number; sortBy?: 'price_asc'|'price_desc'|'name'|'newest'; page?: number; pageSize?: number; }
export interface PaginatedResult<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface CartItem { id: number; productId: number; product: Product; quantity: number; }
export interface Cart { items: CartItem[]; total: number; itemCount: number; }
export interface Order { id: number; userId: number; user?: User; items: OrderItem[]; total: number; status: 'pending'|'processing'|'shipped'|'delivered'|'cancelled'; createdAt: string; updatedAt: string; shippingAddress: string; }
export interface OrderItem { id: number; productId: number; product: Product; quantity: number; price: number; }
export interface DashboardStats { totalRevenue: number; totalOrders: number; totalProducts: number; totalUsers: number; recentOrders: Order[]; topProducts: { product: Product; sold: number }[]; }
export interface ApiResponse<T> { success: boolean; data: T; message?: string; }
