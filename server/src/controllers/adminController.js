import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @route   GET /api/admin/dashboard & GET /api/admin/stats
 * @desc    Comprehensive analytics: today/7d/30d revenue, order count, pending orders, low-stock products, top products, recent orders, daily revenue series
 * @access  Private (Admin)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Revenue aggregations for paid orders or non-cancelled orders
  const revenueMatch = {
    $or: [{ 'payment.status': 'paid' }, { orderStatus: 'delivered' }],
  };

  const [
    todayRevenueAgg,
    sevenDaysRevenueAgg,
    thirtyDaysRevenueAgg,
    totalOrders,
    pendingOrders,
    totalCustomers,
    ordersByStatusAgg,
    recentOrders,
    lowStockProducts,
    topProductsAgg,
    dailySeriesAgg,
  ] = await Promise.all([
    // Today revenue
    Order.aggregate([
      { $match: { ...revenueMatch, createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    // 7 days revenue
    Order.aggregate([
      { $match: { ...revenueMatch, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    // 30 days revenue
    Order.aggregate([
      { $match: { ...revenueMatch, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$pricing.total' } } },
    ]),
    // Total orders count
    Order.countDocuments(),
    // Pending orders count
    Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'packed'] } }),
    // Total customers count
    User.countDocuments({ role: 'customer' }),
    // Orders count by status
    Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]),
    // Recent 5 orders
    Order.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5),
    // Low stock products (stock <= 5 in any variant)
    Product.find({
      isActive: true,
      'variants.stock': { $lte: 5 },
    }).select('name slug variants images category price stock'),
    // Top products by quantity sold
    Order.aggregate([
      { $match: { orderStatus: { $nin: ['cancelled'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalUnitsSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.lineTotal' },
        },
      },
      { $sort: { totalUnitsSold: -1 } },
      { $limit: 5 },
    ]),
    // Daily revenue series (last 7 days)
    Order.aggregate([
      { $match: { ...revenueMatch, createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$pricing.total' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const revenue = {
    today: todayRevenueAgg[0]?.total || 0,
    sevenDays: sevenDaysRevenueAgg[0]?.total || 0,
    thirtyDays: thirtyDaysRevenueAgg[0]?.total || 0,
  };

  // Convert ordersByStatus array to clean key-value map and formatted array
  const ordersByStatus = ordersByStatusAgg.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  // Build complete 7-day series with zeroes for empty days
  const dailyRevenueSeries = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().split('T')[0];
    const found = dailySeriesAgg.find((item) => item._id === dateStr);
    dailyRevenueSeries.push({
      date: dateStr,
      revenue: found ? found.revenue : 0,
      orders: found ? found.orders : 0,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      revenue,
      orderCount: totalOrders,
      pendingOrders,
      totalCustomers,
      ordersByStatus,
      ordersByStatusList: ordersByStatusAgg,
      lowStockProducts,
      topProducts: topProductsAgg,
      recentOrders,
      dailyRevenueSeries,
    },
  });
});

/**
 * @route   GET /api/admin/customers
 * @desc    Get all customers with order counts and total amount spent
 * @access  Private (Admin)
 */
export const getCustomersAdmin = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;

  const query = { role: 'customer' };

  if (search && search.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.max(1, Number(limit));
  const skip = (pageNum - 1) * limitNum;

  const [customers, total] = await Promise.all([
    User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    User.countDocuments(query),
  ]);

  // Aggregate orders and total spent per customer
  const customerIds = customers.map((c) => c._id);
  const spendingAgg = await Order.aggregate([
    {
      $match: {
        user: { $in: customerIds },
        orderStatus: { $nin: ['cancelled'] },
      },
    },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$pricing.total' },
        lastOrderDate: { $max: '$createdAt' },
      },
    },
  ]);

  const spendingMap = spendingAgg.reduce((acc, curr) => {
    acc[curr._id.toString()] = curr;
    return acc;
  }, {});

  const enrichedCustomers = customers.map((customer) => {
    const stats = spendingMap[customer._id.toString()] || {
      orderCount: 0,
      totalSpent: 0,
      lastOrderDate: null,
    };

    return {
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      avatar: customer.avatar,
      isActive: customer.isActive,
      joinedAt: customer.createdAt,
      orderCount: stats.orderCount,
      totalSpent: stats.totalSpent,
      lastOrderDate: stats.lastOrderDate,
    };
  });

  res.status(200).json({
    success: true,
    count: enrichedCustomers.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    data: enrichedCustomers,
  });
});

/**
 * @route   GET /api/admin/customers/:id
 * @desc    Get single customer profile with addresses and orders list
 * @access  Private (Admin)
 */
export const getCustomerByIdAdmin = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!customer) {
    return res.status(404).json({ success: false, message: 'Customer not found' });
  }

  const [orders, spending] = await Promise.all([
    Order.find({ user: customer._id }).sort({ createdAt: -1 }),
    Order.aggregate([
      {
        $match: { user: customer._id, orderStatus: { $nin: ['cancelled'] } },
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$pricing.total' },
          orderCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  res.status(200).json({
    success: true,
    data: {
      customer: {
        _id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        isActive: customer.isActive,
        joinedAt: customer.createdAt,
        orderCount: spending[0]?.orderCount || 0,
        totalSpent: spending[0]?.totalSpent || 0,
      },
      orders,
    },
  });
});

/**
 * @route   GET /api/admin/settings
 * @desc    Get store configuration settings
 * @access  Private (Admin)
 */
export const getSettingsAdmin = asyncHandler(async (req, res) => {
  import('../models/Settings.js');
  const Settings = (await import('../models/Settings.js')).default;
  const settings = await Settings.getSettings();

  res.status(200).json({
    success: true,
    data: settings,
  });
});

/**
 * @route   PATCH /api/admin/settings
 * @desc    Update store configuration settings
 * @access  Private (Admin)
 */
export const updateSettingsAdmin = asyncHandler(async (req, res) => {
  const Settings = (await import('../models/Settings.js')).default;
  let settings = await Settings.getSettings();

  const {
    shippingFee,
    freeShippingThreshold,
    gstPercentage,
    isCodEnabled,
    storeContact,
  } = req.body;

  if (shippingFee !== undefined) settings.shippingFee = Number(shippingFee);
  if (freeShippingThreshold !== undefined)
    settings.freeShippingThreshold = Number(freeShippingThreshold);
  if (gstPercentage !== undefined) settings.gstPercentage = Number(gstPercentage);
  if (isCodEnabled !== undefined) settings.isCodEnabled = !!isCodEnabled;
  if (storeContact && typeof storeContact === 'object') {
    settings.storeContact = {
      ...settings.storeContact.toObject(),
      ...storeContact,
    };
  }

  await settings.save();

  res.status(200).json({
    success: true,
    message: 'Store settings updated successfully',
    data: settings,
  });
});

/**
 * @route   GET /api/settings
 * @desc    Public store settings (shipping thresholds, COD status)
 * @access  Public
 */
export const getPublicSettings = asyncHandler(async (req, res) => {
  const Settings = (await import('../models/Settings.js')).default;
  const settings = await Settings.getSettings();

  res.status(200).json({
    success: true,
    data: {
      shippingFee: settings.shippingFee,
      freeShippingThreshold: settings.freeShippingThreshold,
      gstPercentage: settings.gstPercentage,
      isCodEnabled: settings.isCodEnabled,
      storeContact: settings.storeContact,
    },
  });
});

export default {
  getDashboardStats,
  getCustomersAdmin,
  getCustomerByIdAdmin,
  getSettingsAdmin,
  updateSettingsAdmin,
  getPublicSettings,
};
