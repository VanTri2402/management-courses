# 🏛️ AI CONTEXT — ENTERPRISE NEXT.JS CORE BOILERPLATE ARCHITECTURE

> **Tài liệu đặc tả kiến trúc toàn cầu dành cho AI & Nhà phát triển khi mở rộng hệ thống.**
> Đọc kỹ file này trước khi bổ sung bất kỳ module hoặc tính năng nghiệp vụ nào mới.

---

## 1. TỔNG QUAN HỆ THỐNG & KIẾN TRÚC MODULAR

Dự án được xây dựng theo chuẩn **Enterprise Modular Architecture**, phân chia ranh giới rõ ràng giữa **Phần Lõi (Core Framework - Bất biến)** và **Các Phân Hệ Nghiệp Vụ (Business Modules - Mở rộng)**.

### Sơ Đồ Cấu Trúc:

```
├── prisma/
│   ├── schema.prisma               # 7 Bảng Core + Các thực thể nghiệp vụ mới
│   └── seed.ts                     # Seed tài khoản quản trị, Menu Header/Footer, Settings mẫu
├── public/
│   └── uploads/                    # Thư mục lưu tệp tải lên local
├── src/
│   ├── app/
│   │   ├── (public)/               # Layout khách: SmoothScrollProvider + DynamicHeader + DynamicFooter
│   │   ├── (auth)/                 # Layout xác thực (/login, /register, /profile, /forgot-password)
│   │   ├── (admin)/                # Quản trị hệ thống (/admin/*: Menus, Settings, Users, Media, Logs)
│   │   ├── api/                    # Route handlers (Media, Notifications, Search)
│   │   ├── sitemap.ts              # Sitemap động
│   │   ├── robots.ts               # Robots động
│   │   ├── error.tsx               # Global Error Boundary
│   │   └── loading.tsx             # Global Skeleton Loading
│   ├── components/
│   │   ├── ui/                     # Base UI Atomic (Button, Input, Dialog, DataTable, Badge...)
│   │   ├── layout/                 # DynamicHeader, DynamicFooter, CommandSearch, NotificationBell...
│   │   ├── scrollytelling/         # Bộ 6 Component Scroll Storytelling chuẩn Awwwards
│   │   └── shared/                 # RoleGate, MediaPickerModal, BookmarkButton, CommentSection
│   ├── lib/
│   │   ├── db.ts                   # Prisma Singleton + Neon Serverless Pooler
│   │   ├── auth.ts                 # Jose JWT + Bcrypt + HttpOnly Cookies (getCurrentUser, requireRole)
│   │   ├── safe-action.ts          # createSafeAction wrapper (Validation + RBAC + RateLimit + AuditLog)
│   │   ├── rate-limit.ts           # Sliding Window Rate Limiter
│   │   ├── mail.ts                 # Transactional Email Service (Nodemailer)
│   │   ├── seo.ts                  # constructMetadata()
│   │   └── env.ts                  # Zod Environment Validation
│   ├── server/
│   │   ├── actions/                # Server Actions (Auth, Layout, Settings, Media, Interactions)
│   │   └── queries/                # unstable_cache Queries (tag: 'layout-data', 'site-settings')
│   ├── hooks/
│   │   ├── use-debounce.ts         # Hook chống nhiễu
│   │   └── use-url-state.ts        # Đồng bộ URL SearchParams (Filter, Search, Pagination)
│   ├── types/                      # TypeScript Global Interfaces
│   └── middleware.ts               # Layer 1 Security & RBAC Protection
```

---

## 2. QUY CHUẨN BẢO MẬT 3 TẦNG (MULTI-LAYER RBAC)

Mọi yêu cầu truy cập và thao tác dữ liệu đều bắt buộc đi qua 3 tầng bảo vệ:

### Tầng 1: Edge Middleware (`src/middleware.ts`)

- Kiểm tra JWT cookie `enterprise_session` bằng thư viện `jose` (tương thích 100% với Edge Runtime).
- Chặn khách chưa đăng nhập truy cập `/profile` và `/admin/*`.
- Chặn vai trò `USER` truy cập `/admin/*` và chuyển hướng sang `/unauthorized`.
- Kiểm tra cờ `maintenance_mode` từ SiteSetting/Environment để chuyển hướng về `/maintenance` (ngoại trừ SUPER_ADMIN và ADMIN).

### Tầng 2: Server Action Wrapper (`src/lib/safe-action.ts`)

Mọi Server Action trong hệ thống **BẮT BUỘC** được tạo bằng hàm `createSafeAction`:

```typescript
import { createSafeAction } from "@/lib/safe-action";
import { z } from "zod";

export const exampleAction = createSafeAction(
  {
    schema: z.object({ title: z.string().min(1) }),
    allowedRoles: ["SUPER_ADMIN", "ADMIN"], // Chỉ định quyền thực hiện
    rateLimitConfig: { limit: 10, windowMs: 60000 }, // Chặn spam request
    auditAction: "CREATE_EXAMPLE_RECORD", // Tự động ghi nhật ký AuditLog
    auditEntityType: "EXAMPLE",
  },
  async ({ title }, { user, ip }) => {
    // Logic nghiệp vụ ở đây
    return { title };
  },
);
```

