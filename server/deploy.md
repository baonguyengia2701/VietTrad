# 🚀 Backend Deployment Guide

## Option 1: Render (Khuyến nghị - Free tier)

1. **Truy cập:** https://render.com
2. **Đăng ký/Đăng nhập** bằng GitHub
3. **New +** → **Web Service**
4. **Connect repository:** viettrad
5. **Cấu hình:**
   - **Name:** `viettrad-backend`
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Auto-Deploy:** Yes

6. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/viettrad?retryWrites=true&w=majority
   JWT_SECRET=your-super-secure-jwt-secret-key-min-32-characters
   REFRESH_TOKEN_SECRET=your-refresh-token-secret
   CLIENT_URL=https://viettradv1.web.app
   EMAIL_USERNAME=your-gmail@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=your-gmail@gmail.com
   ```

## Option 2: Railway

1. **Truy cập:** https://railway.app
2. **Đăng nhập** bằng GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Chọn repository:** viettrad
5. **Root Directory:** `server`
6. **Environment Variables:** (như trên)

## Option 3: Google Cloud Run

```bash
# 1. Build và push Docker image
gcloud builds submit --tag gcr.io/PROJECT_ID/viettrad-backend

# 2. Deploy lên Cloud Run
gcloud run deploy viettrad-backend \
  --image gcr.io/PROJECT_ID/viettrad-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,MONGO_URI=your_uri,JWT_SECRET=your_secret
```

## Option 4: Heroku

```bash
# 1. Cài Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
# 2. Đăng nhập
heroku login

# 3. Tạo app
heroku create viettrad-backend

# 4. Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set CLIENT_URL=https://viettradv1.web.app

# 5. Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## ⚠️ Lưu ý quan trọng:

1. **MongoDB Atlas**: Cần setup MongoDB Atlas cloud database
2. **Environment Variables**: Đảm bảo set đúng tất cả biến môi trường
3. **CORS**: Update CLIENT_URL để Frontend có thể gọi API
4. **Domain**: Sau khi deploy, cập nhật REACT_APP_API_URL trong frontend

## 🔄 Cập nhật Frontend sau khi deploy backend:

Trong `client/src/config/api.js`, cập nhật:
```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-url.com/api'  // URL từ Render/Railway/Cloud Run
  : 'http://localhost:5000/api';
```

Sau đó build và deploy lại frontend:
```bash
cd client
npm run build
firebase deploy
``` 