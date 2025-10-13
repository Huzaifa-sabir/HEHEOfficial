import connectDB from "@lib/mongodb";
import { NextResponse } from "next/server";
import Order from "@app/models/Order";
import Payment from "@app/models/Payment";
import Subscription from "@app/models/Subscription";
import User from "@app/models/User";
// import stripeService from "@lib/stripe"; // Commented out - using PayPal only

// GET /api/admin/stats - Get admin statistics
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";
    const timeframe = searchParams.get("timeframe") || "30";
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        created_at: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    } else {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe));
      dateFilter = {
        created_at: { $gte: daysAgo }
      };
    }

    switch (type) {
      case "overview":
        return await getOverviewStats(dateFilter);
      case "orders":
        return await getOrderStats(dateFilter);
      case "payments":
        return await getPaymentStats(dateFilter);
      case "subscriptions":
        return await getSubscriptionStats(dateFilter);
      case "revenue":
        return await getRevenueStats(dateFilter);
      case "users":
        return await getUserStats(dateFilter);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid stats type" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/stats - Perform admin actions
export async function POST(request) {
  try {
    await connectDB();

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case "sync_all_subscriptions":
        return await handleSyncAllSubscriptions(data);
      case "bulk_order_update":
        return await handleBulkOrderUpdate(data);
      case "generate_report":
        return await handleGenerateReport(data);
      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 }
        );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Get overview statistics
async function getOverviewStats(dateFilter) {
  try {
    const [
      totalOrders,
      totalUsers,
      totalRevenue,
      activeSubscriptions,
      ordersByStatus,
      recentOrders,
      revenueByMonth
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      User.countDocuments(dateFilter),
      Payment.aggregate([
        { $match: { ...dateFilter, status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Subscription.countDocuments({ status: "active" }),
      Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Order.find(dateFilter)
        .populate("user_id", "name email")
        .sort({ created_at: -1 })
        .limit(10),
      Payment.aggregate([
        {
          $match: { status: "succeeded" }
        },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            revenue: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ])
    ]);

    const revenue = totalRevenue[0]?.total || 0;
    const statusCounts = ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          total_orders: totalOrders,
          total_users: totalUsers,
          total_revenue: revenue,
          active_subscriptions: activeSubscriptions,
          average_order_value: totalOrders > 0 ? revenue / totalOrders : 0
        },
        order_status_breakdown: statusCounts,
        recent_orders: recentOrders,
        revenue_trend: revenueByMonth
      }
    });
  } catch (error) {
    throw new Error(`Failed to get overview stats: ${error.message}`);
  }
}

// Get detailed order statistics
async function getOrderStats(dateFilter) {
  try {
    const [
      ordersByStatus,
      ordersByProvider,
      orderTrends,
      conversionRates
    ] = await Promise.all([
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total_value: { $sum: "$total_amount" },
            avg_value: { $avg: "$total_amount" }
          }
        }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$provider",
            count: { $sum: 1 },
            total_value: { $sum: "$total_amount" }
          }
        }
      ]),
      Order.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" },
              day: { $dayOfMonth: "$created_at" }
            },
            count: { $sum: 1 },
            value: { $sum: "$total_amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        { $limit: 30 }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            total_orders: { $sum: 1 },
            kit_paid: {
              $sum: {
                $cond: [
                  { $ne: ["$status", "pending"] },
                  1,
                  0
                ]
              }
            },
            subscription_active: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "subscription_active"] },
                  1,
                  0
                ]
              }
            },
            completed: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "completed"] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ])
    ]);

    const conversion = conversionRates[0] || {};
    const conversionMetrics = {
      kit_payment_rate: conversion.total_orders > 0 ? 
        (conversion.kit_paid / conversion.total_orders) * 100 : 0,
      subscription_activation_rate: conversion.kit_paid > 0 ? 
        (conversion.subscription_active / conversion.kit_paid) * 100 : 0,
      completion_rate: conversion.subscription_active > 0 ? 
        (conversion.completed / conversion.subscription_active) * 100 : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        orders_by_status: ordersByStatus,
        orders_by_provider: ordersByProvider,
        order_trends: orderTrends,
        conversion_metrics: conversionMetrics
      }
    });
  } catch (error) {
    throw new Error(`Failed to get order stats: ${error.message}`);
  }
}