### Tầng 3: UI Gatekeeper (`src/components/shared/RoleGate.tsx`)

Bọc các nút bấm, menu hoặc khối giao diện nhạy cảm ở phía Client / Server Component:

```tsx
<RoleGate
  allowedRoles={["SUPER_ADMIN", "ADMIN"]}
  fallback={<p>Không có quyền</p>}
>
  <Button>Xóa vĩnh viễn</Button>
</RoleGate>
```

---

## 3. ON-DEMAND CACHE REVALIDATION CHO HEADER & FOOTER

Hệ thống sử dụng Next.js Cache Tags để tối đa hóa tốc độ phản hồi:

1. `src/server/queries/layout.ts` bọc hàm truy vấn cấu trúc Menu và Site Settings bằng `unstable_cache` với tag `'layout-data'`.
2. Khi Admin tạo mới, chỉnh sửa, đổi thứ tự, bật/tắt menu trong `/admin/menus`, Server Action gọi:

```typescript
import { revalidateTag } from "next/cache";

revalidateTag("layout-data");
```

3. Khi Admin cập nhật cấu hình website trong `/admin/settings`, Server Action gọi:

```typescript
revalidateTag("layout-data");
revalidateTag("site-settings");
```

-> Giúp website ngoài trang chủ Public cập nhật ngay tức khắc mà không cần render lại toàn bộ trang hoặc tốn truy vấn DB ở các lượt tải sau.

---

## 4. CÁCH KẾT NỐI BẢNG NGHIỆP VỤ MỚI VÀO PHẦN LÕI CORE

Khi mở rộng chủ đề mới (ví dụ Web Phim `Movie`, E-commerce `Product`, Khóa học `Course`):

### 1. Nối Bookmark & Comment Đa Hình (Polymorphic)

Không cần tạo thêm bảng `MovieBookmark` hay `ProductComment`. Sử dụng trực tiếp cặp `entityType` và `entityId`:

```tsx
// Nút Yêu thích / Lưu phim
<BookmarkButton
  entityType="MOVIE"
  entityId={movie.id}
  metadata={{
    title: movie.title,
    thumbnail: movie.posterUrl,
    slug: movie.slug,
  }}
  showText
/>

// Khung Đánh giá Sao & Bình luận
<CommentSection
  entityType="MOVIE"
  entityId={movie.id}
  currentUser={currentUser}
/>
```

### 2. Gửi Thông Báo Trong Ứng Dụng (In-App Notification)

Bắn thông báo vào `NotificationBell` chỉ bằng 1 dòng code:

```typescript
import { sendNotification } from "@/server/actions/notification";

await sendNotification({
  userId: targetUser.id,
  title: "Đơn hàng đã được duyệt",
  message: "Đơn hàng #1024 của bạn đã được xuất kho thành công.",
  type: "INTERACTION",
  actionUrl: "/orders/1024",
});
```

### 3. Chọn & Tải File với `<MediaPickerModal />`

Gắn vào bất kỳ form tạo sản phẩm / bài viết nào:

```tsx
const [pickerOpen, setPickerOpen] = useState(false);
const [thumbnail, setThumbnail] = useState("");

<MediaPickerModal
  open={pickerOpen}
  onOpenChange={setPickerOpen}
  onSelect={(url) => setThumbnail(url)}
  title="Chọn ảnh đại diện"
/>;
```

---

## 5. TRIẾT LÝ MẶC ĐỊNH: 5-ACT SCROLL STORYTELLING

Giao diện Public mặc định luôn áp dụng 5 chương cuộn kể chuyện sử dụng các component trong `src/components/scrollytelling/`:

1. **Act 1: Pinned Hero Viewport**
   - Mở màn điện ảnh với `<ParallaxLayer speed={-15}>` tạo hiệu ứng chiều sâu.
   - Dòng chữ dẫn truyện sử dụng `<ScrollRevealText text="..." highlightWords={[...]} />` sáng dần theo nhịp cuộn.
2. **Act 2: Sticky Narrative Showcase**
   - Sử dụng `<ScrollPinSection steps={[...]} />` ghim màn hình và tự động nội suy `scrollYProgress` để chuyển cảnh qua 3 chương nội dung lớn.
3. **Act 3: Horizontal Discovery Gallery**
   - Sử dụng `<HorizontalScrollCarousel items={[...]} />` chuyển đổi thao tác lăn chuột dọc thành chuyển động trượt ngang nghệ thuật.
4. **Act 4: Interactive Live Filter Grid**
   - Lưới dữ liệu tương tác thực tế kết nối DB có `<BookmarkButton />` và `<CommentSection />`.
5. **Act 5: Climax CTA & Dynamic Footer Reveal**
   - Kêu gọi hành động cao trào dẫn dắt mượt mà xuống `<DynamicFooter />`.
     Tuân thủ rõ ràng 120fps cho toàn bộ website.
