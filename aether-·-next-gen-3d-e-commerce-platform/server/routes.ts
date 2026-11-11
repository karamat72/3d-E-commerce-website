import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, User, Product, Order, Coupon, Review } from './db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'aether_quantum_jwt_secret_key_2026';

// Extend Request type for authenticated user
export interface AuthRequest extends Request {
  user?: User;
}

// Auth Middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    const users = db.getUsers();
    const user = users.find(u => u.id === decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User no longer exists' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'User account has been suspended' });
    }

    req.user = user;
    next();
  });
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrative clearance required' });
  }
  next();
};

const sanitizeUser = (user: User) => {
  const { passwordHash, ...sanitized } = user;
  return sanitized;
};

/* -------------------------------------------------------------
   AUTH ENDPOINTS
------------------------------------------------------------- */

// POST /api/auth/login
router.post('/auth/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username/Email and password are required' });
  }

  const users = db.getUsers();
  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase().trim() ||
         u.email.toLowerCase() === username.toLowerCase().trim()
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'Your account is deactivated. Contact system administrator.' });
  }

  const validPassword = bcrypt.compareSync(password, user.passwordHash);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: sanitizeUser(user)
  });
});

// POST /api/auth/register
router.post('/auth/register', (req: Request, res: Response) => {
  const { username, email, name, password, phone } = req.body;
  if (!username || !email || !password || !name) {
    return res.status(400).json({ error: 'Name, username, email, and password are required' });
  }

  const users = db.getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
    return res.status(400).json({ error: 'Username is already taken' });
  }
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase().trim())) {
    return res.status(400).json({ error: 'Email address is already registered' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newUser: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: username.trim(),
    email: email.trim(),
    name: name.trim(),
    role: 'customer',
    passwordHash,
    phone: phone || '',
    createdAt: new Date().toISOString(),
    isActive: true,
    addresses: []
  };

  users.push(newUser);
  db.save();

  const token = jwt.sign(
    { id: newUser.id, username: newUser.username, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    token,
    user: sanitizeUser(newUser)
  });
});

// GET /api/auth/me
router.get('/auth/me', authenticateToken, (req: AuthRequest, res: Response) => {
  res.json({ user: sanitizeUser(req.user!) });
});

// PUT /api/auth/profile
router.put('/auth/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  const { name, phone, addresses } = req.body;
  const user = req.user!;

  if (name) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();
  if (addresses) user.addresses = addresses;

  db.save();
  res.json({ user: sanitizeUser(user) });
});

// PUT /api/auth/change-password
router.put('/auth/change-password', authenticateToken, (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user!;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const isValid = bcrypt.compareSync(currentPassword, user.passwordHash);
  if (!isValid) {
    return res.status(400).json({ error: 'Current password does not match' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.passwordHash = bcrypt.hashSync(newPassword, salt);
  db.save();

  res.json({ message: 'Password updated successfully' });
});

/* -------------------------------------------------------------
   PRODUCTS ENDPOINTS
------------------------------------------------------------- */

// GET /api/products
router.get('/products', (req: Request, res: Response) => {
  const { category, search, sort, featured } = req.query;
  let products = [...db.getProducts()];

  if (category && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    products = products.filter(
      p => p.name.toLowerCase().includes(q) ||
           p.tagline.toLowerCase().includes(q) ||
           p.description.toLowerCase().includes(q)
    );
  }

  if (featured === 'true') {
    products = products.filter(p => p.isFeatured);
  }

  if (sort === 'price-low') {
    products.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    products.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    products.sort((a, b) => b.rating - a.rating);
  } else {
    // Default newest
    products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({ products });
});

// GET /api/products/:id
router.get('/products/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const products = db.getProducts();
  const product = products.find(p => p.id === id || p.slug === id);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const reviews = db.getReviews().filter(r => r.productId === product.id);
  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);

  res.json({ product, reviews, related });
});

// POST /api/products (Admin)
router.post('/products', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { name, tagline, description, price, originalPrice, category, image, modelType, stock, variants, specs, features } = req.body;

  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const newProduct: Product = {
    id: `prod_${Date.now()}`,
    name,
    slug,
    tagline: tagline || '',
    description: description || '',
    price: Number(price),
    originalPrice: originalPrice ? Number(originalPrice) : undefined,
    category,
    image: image || '/src/assets/images/hero_neural_headset_1794404342271.jpg',
    modelType: modelType || 'headset',
    stock: Number(stock) || 10,
    rating: 5.0,
    reviewCount: 0,
    variants: variants && variants.length > 0 ? variants : [
      { id: 'v_default', name: 'Standard Edition', colorHex: '#06B6D4', finish: 'Anodized', sku: `${slug.toUpperCase()}-01`, inStock: true }
    ],
    specs: specs || {},
    features: features || [],
    isFeatured: req.body.isFeatured || false,
    isNewArrival: true,
    createdAt: new Date().toISOString()
  };

  db.getProducts().push(newProduct);
  db.save();

  res.status(201).json({ product: newProduct });
});

// PUT /api/products/:id (Admin)
router.put('/products/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const products = db.getProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const current = products[index];
  const updated: Product = {
    ...current,
    ...req.body,
    price: req.body.price !== undefined ? Number(req.body.price) : current.price,
    stock: req.body.stock !== undefined ? Number(req.body.stock) : current.stock,
  };

  products[index] = updated;
  db.save();

  res.json({ product: updated });
});

