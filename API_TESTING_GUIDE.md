# API Testing Guide - PayPal Integration

## 🚀 Quick Start

### Prerequisites
1. MongoDB running (local or Atlas)
2. Environment variables set in `.env`
3. Dev server running: `npm run dev`

---

## 📋 API Endpoints

### 1. **PayPal Payment API**
**Endpoint:** `POST /api/paypal`

#### Actions Available:

##### A. Create Initial Payment
Creates a PayPal order for initial payment.

**Request:**
```json
{
  "action": "initial_payment",
  "user_id": "user_mongodb_id",
  "order_id": "order_mongodb_id"
}
```

**Response:**
```json
{
  "success": true,
  "order_id": "PAYPAL_ORDER_ID",
  "approval_url": "https://www.sandbox.paypal.com/..."
}
```

---

##### B. Capture Payment
Captures an approved PayPal payment.

**Request:**
```json
{
  "action": "capture_payment",
  "paypal_order_id": "PAYPAL_ORDER_ID",
  "order_id": "order_mongodb_id"
}
```

**Response:**
```json
{
  "success": true,
  "capture": { ... },
  "payment": { ... }
}
```

---

##### C. Create Vault Setup
Creates a setup token for saving PayPal account.

**Request:**
```json
{
  "action": "create_vault_setup",
  "user_id": "user_mongodb_id"
}
```

**Response:**
```json
{
  "success": true,
  "setup_token": "SETUP_TOKEN_ID"
}
```

---

##### D. Create Payment Token
Converts setup token to payment token.

**Request:**
```json
{
  "action": "create_payment_token",
  "setup_token": "SETUP_TOKEN_ID"
}
```

**Response:**
```json
{
  "success": true,
  "payment_token": {
    "id": "TOKEN_ID",
    ...
  }
}
```

---

##### E. Charge Saved Method
Charges a saved PayPal account.

**Request:**
```json
{
  "action": "charge_saved_method",
  "payment_method_token": "saved_token",
  "amount": 50.00,
  "order_id": "order_mongodb_id"
}
```

**Response:**
```json
{
  "success": true,
  "capture": { ... },
  "payment": { ... }
}
```

---

##### F. Create Subscription
Creates PayPal subscription for installments.

**Request:**
```json
{
  "action": "create_subscription",
  "order_id": "order_mongodb_id"
}
```

**Response:**
```json
{
  "success": true,
  "approval_url": "https://www.sandbox.paypal.com/..."
}
```

---

##### G. Cancel Subscription
Cancels an active subscription.

**Request:**
```json
{
  "action": "cancel_subscription",
  "subscription_id": "PAYPAL_SUBSCRIPTION_ID"
}
```

**Response:**
```json
{
  "success": true
}
```

---

### 2. **User Payment Methods API**

#### A. Get Payment Methods
**Endpoint:** `GET /api/user/[user_id]/payment-methods`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "method_id",
      "provider": "paypal",
      "token": "payment_token",
      "is_default": true,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

#### B. Add Payment Method
**Endpoint:** `POST /api/user/[user_id]/payment-methods`

**Request:**
```json
{
  "provider": "paypal",
  "token": "payment_token_from_paypal",
  "is_default": true,
  "vault_id": "optional_vault_id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "new_method_id",
    "provider": "paypal",
    "token": "payment_token",
    "is_default": true
  }
}
```

---

#### C. Update Payment Method
**Endpoint:** `PUT /api/user/[user_id]/payment-methods`

**Request:**
```json
{
  "payment_method_id": "method_id",
  "is_default": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "method_id",
    "is_default": true,
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### D. Delete Payment Method
**Endpoint:** `DELETE /api/user/[user_id]/payment-methods?payment_method_id=METHOD_ID`

**Response:**
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

---

## 🧪 Testing with cURL

### Test PayPal Vault Setup

```bash
curl -X POST http://localhost:3000/api/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create_vault_setup",
    "user_id": "YOUR_USER_ID"
  }'
```

### Test Save Payment Method

```bash
curl -X POST http://localhost:3000/api/user/YOUR_USER_ID/payment-methods \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "paypal",
    "token": "test_token",
    "is_default": true
  }'
```

### Test Get Payment Methods

```bash
curl http://localhost:3000/api/user/YOUR_USER_ID/payment-methods
```

### Test Initial Payment

```bash
curl -X POST http://localhost:3000/api/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "action": "initial_payment",
    "user_id": "YOUR_USER_ID",
    "order_id": "YOUR_ORDER_ID"
  }'
```

### Test Capture Payment

```bash
curl -X POST http://localhost:3000/api/paypal \
  -H "Content-Type: application/json" \
  -d '{
    "action": "capture_payment",
    "paypal_order_id": "PAYPAL_ORDER_ID",
    "order_id": "YOUR_ORDER_ID"
  }'
