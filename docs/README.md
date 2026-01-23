# VinFast Miền Trung - Tài liệu dự án

## 📋 Thông tin chung

| Thông tin | Giá trị |
|-----------|---------|
| **Tên dự án** | VinFast Miền Trung |
| **Hotline** | 0934 980 711 |

---

## 🗂️ Cấu trúc dự án

```
MaiHieu/
├── backend/              # API Server (Node.js + Express + MongoDB)
├── frontend-admin/       # Admin Dashboard (React + Vite)
└── frontend-user/        # User-facing Website (React + Vite)
```

---

## 🚀 Tính năng đã triển khai

### 1. Admin Dashboard (`frontend-admin`)

| Trang | Route | Mô tả |
|-------|-------|-------|
| Tổng quan | `/` | Dashboard thống kê |
| Tin tức | `/posts` | Quản lý bài viết |
| Showroom | `/cars` | Quản lý xe |
| Thương hiệu | `/brands` | Quản lý hãng xe |
| Loại xe | `/car-types` | Phân loại xe |
| Đồng bộ FB | `/facebook-sync` | Danh sách bài FB, chọn đồng bộ |
| Cấu hình AI | `/ai-config` | Keywords phân loại, auto-publish |
| Thông báo | `/notifications` | Thông báo liên hệ từ khách |
| Cài đặt | `/settings` | Logo, hotline, địa chỉ showroom |

### 2. User Website (`frontend-user`)

| Trang | Route | Mô tả |
|-------|-------|-------|
| Trang chủ | `/` | Feed tin tức + xe nổi bật |
| Showroom | `/cars` | Danh sách xe |
| Chi tiết xe | `/cars/:slug` | Xem 360°, gallery, thông số |
| Tin tức | `/posts` | Danh sách bài viết |
| Chi tiết bài | `/posts/:slug` | Nội dung bài viết |
| Tìm kiếm | `/search` | Tìm xe và bài viết |

### 3. Backend API (`backend`)

| Endpoint | Mô tả |
|----------|-------|
| `/api/posts` | CRUD bài viết |
| `/api/cars` | CRUD xe |
| `/api/brands` | CRUD thương hiệu |
| `/api/car-types` | CRUD loại xe |
| `/api/settings` | Cài đặt hệ thống |
| `/api/notifications` | Thông báo |
| `/api/webhook/facebook` | Facebook integration |

---

## 🤖 Tích hợp AI (Gemini)

### Tính năng
- **Phân loại tự động**: news / review / promotion / event
- **Trích xuất**: Tiêu đề, mô tả, tags
- **Nhận diện**: Xe liên quan, thông tin khuyến mãi/sự kiện

### Cấu hình AI (`/ai-config`)
- **Tab Khuyến mãi**: Từ khóa mạnh (1 từ = promotion) và yếu (2+ từ)
- **Tab Sự kiện**: Từ khóa + ngày = event
- **Tab Đánh giá**: Từ khóa review
- **Tab Cài đặt**: Auto-publish toggle + min confidence

### Test AI (`/ai-test`)
- Paste nội dung để test phân loại
- Xem kết quả: category, title, excerpt, tags
- Import thành bài viết draft

---

## 🔗 Facebook Integration

### Đồng bộ FB (`/facebook-sync`)
- Hiển thị danh sách bài đăng từ Facebook Page
- Checkbox chọn nhiều bài
- Nút "Đồng bộ" từng bài hoặc batch
- Hiển thị trạng thái: đã đồng bộ / chưa

### Webhook (khi deploy production)
- `GET /api/webhook/facebook` - Xác thực webhook
- `POST /api/webhook/facebook` - Nhận bài đăng mới từ FB

---

## ⚙️ Cài đặt thương hiệu

Quản lý trong **Admin → Cài đặt**:

| Trường | Mô tả |
|--------|-------|
| Tên website | Hiển thị trên Header/Footer |
| Logo (URL) | Ảnh logo với preview |
| Hotline | Số điện thoại liên hệ |
| Showroom 1 | Địa chỉ showroom 1 |
| Showroom 2 | Địa chỉ showroom 2 |
| Zalo Phone | Số Zalo liên hệ |

**Lưu ý**: Frontend-user lấy dữ liệu động từ API `/api/settings/branding`

---

## 🛠️ Environment Variables

```env
# Backend
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FB_VERIFY_TOKEN=your_fb_verify_token
FB_PAGE_ACCESS_TOKEN=your_page_token
```

---

## 📦 Chạy dự án

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend Admin
cd frontend-admin
npm install
npm run dev

# Frontend User
cd frontend-user
npm install
npm run dev
```

---

## 🔜 Roadmap

- [ ] Tích hợp Facebook Graph API thực tế
- [ ] Auto-publish từ webhook
- [ ] Upload ảnh lên cloud storage
- [ ] Email notification
- [ ] SEO optimization
