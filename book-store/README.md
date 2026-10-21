# BookStore Mobile App (React Native & Expo + JSON Server)

Dự án ứng dụng di động **BookStore** hoàn chỉnh theo yêu cầu của **Bài thực hành 2 (thay cho MockAPI)** kết hợp REST API giả lập với xác thực JWT (`json-server-auth`), 3 resources (`users`, `books`, `reviews`), Redux Toolkit, React Navigation và AsyncStorage.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh

### 1. Khởi động Máy chủ API (`json-server` + `json-server-auth`)
Server đã được cấu hình sẵn trong thư mục `bookstore-api/` (port `3000`, host `0.0.0.0` để hỗ trợ thiết bị thật).

Mở **Terminal 1**:
```bash
# Cách 1: Chạy trực tiếp từ root dự án
npm run api

# Hoặc cách 2: Vào thư mục bookstore-api
cd bookstore-api
npm start
```
*Tài nguyên API khả dụng:*
- `http://localhost:3000/books`
- `http://localhost:3000/reviews`
- `http://localhost:3000/users`
- `POST http://localhost:3000/login`
- `POST http://localhost:3000/register`

Khôi phục dữ liệu gốc bất kỳ lúc nào:
```bash
npm run api:reset
```

### 2. Khởi động Ứng dụng Expo / React Native
Mở **Terminal 2**:
```bash
# Kiểm tra TypeScript
npm run typecheck

# Khởi động Expo dev server
npx expo start
```
- Bấm `w` để mở giao diện Web.
- Bấm `a` để mở trên Android Emulator.
- Quét mã QR bằng app **Expo Go** trên điện thoại thật (cùng mạng Wi-Fi với máy tính).

---

## 👥 Danh Sách Tài Khoản Mẫu

Mật khẩu mặc định của tất cả tài khoản là: **`123456`**

| ID | Họ và tên | Email | Ghi chú |
|---|---|---|---|
| 1 | Nguyễn Văn An | `an@gmail.com` | Tài khoản mẫu 1 |
| 2 | Trần Thị Bình | `binh@gmail.com` | Tài khoản mẫu 2 |
| 3 | Lê Văn Châu | `chau@gmail.com` | Tài khoản mẫu 3 |
| 4 | Tài khoản Test | `test@gmail.com` | Tài khoản kiểm tra bắt buộc |

*(Bạn cũng có thể tự tạo tài khoản mới ngay trên form Đăng ký của ứng dụng).*

---

## 🛠️ Chi Tiết Triển Khai Các Bài Tập

### 📝 Bài tập 1: Màn hình Đăng nhập / Đăng ký với JWT
- **Component:** `src/screens/LoginScreen.tsx`
- **Chuyển đổi:** Tab "Đăng nhập" và "Đăng ký" mượt mà.
- **Validation thời gian thực:**
  - Email: kiểm tra định dạng email chuẩn `regex`, báo lỗi ngay bên dưới ô nhập.
  - Mật khẩu: tối thiểu 6 ký tự, báo lỗi ngay bên dưới ô nhập.
  - Họ tên & Xác nhận mật khẩu: kiểm tra bắt buộc và khớp mật khẩu khi đăng ký.
- **Xử lý đăng nhập / đăng ký:** Gọi `authService.login` hoặc `authService.register`, lưu `accessToken` và thông tin `user` vào Redux store `auth` và `AsyncStorage`.
- **Thông báo lỗi tiếng Việt:** Tự động chuyển các thông báo lỗi của `json-server-auth` sang tiếng Việt thân thiện (ví dụ: *"Email hoặc mật khẩu không đúng"*, *"Email đã được sử dụng"*).

### 🔒 Bài tập 2: Auto-login, Đăng xuất & Bảo vệ Checkout
- **Auto-login (`src/store/authSlice.ts`):**
  - Khi mở ứng dụng, đọc phiên từ `AsyncStorage`.
  - Phân tích `exp` từ JWT payload: nếu token đã hết hạn, tự động xoá phiên.
  - Nếu còn hạn, gọi `GET /users/:id` (route `600` của json-server-auth) để xác minh token còn hợp lệ với server.
  - Nếu nhận `401`/`403`/`404`, tự động thu hồi phiên. Nếu mất mạng, vẫn cho phép vào bằng dữ liệu offline an toàn.
- **Đăng xuất (`src/screens/ProfileScreen.tsx`):**
  - Nút đăng xuất có hộp thoại xác nhận, xoá sạch token khỏi `AsyncStorage` và header Axios.
- **Bảo vệ màn hình Checkout (`src/screens/CartScreen.tsx` & `src/screens/CheckoutScreen.tsx`):**
  - Tại Giỏ hàng: Bấm **Thanh toán** khi chưa đăng nhập sẽ hiển thị cảnh báo và chuyển sang màn hình Đăng nhập kèm tham số `{ redirect: 'Checkout' }`.
  - Đăng nhập thành công sẽ tự động điều hướng thẳng vào màn hình `Checkout`.
  - Nếu người dùng truy cập trực tiếp `CheckoutScreen` mà chưa có phiên, màn hình sẽ hiển thị trạng thái bảo vệ và yêu cầu đăng nhập.