// Get payment statistics
async function getPaymentStats(dateFilter) {
  try {
    const [
      paymentsByStatus,
      paymentsByType,
      failedPayments,
      refundedPayments,
      paymentTrends
    ] = await Promise.all([
      Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total_amount: { $sum: "$amount" }
          }
        }
      ]),
      Payment.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: { $cond: ["$is_initial", "initial", "installment"] },
            count: { $sum: 1 },
            total_amount: { $sum: "$amount" }
          }
        }
      ]),
      Payment.find({ 
        ...dateFilter, 
        status: { $in: ["failed", "past_due"] } 
      })
        .populate("order_id", "user_id status")
        .sort({ created_at: -1 })
        .limit(20),
      Payment.find({ 
        ...dateFilter, 
        status: "refunded" 
      })
        .populate("order_id", "user_id status")
        .sort({ created_at: -1 })
        .limit(20),
      Payment.aggregate([
        { $match: { status: "succeeded" } },
        {
          $group: {
            _id: {
              year: { $year: "$paid_at" },
              month: { $month: "$paid_at" },
              day: { $dayOfMonth: "$paid_at" }
            },
            count: { $sum: 1 },
            amount: { $sum: "$amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
        { $limit: 30 }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        payments_by_status: paymentsByStatus,
        payments_by_type: paymentsByType,
        failed_payments: failedPayments,
        refunded_payments: refundedPayments,
        payment_trends: paymentTrends
      }
    });
  } catch (error) {
    throw new Error(`Failed to get payment stats: ${error.message}`);
  }
}

// Get subscription statistics
async function getSubscriptionStats(dateFilter) {
  try {
    const [
      subscriptionsByStatus,
      subscriptionMetrics,
      churningSubscriptions,
      subscriptionTrends
    ] = await Promise.all([
      Subscription.aggregate([
        { $match: dateFilter },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total_installments: { $sum: "$total_installments" },
            completed_installments: { $sum: "$completed_installments" }
          }
        }
      ]),
      Subscription.aggregate([
        {
          $group: {
            _id: null,
            total_subscriptions: { $sum: 1 },
            active_subscriptions: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "active"] },
                  1,
                  0
                ]
              }
            },
            avg_installment_amount: { $avg: "$installment_amount" },
            total_recurring_revenue: {
              $sum: {
                $cond: [
                  { $eq: ["$status", "active"] },
                  "$installment_amount",
                  0
                ]
              }
            }
          }
        }
      ]),
      Subscription.find({
        status: { $in: ["past_due", "cancelled"] },
        updated_at: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
        .populate("order_id", "user_id")
        .sort({ updated_at: -1 })
        .limit(20),
      Subscription.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            new_subscriptions: { $sum: 1 },
            total_value: { $sum: "$installment_amount" }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ])
    ]);

    const metrics = subscriptionMetrics[0] || {};
    const churnRate = metrics.total_subscriptions > 0 ? 
      ((metrics.total_subscriptions - metrics.active_subscriptions) / metrics.total_subscriptions) * 100 : 0;

    return NextResponse.json({
      success: true,
      data: {
        subscriptions_by_status: subscriptionsByStatus,
        subscription_metrics: {
          ...metrics,
          churn_rate: churnRate,
          retention_rate: 100 - churnRate
        },
        churning_subscriptions: churningSubscriptions,
        subscription_trends: subscriptionTrends
      }
    });
  } catch (error) {
    throw new Error(`Failed to get subscription stats: ${error.message}`);
  }
}

