# 📦 Add Sample Data to Database

Your database is currently **empty**. You need to add:
1. **Products** (Impression Kit & Aligners)
2. **Installment Plans** (Payment options)

---

## 🚀 **Method 1: Run Seed Script (EASIEST)**

### Step 1: Make sure MongoDB is connected
```bash
# Your .env should have MongoDB Atlas connection string
# Start the server first
npm run dev
```

### Step 2: Run the seed script
```bash
node scripts/seed-database.js
```

**Expected Output:**
```
✅ Connected to MongoDB
🧹 Clearing existing data...
✅ Cleared existing data

📦 Inserting products...
✅ Inserted 2 products:
   - Impression Kit: $5 (impression-kit)
   - Custom Clear Aligners: $1800 (aligners)

💳 Inserting installment plans...
✅ Inserted 4 installment plans:
   - Pay in Full (Save 10%)
   - 3 Monthly Payments
   - 6 Monthly Payments
   - 4 Weekly Payments

🎉 Database seeded successfully!
```

---

## 🔧 **Method 2: Use API Endpoints (Manual)**

If the seed script doesn't work, you can add data manually using the API:

### A. Add Installment Plans

```bash
# Plan 1: Pay in Full (Instant)
curl -X POST http://localhost:3000/api/installment-plans \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "instant",
    "num_installments": 0,
    "description": "Pay in Full (Save 10%)"
  }'

# Plan 2: 3 Monthly Payments
curl -X POST http://localhost:3000/api/installment-plans \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "monthly",
    "num_installments": 3,
    "description": "3 Monthly Payments"
  }'

# Plan 3: 6 Monthly Payments
curl -X POST http://localhost:3000/api/installment-plans \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "monthly",
    "num_installments": 6,
    "description": "6 Monthly Payments"
  }'

# Plan 4: 4 Weekly Payments
curl -X POST http://localhost:3000/api/installment-plans \
  -H "Content-Type: application/json" \
  -d '{
    "frequency": "weekly",
    "num_installments": 4,
    "description": "4 Weekly Payments"
  }'
```

### B. Add Products (Requires Admin Auth)

**Note:** Adding products requires admin authentication. You need to:
1. Create an admin user first
2. Login to get auth token
3. Use token in product creation

**For now, use the seed script instead (Method 1)**

---

## 🧪 **Method 3: Use MongoDB Compass (GUI)**

### Step 1: Download MongoDB Compass
- Visit: https://www.mongodb.com/try/download/compass
- Download and install

### Step 2: Connect to Your Database
- Open Compass
- Paste your connection string from `.env`
- Click "Connect"

### Step 3: Add Data Manually
1. Select database: `hehe-aligners`
2. Create collection: `products`
3. Insert documents:

**Impression Kit:**
```json
{
  "name": "Impression Kit",
  "description": "Professional dental impression kit",
  "price": 5.00,
  "discountPrice": 0,
  "type": "impression-kit",
  "isActive": true,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

**Aligners:**
```json
{
  "name": "Custom Clear Aligners",
  "description": "Personalized clear aligners",
  "price": 1800.00,
  "discountPrice": 10,
  "type": "aligners",
  "isActive": true,
  "createdAt": { "$date": "2024-01-01T00:00:00.000Z" },
  "updatedAt": { "$date": "2024-01-01T00:00:00.000Z" }
}
```

4. Create collection: `installmentplans`
5. Insert documents (same as in seed script)

---

## ✅ **Verify Data Was Added**

### Test the APIs:

**Get Products:**
```bash
curl http://localhost:3000/api/products
```

**Expected Response:**
```json
[
  {
    "_id": "...",
    "name": "Impression Kit",
    "price": 5,
    "type": "impression-kit",
    ...
  },
  {
    "_id": "...",
    "name": "Custom Clear Aligners",
    "price": 1800,
    "type": "aligners",
    ...
  }
]
```

**Get Installment Plans:**
```bash
curl http://localhost:3000/api/installment-plans
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "frequency": "instant",
      "num_installments": 0,
      "description": "Pay in Full (Save 10%)"
    },
    ...
  ]
}
```

---

## 🌐 **Test in Browser**

Once data is added, visit:
- http://localhost:3000 - Homepage should show payment plans
- http://localhost:3000/api/products - Should return 2 products
- http://localhost:3000/api/installment-plans - Should return 4 plans

---

## 📊 **Sample Data Included**

### Products (2):
1. **Impression Kit** - $5.00
2. **Custom Clear Aligners** - $1,800.00 (10% discount for instant payment)

### Installment Plans (4):
1. **Pay in Full (Save 10%)** - Instant payment
2. **3 Monthly Payments** - $600/month
3. **6 Monthly Payments** - $300/month
4. **4 Weekly Payments** - $450/week

---

## 🎯 **Recommended: Use Method 1 (Seed Script)**

It's the fastest and most reliable:

```bash
# 1. Make sure server is running
npm run dev

# 2. Open new terminal
# 3. Run seed script
node scripts/seed-database.js
```

**That's it!** Your database will be populated with sample data.

---

## 🐛 **Troubleshooting**

### Error: "Cannot find module 'dotenv'"
```bash
npm install dotenv
```

### Error: "Connection failed"
- Check MongoDB Atlas connection string in `.env`
- Verify your IP is whitelisted in MongoDB Atlas
- Check internet connection

### Error: "E11000 duplicate key error"
- Data already exists
- Run the script again (it clears old data first)

---

## ✨ **Next Steps**

After adding data:
1. ✅ Homepage will show payment plans
2. ✅ Checkout will work
3. ✅ Can test PayPal payments
4. ✅ Ready for full testing

---

**Run the seed script now to populate your database!** 🚀

```bash
node scripts/seed-database.js
```
