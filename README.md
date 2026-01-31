# 🌳 Family Tree AI - Website Quản Lý Gia Phả Tích Hợp Nhận Diện Khuôn Mặt

![Project Status](https://img.shields.io/badge/Status-Completed-success)
![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20Supabase%20%7C%20Python-blue)
![License](https://img.shields.io/badge/License-MIT-green)

> **Đồ án Thực tập Tốt nghiệp**
> 
> **Sinh viên:** Đoàn Vĩnh Khang (22H1120127)
> 
> **Giảng viên hướng dẫn:** TS. Lê Văn Quốc Anh

## 📖 Giới thiệu

Đây là nền tảng quản lý gia phả trực tuyến hiện đại, cho phép người dùng xây dựng cây phả hệ dòng họ thông qua giao diện kéo thả (Drag & Drop). Điểm đặc biệt của dự án là tính năng **AI nhận diện khuôn mặt**, giúp tìm kiếm và định danh các thành viên trong gia đình thông qua Camera theo thời gian thực.

Dự án kết hợp kiến trúc **Hybrid Database** (SQL & NoSQL) để tối ưu hóa hiệu năng lưu trữ dữ liệu đồ thị phức tạp.

## 🚀 Tính năng nổi bật

- **🎨 Vẽ gia phả trực quan:** Sử dụng thư viện **React Flow**, hỗ trợ kéo thả, phóng to, thu nhỏ, và tự động nối dây quan hệ (Cha-con, Vợ-chồng).
- **🤖 AI Nhận diện khuôn mặt:** Tích hợp mô hình **FaceNet** (TensorFlow) chạy trên **Google Colab**, kết nối qua **ngrok** để nhận diện người thân qua Webcam.
- **🔐 Quản lý & Bảo mật:** Xác thực người dùng an toàn với **Supabase Auth**. Phân quyền (Admin/Editor/Viewer) qua bảng `user_roles`.
- **📂 Nhập/Xuất linh hoạt:** Hỗ trợ xuất sơ đồ ra file ảnh **PNG** chất lượng cao hoặc file **JSON** để sao lưu.
- **☁️ Cloud Storage:** Lưu trữ hình ảnh thành viên không giới hạn trên Supabase Storage.

## 🛠️ Công nghệ sử dụng

### Frontend & Application
- **Framework:** Next.js 14 (App Router)
- **Ngôn ngữ:** TypeScript
- **UI Library:** Tailwind CSS, Shadcn/UI, Lucide React
- **Core Logic:** React Flow (Xử lý đồ thị)

### Backend & Database
- **Platform:** Supabase (Backend-as-a-Service)
- **Database:** PostgreSQL
- **Data Type:** JSONB (Lưu trữ cấu trúc cây), UUID (Khóa chính)
- **Auth:** Supabase Auth

### AI & Infrastructure
- **Model:** Keras-FaceNet, MTCNN
- **Runtime:** Google Colab (Tesla T4 GPU)
- **API Framework:** FastAPI (Python)
- **Tunneling:** ngrok (Kết nối Colab Localhost ra Internet)

## ⚙️ Cài đặt và Hướng dẫn chạy

### 1. Yêu cầu tiên quyết
- Node.js v18.17+
- Tài khoản Supabase
- Tài khoản Google (để chạy Colab)
- Tài khoản ngrok

### 2. Thiết lập Frontend (Next.js)

```bash
# Clone dự án
git clone [https://github.com/username/family-tree-ai.git](https://github.com/username/family-tree-ai.git)
cd family-tree-ai

# Cài đặt thư viện
npm install

# Tạo file .env.local và điền thông tin Supabase
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
### 3. Thiết lập AI Server (Google Colab)

Do mô hình FaceNet yêu cầu GPU để xử lý nhanh, server AI được đặt trên Google Colab.

1.  **Mở Notebook:** Upload file `AI_Server/Face_Recognition_Server.ipynb` lên Google Colab hoặc Google Drive.
2.  **Cấu hình ngrok:**
    * Đăng ký tài khoản tại [ngrok.com](https://ngrok.com).
    * Lấy **Authtoken** của bạn.
    * Trong Colab, thêm token vào mục **Secrets** (biểu tượng chìa khóa bên trái) với tên là `NGROK_AUTH_TOKEN`.
3.  **Chạy Server:**
    * Trên thanh menu Colab, chọn **Runtime** > **Run all** (hoặc `Ctrl+F9`).
    * Chờ quá trình cài đặt thư viện hoàn tất.
4.  **Lấy URL API:**
    * Ở cell cuối cùng, console sẽ in ra đường dẫn có dạng: `https://xxxx-xx-xx-xx-xx.ngrok-free.app`.
    * Copy đường dẫn này.
5.  **Kết nối Frontend:**
    * Quay lại file `.env.local` trong thư mục code Next.js.
    * Dán đường dẫn vào biến: `NEXT_PUBLIC_AI_API_URL=https://xxxx-xx-xx-xx-xx.ngrok-free.app`

### 4. Khởi chạy ứng dụng

Sau khi đã cấu hình xong Database (Supabase) và AI Server (Colab), quay lại terminal của dự án Next.js và chạy lệnh:

```bash
npm run dev

Mở trình duyệt và truy cập: http://localhost:3000
```
📸 Hình ảnh Demo
Dưới đây là một số hình ảnh thực tế của hệ thống:

<img width="1920" height="1080" alt="Ảnh chụp màn hình (186)" src="https://github.com/user-attachments/assets/2bc22bfd-0465-45a7-a2d4-23f1016d4c8b" />

<img width="1920" height="1080" alt="Ảnh chụp màn hình (187)" src="https://github.com/user-attachments/assets/a4d0bb26-410f-4f64-98ec-7cb7a1eafb6a" />

<img width="1920" height="1080" alt="Ảnh chụp màn hình (188)" src="https://github.com/user-attachments/assets/38077483-ad5b-463a-92c2-6b3530a0c5e7" />

<img width="1920" height="1080" alt="Ảnh chụp màn hình (189)" src="https://github.com/user-attachments/assets/ee54fc81-deae-4613-ab44-92b2795d96f2" />


Kiến trúc hệ thống
Sơ đồ luồng dữ liệu giữa Next.js, Supabase và Google Colab:

```bash
graph TD
    User[Người dùng] -->|HTTPS| NextJS[Next.js Client]
    
    subgraph "Backend Services"
        NextJS -->|Auth & Data| Supabase[(Supabase DB & Storage)]
    end
    
    subgraph "AI Infrastructure"
        NextJS -->|Gửi ảnh Base64| Ngrok[Ngrok Tunnel]
        Ngrok -->|Forward Request| Colab[Google Colab (FastAPI)]
        Colab -->|Xử lý Vector| FaceNet[Mô hình FaceNet/MTCNN]
        Colab -.->|Truy vấn so khớp| Supabase
    end
    
    style User fill:#f9f,stroke:#333,stroke-width:2px
    style NextJS fill:#bbf,stroke:#333,stroke-width:2px
    style Supabase fill:#bfb,stroke:#333,stroke-width:2px
    style Colab fill:#fbb,stroke:#333,stroke-width:2px
```

🤝 Tác giả
Đoàn Vĩnh Khang

🎓 Lớp: CN22CLCE - Khoa Công nghệ Thông tin

🏫 Trường: Đại học Giao Thông Vận Tải TP. Hồ Chí Minh (UTH)

📧 Email: 22H1120127@ut.edu.vn

💼 Chuyên ngành: Công nghệ thông tin

Đồ án thực tập tốt nghiệp - Niên khóa 2022-2026