// Get revenue statistics
async function getRevenueStats(dateFilter) {
  try {
    const [
      revenueByPeriod,
      revenueBySource,
      topProducts,
      projectedRevenue
    ] = await Promise.all([
      Payment.aggregate([
        { $match: { status: "succeeded" } },
        {
          $group: {
            _id: {
              year: { $year: "$paid_at" },
              month: { $month: "$paid_at" }
            },
            total_revenue: { $sum: "$amount" },
            payment_count: { $sum: 1 },
            initial_payments: {
              $sum: {
                $cond: ["$is_initial", "$amount", 0]
              }
            },
            installment_payments: {
              $sum: {
                $cond: [
                  { $not: "$is_initial" },
                  "$amount",
                  0
                ]
              }
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ]),
      Payment.aggregate([
        { $match: { status: "succeeded" } },
        {
          $group: {
            _id: { $cond: ["$is_initial", "initial_payment", "installment"] },
            revenue: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]),
      Order.aggregate([
        {
          $lookup: {
            from: "payments",
            localField: "_id",
            foreignField: "order_id",
            as: "payments"
          }
        },
        {
          $group: {
            _id: "$aligner_product_id",
            order_count: { $sum: 1 },
            total_revenue: {
              $sum: {
                $reduce: {
                  input: "$payments",
                  initialValue: 0,
                  in: {
                    $add: [
                      "$$value",
                      {
                        $cond: [
                          { $eq: ["$$this.status", "succeeded"] },
                          "$$this.amount",
                          0
                        ]
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        { $sort: { total_revenue: -1 } },
        { $limit: 10 }
      ]),
      Subscription.aggregate([
        { $match: { status: "active" } },
        {
          $group: {
            _id: null,
            monthly_recurring_revenue: { $sum: "$installment_amount" },
            active_subscriptions: { $sum: 1 }
          }
        }
      ])
    ]);

    const projectedMRR = projectedRevenue[0]?.monthly_recurring_revenue || 0;

    return NextResponse.json({
      success: true,
      data: {
        revenue_by_period: revenueByPeriod,
        revenue_by_source: revenueBySource,
        top_products: topProducts,
        projected_revenue: {
          monthly_recurring_revenue: projectedMRR,
          annual_recurring_revenue: projectedMRR * 12,
          active_subscriptions: projectedRevenue[0]?.active_subscriptions || 0
        }
      }
    });
  } catch (error) {
    throw new Error(`Failed to get revenue stats: ${error.message}`);
  }
}

// Get user statistics
async function getUserStats(dateFilter) {
  try {
    const [
      usersByStatus,
      userGrowth,
      topCustomers
    ] = await Promise.all([
      User.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user_id",
            as: "orders"
          }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $gt: [{ $size: "$orders" }, 0] },
                "customer",
                "user"
              ]
            },
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" }
            },
            new_users: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $limit: 12 }
      ]),
      User.aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "user_id",
            as: "orders"
          }
        },
        {
          $lookup: {
            from: "payments",
            localField: "orders._id",
            foreignField: "order_id",
            as: "payments"
          }
        },
        {
          $match: {
            "orders.0": { $exists: true }
          }
        },
        {
          $project: {
            name: 1,
            email: 1,
            order_count: { $size: "$orders" },
            total_spent: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: "$payments",
                      cond: { $eq: ["$this.status", "succeeded"] }
                    }
                  },
                  as: "payment",
                  in: "$payment.amount"
                }
              }
            }
          }
        },
        { $sort: { total_spent: -1 } },
        { $limit: 10 }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        users_by_status: usersByStatus,
        user_growth: userGrowth,
        top_customers: topCustomers
      }
    });
  } catch (error) {
    throw new Error(`Failed to get user stats: ${error.message}`);
  }
}

// Handle sync all subscriptions
async function handleSyncAllSubscriptions(data) {
  try {
    // Stripe functionality disabled - using PayPal only
    return NextResponse.json({
      success: false,
      error: "Stripe sync not available - using PayPal only"
    }, { status: 501 });
  } catch (error) {
    throw new Error(`Failed to sync subscriptions: ${error.message}`);
  }
}