### ⭐ Bài tập 3: Đánh giá & Xếp hạng Sao
- **Component ngôi sao tái sử dụng (`src/components/RatingStars.tsx`):**
  - Nhận props `value` (0 - 5 sao), `size`, hỗ trợ cả chế độ chỉ đọc và tương tác (`interactive`, `onChange`).
  - Hỗ trợ hiển thị sao chẵn, nửa sao và sao rỗng một cách thẩm mỹ.
- **Chi tiết sách (`src/screens/BookDetailScreen.tsx`):**
  - Tải thông tin sách (`GET /books/:id`) và danh sách đánh giá (`GET /reviews?bookId=...&_sort=createdAt&_order=desc`) song song (`Promise.all`).
  - Tính điểm trung bình `avg` tự động cập nhật từ mảng `reviews` bằng hàm `averageRating()`.
  - Form viết đánh giá mới chỉ hiển thị khi đã đăng nhập (chưa đăng nhập hiển thị nút dẫn đến màn hình Login với `{ redirect: 'goBack' }`).
  - Gửi đánh giá mới bằng `POST /reviews` kèm token xác thực.
  - Khi thành công, chèn ngay đánh giá mới vào đầu danh sách `reviews` trong state cục bộ, điểm trung bình được tính lại tức thì mà **không cần tải lại cả trang**.
  - Nếu token hết hạn trong lúc gửi đánh giá (lỗi `401`), ứng dụng tự động đăng xuất và chuyển form về trạng thái yêu cầu đăng nhập.

### 🌟 Thử thách Hoàn thành
1. **Sách liên quan lọc trên server:** Gọi `GET /books?category=...&id_ne=...&_limit=10` thông qua `bookService.getRelated()`.
2. **Xoá review của chính mình:** Người dùng có thể bấm nút xoá thùng rác trên review của chính mình (`review.userId === user.id`). Gọi `DELETE /reviews/:id` (bảo vệ quyền route `644`).
3. **Phân trang & Tải thêm ở Home:** Trang chủ hỗ trợ `_page` và `_limit`, kéo xuống cuối danh sách sẽ tự động kích hoạt `onEndReached` để tải thêm sách.
4. **Bộ chuyển đổi IP máy chủ tiện lợi:** Trên màn hình `Profile`, có sẵn công cụ chuyển đổi nhanh giữa `localhost`, `LAN IP` và `10.0.2.2` mà không cần sửa code.

---

## 📁 Cấu Trúc Mã Nguồn

```
book-store/
├── App.tsx                        # Entry point: Redux Provider, NavigationContainer, restoreSession
├── index.ts                       # Expo root registration
├── package.json                   # Dependencies & run scripts
├── bookstore-api/                 # REST API Server độc lập
│   ├── db.json                    # Dữ liệu 4 users, 20 books, 25+ reviews
│   ├── db.seed.json               # Bản sao dữ liệu gốc
│   ├── routes.json                # Phân quyền 600, 444, 644
│   └── package.json
└── src/
    ├── api/
    │   └── client.ts              # Axios instance, token interceptor, LAN IP
    ├── components/
    │   ├── HeaderRight.tsx        # Giỏ hàng với badge số lượng & Avatar người dùng
    │   ├── PrimaryButton.tsx      # Nút bấm tái sử dụng (solid, outline, danger)
    │   ├── RatingStars.tsx        # Component ngôi sao tái sử dụng
    │   ├── RelatedBooks.tsx       # Carousel sách liên quan
    │   ├── ReviewForm.tsx         # Form gửi đánh giá với chọn sao tương tác
    │   └── ReviewItem.tsx         # Hiển thị đánh giá + nút xoá nếu là chính chủ
    ├── navigation/
    │   ├── RootNavigator.tsx      # React Navigation Native Stack
    │   └── types.ts               # Định nghĩa Route params & props
    ├── screens/
    │   ├── BookDetailScreen.tsx   # Chi tiết sách, rating, reviews, related books
    │   ├── CartScreen.tsx         # Giỏ hàng, điều chỉnh số lượng, bảo vệ checkout
    │   ├── CheckoutScreen.tsx     # Thanh toán được bảo vệ, đặt hàng thành công
    │   ├── HomeScreen.tsx         # Trang chủ, phân trang, danh mục, tìm kiếm
    │   ├── LoginScreen.tsx        # Đăng nhập / Đăng ký có validate dưới từng ô
    │   └── ProfileScreen.tsx      # Thông tin cá nhân, đăng xuất, đổi IP server
    ├── services/
    │   ├── authService.ts         # /login, /register, /users/:id, giải mã JWT exp
    │   ├── bookService.ts         # /books, lọc server category & id_ne
    │   └── reviewService.ts       # /reviews GET/POST/DELETE
    ├── store/
    │   ├── authSlice.ts           # Quản lý auth, auto-login, AsyncStorage
    │   ├── cartSlice.ts           # Quản lý giỏ hàng Redux
    │   └── index.ts               # Cấu hình store & typed hooks
    ├── types.ts                   # Types: User, Book, Review, CartItem (id: number)
    └── utils/
        └── rating.ts              # Hàm tính điểm đánh giá trung bình
```