// DELETE /api/products/:id (Admin)
router.delete('/products/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const products = db.getProducts();
  const index = products.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(index, 1);
  db.save();

  res.json({ message: 'Product deleted successfully' });
});

/* -------------------------------------------------------------
   ORDERS ENDPOINTS
------------------------------------------------------------- */

// GET /api/orders
router.get('/orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const orders = db.getOrders();

  if (user.role === 'admin') {
    // Admin sees all orders sorted newest first
    return res.json({ orders: [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
  }

  // Customer sees own orders
  const customerOrders = orders.filter(o => o.userId === user.id);
  res.json({ orders: customerOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) });
});

// GET /api/orders/:id
router.get('/orders/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const user = req.user!;
  const order = db.getOrders().find(o => o.id === id || o.orderNumber === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (user.role !== 'admin' && order.userId !== user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json({ order });
});

// POST /api/orders
router.post('/orders', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { items, shippingAddress, paymentMethod, couponCode } = req.body;

  if (!items || !items.length || !shippingAddress || !paymentMethod) {
    return res.status(400).json({ error: 'Items, shipping address, and payment method are required' });
  }

  const products = db.getProducts();
  let subtotal = 0;
  const verifiedItems: any[] = [];

  for (const item of items) {
    const prod = products.find(p => p.id === item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Product ${item.name} not found` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient inventory for ${prod.name}` });
    }

    subtotal += prod.price * item.quantity;
    verifiedItems.push({
      productId: prod.id,
      name: prod.name,
      image: prod.image,
      variantId: item.variantId,
      variantName: item.variantName,
      price: prod.price,
      quantity: item.quantity
    });

    // Reduce stock
    prod.stock -= item.quantity;
  }

  let discount = 0;
  if (couponCode) {
    const coupons = db.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase().trim() && c.isActive);
    if (coupon) {
      if (subtotal >= coupon.minOrderValue) {
        if (coupon.type === 'percentage') {
          discount = Math.round((subtotal * (coupon.amount / 100)) * 100) / 100;
        } else {
          discount = Math.min(coupon.amount, subtotal);
        }
        coupon.usageCount += 1;
      }
    }
  }

  const total = Math.max(0, subtotal - discount);
  const orderNumber = `AETH-${Math.floor(10000 + Math.random() * 90000)}`;
  const trackingNumber = `AETH-TRK-${Math.floor(1000000 + Math.random() * 9000000)}`;

  const newOrder: Order = {
    id: `ord_${Date.now()}`,
    orderNumber,
    userId: user.id,
    customerName: user.name,
    customerEmail: user.email,
    items: verifiedItems,
    subtotal,
    discount,
    shipping: 0,
    total,
    couponCode: couponCode || undefined,
    shippingAddress,
    paymentMethod,
    paymentStatus: 'paid',
    orderStatus: 'Neural Assembly',
    trackingNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.getOrders().push(newOrder);
  db.save();

  res.status(201).json({ order: newOrder });
});

// PUT /api/orders/:id/status (Admin)
router.put('/orders/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { orderStatus } = req.body;

  const validStatuses = ['Processing', 'Neural Assembly', 'Quality Check', 'Shipped', 'Delivered', 'Cancelled'];
  if (!validStatuses.includes(orderStatus)) {
    return res.status(400).json({ error: 'Invalid order status' });
  }

  const orders = db.getOrders();
  const order = orders.find(o => o.id === id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.orderStatus = orderStatus;
  order.updatedAt = new Date().toISOString();
  db.save();

  res.json({ order });
});

// POST /api/orders/:id/refund (Admin)
router.post('/orders/:id/refund', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const orders = db.getOrders();
  const order = orders.find(o => o.id === id);

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.paymentStatus = 'refunded';
  order.orderStatus = 'Cancelled';
  order.updatedAt = new Date().toISOString();
  db.save();

  res.json({ message: 'Order refund recorded', order });
});

/* -------------------------------------------------------------
   CUSTOMER MANAGEMENT (Admin)
------------------------------------------------------------- */

// GET /api/customers
router.get('/customers', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const users = db.getUsers().filter(u => u.role === 'customer');
  const orders = db.getOrders();

  const customerList = users.map(user => {
    const userOrders = orders.filter(o => o.userId === user.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
    return {
      ...sanitizeUser(user),
      orderCount: userOrders.length,
      totalSpent: Math.round(totalSpent * 100) / 100,
      lastOrderDate: userOrders[0]?.createdAt || null
    };
  });

  res.json({ customers: customerList });
});