// Handle bulk order update
async function handleBulkOrderUpdate(data) {
  try {
    const { order_ids, status, action } = data;

    if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
      throw new Error("Order IDs array is required");
    }

    let updateData = {};
    
    if (status) {
      updateData.status = status;
      updateData.updated_at = new Date();
    }

    const result = await Order.updateMany(
      { _id: { $in: order_ids } },
      { $set: updateData }
    );

    // If action is to cancel subscriptions, handle that
    if (action === "cancel_subscriptions") {
      const orders = await Order.find({ _id: { $in: order_ids } });
      
      for (const order of orders) {
        try {
          const subscription = await Subscription.findOne({ order_id: order._id });
          if (subscription) {
            // Update subscription status in database
            await Subscription.findByIdAndUpdate(
              subscription._id,
              { status: 'cancelled', updated_at: new Date() }
            );
          }
        } catch (error) {
          console.warn(`Failed to cancel subscription for order ${order._id}:`, error.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        modified_count: result.modifiedCount,
        matched_count: result.matchedCount
      }
    });
  } catch (error) {
    throw new Error(`Failed to bulk update orders: ${error.message}`);
  }
}

// Handle generate report
async function handleGenerateReport(data) {
  try {
    const { report_type, start_date, end_date, format = "json" } = data;
    
    const dateFilter = {};
    if (start_date && end_date) {
      dateFilter.created_at = {
        $gte: new Date(start_date),
        $lte: new Date(end_date)
      };
    }

    let reportData = {};

    switch (report_type) {
      case "revenue":
        reportData = await generateRevenueReport(dateFilter);
        break;
      case "orders":
        reportData = await generateOrdersReport(dateFilter);
        break;
      case "subscriptions":
        reportData = await generateSubscriptionsReport(dateFilter);
        break;
      case "customers":
        reportData = await generateCustomersReport(dateFilter);
        break;
      default:
        throw new Error("Invalid report type");
    }

    return NextResponse.json({
      success: true,
      data: {
        report_type,
        date_range: { start_date, end_date },
        generated_at: new Date().toISOString(),
        data: reportData
      }
    });
  } catch (error) {
    throw new Error(`Failed to generate report: ${error.message}`);
  }
}

// Generate revenue report
async function generateRevenueReport(dateFilter) {
  const [
    totalRevenue,
    revenueByMonth,
    revenueBySource,
    topProducts
  ] = await Promise.all([
    Payment.aggregate([
      { $match: { ...dateFilter, status: "succeeded" } },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 },
          avg: { $avg: "$amount" }
        }
      }
    ]),
    Payment.aggregate([
      { $match: { status: "succeeded" } },
      {
        $group: {
          _id: {
            year: { $year: "$paid_at" },
            month: { $month: "$paid_at" }
          },
          revenue: { $sum: "$amount" },
          transaction_count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Payment.aggregate([
      { $match: { ...dateFilter, status: "succeeded" } },
      {
        $group: {
          _id: { $cond: ["$is_initial", "initial", "installment"] },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]),
    Order.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: "payments",
          localField: "_id",
          foreignField: "order_id",
          as: "payments"
        }
      },
      {
        $project: {
          aligner_product_id: 1,
          total_revenue: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$payments",
                    cond: { $eq: ["$this.status", "succeeded"] }
                  }
                },
                as: "payment",
                in: "$payment.amount"
              }
            }
          }
        }
      },
      {
        $group: {
          _id: "$aligner_product_id",
          revenue: { $sum: "$total_revenue" },
          order_count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ])
  ]);

  return {
    summary: totalRevenue[0] || { total: 0, count: 0, avg: 0 },
    monthly_trend: revenueByMonth,
    revenue_sources: revenueBySource,
    top_products: topProducts
  };
}

