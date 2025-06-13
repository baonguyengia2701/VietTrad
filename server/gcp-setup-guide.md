# 🌐 Google Cloud Platform Setup Guide

## Bước 1: Thiết lập Billing Account

1. **Truy cập Google Cloud Console:**
   - Đi tới: https://console.cloud.google.com
   - Đăng nhập bằng tài khoản Google của bạn

2. **Thiết lập Billing:**
   - Vào **Billing** từ menu bên trái
   - **Create Billing Account** hoặc **Link existing billing account**
   - Nhập thông tin thẻ tín dụng (Google cung cấp $300 credit miễn phí)
   - **Lưu ý:** Google Cloud có free tier, bạn không bị charge nếu trong giới hạn

3. **Link Billing với Project:**
   - Chọn project `viettrad-backend-2024`
   - **Billing** → **Link a billing account**

## Bước 2: Enable APIs qua Console

1. **APIs & Services** → **Library**
2. Tìm và enable:
   - **Cloud Build API**
   - **Cloud Run API** 
   - **Container Registry API**
   - **Artifact Registry API** (recommended thay cho Container Registry)

## Bước 3: Deploy bằng CLI

Sau khi thiết lập billing, chạy lệnh:

```bash
# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com

# Set region
gcloud config set run/region us-central1

# Build và deploy
gcloud run deploy viettrad-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10
```

## Bước 4: Cấu hình Environment Variables

Sau khi deploy, cần set environment variables:

```bash
gcloud run services update viettrad-backend \
  --region us-central1 \
  --set-env-vars NODE_ENV=production \
  --set-env-vars MONGO_URI=your_mongodb_atlas_uri \
  --set-env-vars JWT_SECRET=your_jwt_secret_32_chars_min \
  --set-env-vars REFRESH_TOKEN_SECRET=your_refresh_secret \
  --set-env-vars CLIENT_URL=https://viettradv1.web.app \
  --set-env-vars EMAIL_USERNAME=your_gmail@gmail.com \
  --set-env-vars EMAIL_PASSWORD=your_app_password \
  --set-env-vars EMAIL_FROM=your_gmail@gmail.com
```

## Alternative: Deploy qua Console (Dễ hơn)

1. **Cloud Run** trong Console
2. **Create Service**
3. **Continuously deploy new revisions from a source repository**
4. **Set up with Cloud Build**
5. **Connect GitHub repository:** viettrad
6. **Branch:** main
7. **Build Configuration:**
   - **Build Type:** Dockerfile
   - **Source Location:** /server/Dockerfile
8. **Container, Variables, Connections, Security:**
   - **Container Port:** 8080
   - **Memory:** 512 MiB
   - **CPU:** 1
   - **Environment Variables:** (như trên)
   - **Allow unauthenticated invocations:** ✓
9. **Create**

## Lưu ý quan trọng:

- **Free Tier:** Cloud Run có 2 triệu requests/tháng miễn phí
- **Cold Start:** Service sẽ ngủ khi không có traffic
- **Custom Domain:** Có thể map domain custom sau
- **HTTPS:** Tự động có SSL certificate
- **Logs:** Xem logs trong Cloud Logging

## URL sau khi deploy:
Service sẽ có URL dạng: `https://viettrad-backend-xxxxx-uc.a.run.app`

## Cập nhật Frontend:
Sau khi có URL backend, cập nhật trong `client/src/config/api.js`:

```javascript
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://viettrad-backend-xxxxx-uc.a.run.app/api'
  : 'http://localhost:5000/api';
``` 