```

---

## 🧪 Testing with Postman

### Import Collection

Create a new Postman collection with these requests:

1. **Create Vault Setup**
   - Method: POST
   - URL: `http://localhost:3000/api/paypal`
   - Body (JSON):
     ```json
     {
       "action": "create_vault_setup",
       "user_id": "{{user_id}}"
     }
     ```

2. **Save Payment Method**
   - Method: POST
   - URL: `http://localhost:3000/api/user/{{user_id}}/payment-methods`
   - Body (JSON):
     ```json
     {
       "provider": "paypal",
       "token": "test_token",
       "is_default": true
     }
     ```

3. **Get Payment Methods**
   - Method: GET
   - URL: `http://localhost:3000/api/user/{{user_id}}/payment-methods`

---

## 🔍 Testing Checklist

Before going live, test these scenarios:

### ✅ Payment Method Management
- [ ] Create vault setup token
- [ ] Save PayPal payment method
- [ ] Get user's payment methods
- [ ] Set payment method as default
- [ ] Delete payment method

### ✅ One-Time Payments (Instant Plans)
- [ ] Create initial payment order
- [ ] User approves payment in PayPal
- [ ] Capture payment successfully
- [ ] Payment record created in database
- [ ] Order status updated to 'full_paid'

### ✅ Saved Payment Methods
- [ ] Charge saved PayPal account
- [ ] Payment processed without user approval
- [ ] Payment record created
- [ ] Order status updated

### ✅ Installment Plans
- [ ] Create initial payment (impression kit)
- [ ] Capture initial payment
- [ ] Order status updated to 'kit_paid'
- [ ] Create PayPal subscription
- [ ] Subscription record created in database

### ✅ Subscription Management
- [ ] Create subscription for installments
- [ ] User approves subscription
- [ ] Cancel subscription
- [ ] Subscription status updated to 'cancelled'

### ✅ Error Handling
- [ ] Invalid user ID
- [ ] Invalid order ID
- [ ] PayPal API errors
- [ ] Network failures
- [ ] Duplicate payment attempts

---

## 🐛 Common Issues & Solutions

### Issue: "PayPal auth failed"
**Solution:**
- Check `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` in .env
- Verify you're using sandbox credentials for testing
- Check PayPal Developer Dashboard for API access

### Issue: "MongoDB connection failed"
**Solution:**
- Check `MONGODB_URI` in .env
- Ensure MongoDB is running
- Verify network connectivity

### Issue: "User not found"
**Solution:**
- Create a user first or use existing user ID
- Check user ID format (must be valid MongoDB ObjectId)

### Issue: "Order not found"
**Solution:**
- Create an order first
- Verify order ID is correct
- Check order exists in database

---

## 📊 Expected Flow

### Full Payment Flow (Instant Plan):

1. **User selects instant plan**
2. **Frontend calls:** `POST /api/paypal` (action: initial_payment)
3. **User approves in PayPal popup**
4. **Frontend calls:** `POST /api/paypal` (action: capture_payment)
5. **Backend creates payment record**
6. **Backend updates order status to 'full_paid'**
7. **User redirected to success page**

### Installment Payment Flow:

1. **User selects installment plan**
2. **Frontend calls:** `POST /api/paypal` (action: initial_payment)
3. **User approves initial payment**
4. **Frontend calls:** `POST /api/paypal` (action: capture_payment)
5. **Backend updates order status to 'kit_paid'**
6. **Admin marks kit as received**
7. **Admin creates aligner**
8. **Backend calls:** `POST /api/paypal` (action: create_subscription)
9. **User approves subscription**
10. **PayPal automatically charges installments**

---

## 🎯 Testing Priority

Test in this order:

1. **Environment Setup** ⭐⭐⭐
   - .env configuration
   - MongoDB connection
   - PayPal credentials

2. **Basic API** ⭐⭐⭐
   - GET /api/products
   - GET /api/installment-plans
   - User authentication

3. **Payment Methods** ⭐⭐⭐
   - Save PayPal account
   - Get saved methods
   - Set default method

4. **One-Time Payments** ⭐⭐⭐
   - Create order
   - Process payment
   - Verify payment record

5. **Subscriptions** ⭐⭐
   - Create subscription
   - Verify in PayPal Dashboard
   - Test webhook notifications

---

## 📝 Notes

- Always use **sandbox** environment for testing
- Test with **real PayPal sandbox accounts**
- Check **browser console** for frontend errors
- Check **terminal logs** for backend errors
- Verify data in **MongoDB** after each operation
- Check **PayPal Developer Dashboard** for transaction logs

---

## 🚀 Ready to Test!

1. Ensure `.env` is configured
2. Start dev server: `npm run dev`
3. Open Postman or use cURL
4. Follow the testing checklist above
5. Report any issues

Happy testing! 🎉
