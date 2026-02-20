# VinFast Miền Trung - Car Showroom

Website showroom xe VinFast với hệ thống quản lý nội dung, tích hợp AI và Facebook.

## 📋 Thông tin

| Thông tin | Giá trị |
|-----------|---------|
| **Hotline** | 0934 980 711 |
| **User Website** | [showroom-user.vercel.app](https://car-showroom-0934980711.vercel.app/) |
| **Admin Dashboard** | [showroom-admin.vercel.app](https://showroom-admin.vercel.app) |

---

## 🗂️ Cấu trúc dự án

```
├── backend/              # API Server (Node.js + Express + MongoDB)
├── frontend-admin/       # Admin Dashboard (React + Vite + TailwindCSS)
└── frontend-user/        # User Website (React + Vite + TailwindCSS)
```

---

## 🚀 Tính năng chính

### Admin Dashboard
- **Quản lý Xe** - CRUD xe với gallery, specs, interior/exterior
- **Quản lý Tin tức** - Block editor (text, image, video, car embed)
- **Import Excel** - Bulk import xe từ file Excel
- **Facebook Sync** - Đồng bộ bài đăng từ Facebook Page
- **AI Classification** - Phân loại tự động bài viết (Gemini AI)
- **Thông báo** - Nhận thông báo khi khách liên hệ Zalo
- **Cài đặt** - Logo, hotline, địa chỉ showroom, Zalo

### User Website
- **Showroom 3D** - Xem 360° xe với gallery ảnh
- **Tin tức** - Bài viết với nhiều loại (tin tức, đánh giá, khuyến mãi, sự kiện)
- **Tìm kiếm** - Tìm xe và bài viết
- **Dark/Light Mode** - Chuyển đổi giao diện
- **Zalo Smart** - Nút Zalo tự động gửi tin nhắn "Tôi đến từ bài {tiêu đề}"
- **Bookmark** - Lưu xe/bài viết yêu thích (localStorage)

### Tích hợp
- **Gemini AI** - Phân loại tự động: news / review / promotion / event
- **Facebook Graph API** - Đồng bộ bài đăng từ Fanpage
- **Zalo** - Nút liên hệ thông minh với context

---

## ⚙️ Cài đặt

### Environment Variables

```env
# Backend (.env)
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
FB_PAGE_ID=your_fb_page_id
FB_ACCESS_TOKEN=your_page_token
```

```env
# Frontend (.env)
VITE_API_URL=http://localhost:5000/api
```

### Chạy local

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend Admin (port 5174)
cd frontend-admin && npm install && npm run dev

# Frontend User (port 5173)
cd frontend-user && npm install && npm run dev
```

---

## 📦 API Endpoints

| Endpoint | Mô tả |
|----------|-------|
| `GET/POST /api/cars` | CRUD xe |
| `GET/POST /api/posts` | CRUD bài viết |
| `GET/POST /api/brands` | CRUD thương hiệu |
| `GET/POST /api/car-types` | CRUD loại xe |
| `GET/PUT /api/settings` | Cài đặt hệ thống |
| `POST /api/notifications/contact` | Log liên hệ Zalo |
| `GET/POST /api/facebook/*` | Facebook integration |
| `POST /api/admin/import/cars` | Import xe từ Excel |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TailwindCSS, React Query
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: Google Gemini API
- **Deploy**: Vercel (Frontend) + Render (Backend)

---

## 📝 Changelog gần đây

- ✅ **09/02/2026** - Zalo message format: "Tôi đến từ bài {tiêu đề}"
- ✅ **09/02/2026** - Smart hashtag: không thêm # nếu đã có
- ✅ **08/02/2026** - Multi-image upload cho content block
- ✅ **02/02/2026** - Quản lý loại xe (Car Types)
- ✅ **29/01/2026** - Import xe từ Excel

---

## 📄 License

Private - VinFast Miền Trung
