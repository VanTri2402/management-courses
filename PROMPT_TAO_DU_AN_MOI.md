# KÍCH HOẠT DỰ ÁN MỚI TRÊN NỀN TẢNG CORE BOILERPLATE
- **CHỦ ĐỀ DỰ ÁN (PROJECT TOPIC):** [Điền tên chủ đề vào đây - VD: Website xem phim trực tuyến 4K / Sàn thương mại điện tử thời trang / Nền tảng học trực tuyến]
- **PHONG CÁCH THIẾT KẾ (DESIGN STYLE):** [Để trống = BẮT BUỘC tự động áp dụng chuẩn mặc định "5-Act Scroll Storytelling" đã có sẵn trong hệ thống]
- **YÊU CẦU ĐẶC BIỆT (OPTIONAL):** [Để trống nếu muốn AI tự quyết định 100%]

---

# CHỈ THỊ HỆ THỐNG TỰ ĐỘNG THÍCH NGHI (AUTONOMOUS DOMAIN ADAPTATION)
Bạn đang làm việc trên thư mục **Enterprise Core Boilerplate** đã có sẵn: Auth, RBAC, Dynamic Header/Footer CRUD (`NavigationItem`), `SiteSetting`, `MediaAsset`, `Notification`, Polymorphic `Bookmark`/`Comment`, `createSafeAction`, và bộ công cụ `src/components/scrollytelling/`.

Hãy đọc file `AI_CONTEXT.md` và `prisma/schema.prisma` trước tiên. Với duy nhất **CHỦ ĐỀ DỰ ÁN** được cung cấp ở trên, bạn phải TỰ ĐỘNG suy luận và thực thi trọn vẹn 5 bước sau trong một mạch chạy duy nhất:

1. **Tự động suy luận Môi trường & Mở rộng Database (`prisma/schema.prisma` & `prisma/seed.ts`):**
   - Giữ nguyên 100% các bảng Core hiện có.
   - Tự xác định 5-7 thực thể dữ liệu cốt lõi bắt buộc phải có của chủ đề này (VD: Nếu là Web Phim -> `Movie`, `Episode`, `Genre`, `Actor`, `WatchHistory`; Nếu là Bán hàng -> `Product`, `Category`, `Variant`, `Cart`, `Order`...) và nối khóa ngoại chặt chẽ với bảng `User`.
   - Tự động bổ sung các biến môi trường đặc thù của ngành vào `.env.example` và `src/lib/env.ts` (kèm giá trị fallback an toàn để chạy ngay ở local).
   - Cập nhật `prisma/seed.ts` để tự động đổ 15+ bản ghi mẫu sống động của chủ đề mới, đồng thời tự động cập nhật bảng `NavigationItem` (Menu Header/Footer) và `SiteSetting` (Tên web, mô tả, cấu hình) cho khớp hoàn toàn với chủ đề mới.

2. **Xây dựng Backend, Server Actions & Tích hợp Tương tác Core:**
   - Sử dụng `createSafeAction` và phân quyền RBAC sẵn có để viết đầy đủ các hàm CRUD, tìm kiếm, lọc nâng cao cho các bảng mới.
   - Tích hợp sẵn `<BookmarkButton />`, `<CommentSection />`, thanh tìm kiếm `Cmd+K` và bắn thông báo vào `NotificationBell` cho các thực thể mới của chủ đề.

3. **Mở rộng Admin Dashboard (`/admin/*`):**
   - Tạo các trang CRUD quản lý nghiệp vụ mới trong `src/app/(admin)/admin/[ten-module]` (tích hợp sẵn `<MediaPickerModal />` khi chọn/tải ảnh) và gắn link vào `AdminSidebar`.

4. **Thiết kế UI/UX — Quy tắc Mặc định "5-Act Scroll Storytelling":**
   - Nếu mục **PHONG CÁCH THIẾT KẾ** để trống, bạn BẮT BUỘC phải thiết kế giao diện Public theo triết lý **Immersive Scroll Storytelling** đạt chuẩn Awwwards bằng cách sử dụng các component trong `src/components/scrollytelling/`:
     - Tự động điều chỉnh bảng màu CSS Variables trong `globals.css` và Tailwind mang đậm linh hồn của chủ đề mới (VD: Cinematic Dark cho web phim, Luxury Editorial cho thời trang, Cyber Minimal cho công nghệ).
     - Thiết kế Trang chủ theo 5 chương cuộn: (1) Pinned Hero Viewport với `<ParallaxLayer>` & `<ScrollRevealText>`, (2) Sticky Narrative Showcase với `<ScrollPinSection>`, (3) Horizontal Discovery Gallery với `<HorizontalScrollCarousel>`, (4) Interactive Live Filter Grid từ DB, và (5) Climax CTA chuyển tiếp xuống `DynamicFooter`,...(có thể thêm nếu bạn thấy web còn thiếu điều gì đó để hoàn chỉnh)
   - Xây dựng hoàn chỉnh các trang Danh sách/Khám phá (đồng bộ bộ lọc lên URL `searchParams`) và trang Chi tiết/Trải nghiệm chính của chủ đề.

5. **Đồng bộ & Kiểm tra Chạy thử:**
   - Đẩy schema mới vào DB, chạy seed dữ liệu mới và đảm bảo toàn bộ dự án không có bất kỳ lỗi TypeScript nào.
