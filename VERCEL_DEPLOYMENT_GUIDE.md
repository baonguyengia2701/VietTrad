# 🚀 Vercel Deployment Guide & Troubleshooting

## ⚠️ **Quan trọng: Phân biệt Frontend vs Backend**

### **✅ Khuyến nghị:**
- **Frontend (React):** Deploy lên **Firebase Hosting** (như bạn đã làm)
- **Backend (Node.js):** Deploy lên **Render/Railway** (miễn phí, dễ hơn)

### **❌ Vấn đề với Vercel cho Backend:**
- Vercel tối ưu cho frontend và serverless functions
- Express.js server khó config trên Vercel
- Render/Railway phù hợp hơn cho full backend

---

## 🔧 **Nếu vẫn muốn deploy Backend lên Vercel:**

### **Bước 1: Tạo file `vercel.json`**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

### **Bước 2: Update package.json**
```json
{
  "scripts": {
    "start": "node server.js",
    "build": "echo 'No build step required'",
    "vercel-build": "echo 'Building for Vercel'"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### **Bước 3: Environment Variables trên Vercel**
1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. **Add variables:**
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://baonguyengia2701:4l79cXckllIkTi56@viettrad.nsmhzg6.mongodb.net/viettrad?retryWrites=true&w=majority
   JWT_SECRET=c9c565947437f901714128f3e4bcb99e5662e1fa3e330c0ea4933daaa8d5e661
   REFRESH_TOKEN_SECRET=fc0f58ec73c79f2df7e9fd9021bee3a9431334d7ff6260ccc86df09827d2e70b
   CLIENT_URL=https://viettradv1.web.app
   ```

---

## 🚨 **Troubleshooting "Exited with status" Errors:**

### **Common Status Codes:**
- **Status 1:** Build command failed
- **Status 125:** Container/runtime error  
- **Status 127:** Command not found
- **Status 130:** Process interrupted

### **Debug Steps:**

#### **1. Check Build Logs**
- Vercel Dashboard → Deployments → Click failed deployment
- Scroll down to "Build Logs"
- Look for specific error messages

#### **2. Common Fixes:**

**a) Missing dependencies:**
```bash
npm install --save-dev @vercel/node
```

**b) Wrong Node version:**
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

**c) Environment variables:**
- Check all required variables are set
- No spaces in variable names
- String values don't need quotes

**d) File paths:**
- Ensure `server.js` is in root of deployed folder
- Check import paths are correct

#### **3. Test Locally:**
```bash
# Test build process
npm run build

# Test start command
npm start

# Check for any errors
```

---

## 💡 **Recommended Solution: Use Render Instead**

### **Why Render is Better for VietTrad Backend:**

✅ **Pros:**
- Free tier with 750 hours/month
- Perfect for Express.js apps
- Easy environment variables
- Auto-deploy from GitHub
- Better for long-running processes

❌ **Vercel Cons for Backend:**
- Complex serverless configuration
- Function timeout limits (10s for free)
- Not designed for traditional Express apps

### **Deploy to Render in 5 minutes:**

1. **https://render.com** → Sign up
2. **New Web Service** → Connect GitHub
3. **Repository:** VietTrad
4. **Settings:**
   ```
   Name: viettrad-backend
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```
5. **Environment Variables:** (copy từ .env)
6. **Deploy!**

**Result:** `https://viettrad-backend.onrender.com`

---

## 🔄 **Current Architecture (Recommended):**

```
Frontend: Firebase Hosting (✅ Working)
↓ API calls
Backend: Render (🚀 Deploy here)
↓ Database
MongoDB Atlas (✅ Working)
```

---

## 🆘 **If Still Want Vercel, Debug Steps:**

### **1. Check specific error:**
```bash
# Look at the full error message in Vercel logs
# Common patterns:
- "Module not found" → Missing dependency
- "Command failed" → Wrong script
- "Process exited" → Runtime error
```

### **2. Simplify deployment:**
```javascript
// Create simple test file: api/test.js
export default function handler(req, res) {
  res.status(200).json({ message: 'Test API working!' });
}
```

### **3. Test environment:**
- Deploy simple version first
- Add complexity gradually
- Test each step

---

## 🎯 **Recommendation:**

**Skip Vercel for backend.** Deploy to **Render** instead:

1. **Faster setup** (5 minutes vs hours of debugging)
2. **Better compatibility** with Express.js
3. **Free tier** sufficient for your needs
4. **Easier troubleshooting**

**Keep Vercel** for frontend projects only.

**Current working setup:**
- ✅ Frontend: Firebase → `https://viettradv1.web.app`
- 🚀 Backend: Render → `https://viettrad-backend.onrender.com`
- ✅ Database: MongoDB Atlas → Working

This is the most reliable stack for VietTrad! 🎉 