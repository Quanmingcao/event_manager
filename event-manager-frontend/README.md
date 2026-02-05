# Event Manager Frontend

Frontend React + TypeScript kết nối với ASP.NET Core backend.

## 🚀 Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev

# Build production
npm run build
```

## ⚙️ Cấu hình

Tạo file `.env` từ `.env.example`:

```
VITE_API_URL=https://localhost:7053/api
```

## 📋 Yêu cầu

- Node.js 18+
- Backend ASP.NET Core đang chạy tại `https://localhost:7053`

## 🎯 Features

- ✅ Kết nối ASP.NET Core API
- ✅ TypeScript types khớp với backend
- ✅ Axios client với interceptors
- ✅ API services cho tất cả entities
- ✅ Tailwind CSS styling
- ✅ Responsive design

## 📁 Cấu trúc

```
src/
├── api/          # API services
├── types/        # TypeScript types
├── App.tsx       # Main component
└── main.tsx      # Entry point
```

## 🔌 API Endpoints

- Events: `/api/Events`
- Staff: `/api/Staff`
- Task Templates: `/api/TaskTemplates`
- Event Tasks: `/api/EventTasks`
- Services: `/api/Services`
- Event Finances: `/api/EventFinances`

## 🧪 Test

1. Chạy backend ASP.NET Core
2. Chạy `npm run dev`
3. Mở http://localhost:3000
4. Kiểm tra data từ backend hiển thị

## 📝 Next Steps

- [ ] Thêm routing (React Router)
- [ ] Tạo pages chi tiết
- [ ] Implement CRUD forms
- [ ] Add authentication
- [ ] Charts và statistics