// Generate orders report
async function generateOrdersReport(dateFilter) {
  const [
    orderSummary,
    ordersByStatus,
    conversionFunnel,
    orderTrends
  ] = await Promise.all([
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total_orders: { $sum: 1 },
          avg_order_value: { $avg: "$total_amount" },
          total_value: { $sum: "$total_amount" }
        }
      }
    ]),
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total_value: { $sum: "$total_amount" }
        }
      }
    ]),
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          kit_paid: { $sum: { $cond: [{ $ne: ["$status", "pending"] }, 1, 0] } },
          subscription_active: { $sum: { $cond: [{ $eq: ["$status", "subscription_active"] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } }
        }
      }
    ]),
    Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" }
          },
          count: { $sum: 1 },
          value: { $sum: "$total_amount" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ])
  ]);

  return {
    summary: orderSummary[0] || { total_orders: 0, avg_order_value: 0, total_value: 0 },
    status_breakdown: ordersByStatus,
    conversion_funnel: conversionFunnel[0] || {},
    daily_trends: orderTrends
  };
}

// Generate subscriptions report
async function generateSubscriptionsReport(dateFilter) {
  const [
    subscriptionSummary,
    statusBreakdown,
    churnAnalysis,
    revenueProjection
  ] = await Promise.all([
    Subscription.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          total_subscriptions: { $sum: 1 },
          avg_installment: { $avg: "$installment_amount" },
          total_installments: { $sum: "$total_installments" },
          completed_installments: { $sum: "$completed_installments" }
        }
      }
    ]),
    Subscription.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          total_revenue: { $sum: "$installment_amount" }
        }
      }
    ]),
    Subscription.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          new_subscriptions: { $sum: 1 },
          cancelled_subscriptions: {
            $sum: {
              $cond: [
                { $eq: ["$status", "cancelled"] },
                1,
                0
              ]
            }
          }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]),
    Subscription.aggregate([
      { $match: { status: "active" } },
      {
        $group: {
          _id: null,
          monthly_recurring_revenue: { $sum: "$installment_amount" },
          active_count: { $sum: 1 }
        }
      }
    ])
  ]);

  return {
    summary: subscriptionSummary[0] || {},
    status_breakdown: statusBreakdown,
    churn_analysis: churnAnalysis,
    revenue_projection: revenueProjection[0] || { monthly_recurring_revenue: 0, active_count: 0 }
  };
}

// Generate customers report
async function generateCustomersReport(dateFilter) {
  const [
    customerSummary,
    topCustomers,
    customerSegments,
    acquisitionTrends
  ] = await Promise.all([
    User.aggregate([
      { $match: dateFilter },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user_id",
          as: "orders"
        }
      },
      {
        $group: {
          _id: null,
          total_users: { $sum: 1 },
          customers: {
            $sum: {
              $cond: [
                { $gt: [{ $size: "$orders" }, 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]),
    User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user_id",
          as: "orders"
        }
      },
      {
        $lookup: {
          from: "payments",
          localField: "orders._id",
          foreignField: "order_id",
          as: "payments"
        }
      },
      {
        $match: {
          "orders.0": { $exists: true }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          created_at: 1,
          order_count: { $size: "$orders" },
          total_spent: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: "$payments",
                    cond: { $eq: ["$this.status", "succeeded"] }
                  }
                },
                as: "payment",
                in: "$payment.amount"
              }
            }
          }
        }
      },
      { $sort: { total_spent: -1 } },
      { $limit: 20 }
    ]),
    User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "user_id",
          as: "orders"
        }
      },
      {
        $project: {
          segment: {
            $cond: [
              { $eq: [{ $size: "$orders" }, 0] },
              "prospect",
              {
                $cond: [
                  { $eq: [{ $size: "$orders" }, 1] },
                  "new_customer",
                  "repeat_customer"
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: "$segment",
          count: { $sum: 1 }
        }
      }
    ]),
    User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          new_users: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ])
  ]);

  return {
    summary: customerSummary[0] || { total_users: 0, customers: 0 },
    top_customers: topCustomers,
    customer_segments: customerSegments,
    acquisition_trends: acquisitionTrends
  };
}