// PUT /api/customers/:id/status
router.put('/customers/:id/status', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const users = db.getUsers();
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  user.isActive = Boolean(isActive);
  db.save();

  res.json({ user: sanitizeUser(user) });
});

/* -------------------------------------------------------------
   COUPONS ENDPOINTS
------------------------------------------------------------- */

// POST /api/coupons/validate
router.post('/coupons/validate', (req: Request, res: Response) => {
  const { code, orderAmount } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Coupon code required' });
  }

  const coupons = db.getCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase().trim() && c.isActive);

  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired promotional code' });
  }

  if (orderAmount < coupon.minOrderValue) {
    return res.status(400).json({
      error: `Minimum order value for ${coupon.code} is $${coupon.minOrderValue}`
    });
  }

  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.round((orderAmount * (coupon.amount / 100)) * 100) / 100;
  } else {
    discount = Math.min(coupon.amount, orderAmount);
  }

  res.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    amount: coupon.amount,
    discountAmount: discount
  });
});

// GET /api/coupons (Admin)
router.get('/coupons', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  res.json({ coupons: db.getCoupons() });
});

// POST /api/coupons (Admin)
router.post('/coupons', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { code, type, amount, minOrderValue, validUntil } = req.body;
  if (!code || !amount) {
    return res.status(400).json({ error: 'Coupon code and discount amount required' });
  }

  const coupons = db.getCoupons();
  if (coupons.some(c => c.code.toUpperCase() === code.toUpperCase().trim())) {
    return res.status(400).json({ error: 'Coupon code already exists' });
  }

  const newCoupon: Coupon = {
    id: `coup_${Date.now()}`,
    code: code.toUpperCase().trim(),
    type: type === 'fixed' ? 'fixed' : 'percentage',
    amount: Number(amount),
    minOrderValue: Number(minOrderValue) || 0,
    validUntil: validUntil || '2026-12-31',
    usageCount: 0,
    isActive: true
  };

  coupons.push(newCoupon);
  db.save();

  res.status(201).json({ coupon: newCoupon });
});

// DELETE /api/coupons/:id (Admin)
router.delete('/coupons/:id', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const coupons = db.getCoupons();
  const index = coupons.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Coupon not found' });
  }

  coupons.splice(index, 1);
  db.save();

  res.json({ message: 'Coupon deleted' });
});

/* -------------------------------------------------------------
   REVIEWS ENDPOINTS
------------------------------------------------------------- */

// POST /api/reviews
router.post('/reviews', authenticateToken, (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const { productId, rating, title, comment } = req.body;

  if (!productId || !rating || !comment) {
    return res.status(400).json({ error: 'Product, rating, and review comment are required' });
  }

  const products = db.getProducts();
  const product = products.find(p => p.id === productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const newReview: Review = {
    id: `rev_${Date.now()}`,
    productId,
    userId: user.id,
    userName: user.name,
    rating: Math.max(1, Math.min(5, Number(rating))),
    title: title || 'Verified Experience',
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
    verifiedPurchase: true
  };

  db.getReviews().push(newReview);

  // Recalculate product rating
  const prodReviews = db.getReviews().filter(r => r.productId === productId);
  const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
  product.rating = Math.round(avg * 10) / 10;
  product.reviewCount = prodReviews.length;

  db.save();
  res.status(201).json({ review: newReview, rating: product.rating, reviewCount: product.reviewCount });
});

/* -------------------------------------------------------------
   ADMIN STATS & ANALYTICS
------------------------------------------------------------- */

// GET /api/admin/stats
router.get('/admin/stats', authenticateToken, requireAdmin, (req: AuthRequest, res: Response) => {
  const orders = db.getOrders();
  const products = db.getProducts();
  const users = db.getUsers().filter(u => u.role === 'customer');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = users.length;
  const totalProducts = products.length;

  const pendingOrders = orders.filter(o => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled').length;

  // Monthly revenue breakdown
  const monthlyData: Record<string, number> = {
    'Oct': 18450,
    'Nov': 24900,
    'Dec': 38200,
    'Jan': 29400,
    'Feb': 34800,
    'Mar': Math.round(totalRevenue)
  };

  // Status breakdown
  const statusCounts: Record<string, number> = {
    'Processing': 0,
    'Neural Assembly': 0,
    'Quality Check': 0,
    'Shipped': 0,
    'Delivered': 0,
    'Cancelled': 0
  };

  orders.forEach(o => {
    if (statusCounts[o.orderStatus] !== undefined) {
      statusCounts[o.orderStatus]++;
    }
  });

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  res.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalOrders,
    totalCustomers,
    totalProducts,
    pendingOrders,
    monthlyData,
    statusCounts,
    recentOrders
  });
});

export default router;
