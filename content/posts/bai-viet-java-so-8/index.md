---
title: "JavaScript 'Gọi Điện' Về Server - Fetch API & async/await"
date: 2025-10-24T11:00:00+07:00
draft: false
categories: ["JavaScript"]
tags: ["JavaScript", "Networking", "Fetch API", "async-await"]
image: featured-image.jpg
---

Chúng ta đã dành nhiều thời gian khám phá cách Java hoạt động ở phía **back-end** (máy chủ), xử lý logic, kết nối database, và giao tiếp mạng cấp thấp. Giờ là lúc chuyển sang phía **front-end** - thế giới của trình duyệt web, nơi **JavaScript** là vua. 👑

Trong các ứng dụng web hiện đại (Single Page Applications - SPAs), trải nghiệm người dùng mượt mà là yếu tố then chốt. Khi bạn "thích" một bài đăng trên Facebook, trang web không tải lại hoàn toàn. Thay vào đó, JavaScript chạy trong trình duyệt của bạn sẽ âm thầm gửi một yêu cầu nhỏ lên server ("Người dùng A thích bài đăng X"), server xử lý, và JavaScript cập nhật giao diện (nút "thích" chuyển màu xanh, bộ đếm tăng lên) mà không làm gián đoạn trải nghiệm.

Cơ chế "gọi điện về server" mà không cần tải lại trang này được thực hiện chủ yếu thông qua **AJAX (Asynchronous JavaScript and XML)** - mặc dù ngày nay XML ít được dùng hơn JSON. Công cụ tiêu chuẩn và mạnh mẽ nhất để thực hiện AJAX trong JavaScript hiện đại là **Fetch API**.

---

## Fetch API: Người Đưa Tin Hiện Đại 🚀

`fetch()` là một hàm toàn cục (`window.fetch()`) được tích hợp sẵn trong hầu hết các trình duyệt hiện đại. Nó cung cấp một cách thức mạnh mẽ và linh hoạt để thực hiện các yêu cầu mạng (chủ yếu là HTTP/HTTPS). Nó là phiên bản hiện đại, mạnh mẽ hơn của `XMLHttpRequest`.

---

## Thách Thức Cốt Lõi: Bất Đồng Bộ (Asynchronicity) ⏳

Đây là khái niệm quan trọng nhất cần hiểu khi làm việc với mạng trong JavaScript. Khi bạn gọi `fetch('...')`, JavaScript **KHÔNG CHỜ ĐỢI**. Nó tiếp tục thực thi các dòng code tiếp theo ngay lập tức. Vài mili giây hoặc vài giây sau, khi trình duyệt tải xong, JavaScript mới nhận dữ liệu và xử lý. Bất đồng bộ giúp giao diện người dùng luôn mượt mà.

Để quản lý việc "nhận dữ liệu sau" này, JavaScript dùng **Promises (Lời hứa)**.

---

## Quản Lý Bất Đồng Bộ: Promises và `.then()`

`fetch()` không trả về dữ liệu ngay lập tức. Nó trả về một **Promise (Lời hứa)**. Promise giống như một giấy hẹn: "Tôi hứa sẽ có kết quả (thành công hoặc thất bại) trong tương lai".

Bạn sử dụng phương thức `.then()` để "đăng ký" một hàm callback sẽ được thực thi **khi lời hứa được hoàn thành (resolved)**. Bạn dùng `.catch()` để xử lý **khi lời hứa thất bại (rejected)**.

```javascript
// Đây là code JavaScript, chạy trong thẻ <script> của file HTML
// Hoặc chạy ngay trong Console (F12) của trình duyệt

const userListElement = document.getElementById('user-list'); // Giả sử có <ul id="user-list">

console.log("Bắt đầu tải danh sách người dùng...");
if (userListElement) userListElement.innerHTML = '<li>Đang tải...</li>'; // Thông báo đang tải

fetch('[https://jsonplaceholder.typicode.com/users](https://jsonplaceholder.typicode.com/users)')
  .then(response => {
    console.log("Nhận được phản hồi từ server (chưa phải dữ liệu)");
    // Kiểm tra xem server có trả về lỗi HTTP không (4xx, 5xx)
    if (!response.ok) { 
      // fetch() chỉ reject khi có lỗi mạng thực sự, không phải lỗi HTTP
      // Nên phải tự kiểm tra response.ok
      throw new Error(`HTTP error! status: ${response.status}`);
    } else {
      // response.json() cũng trả về một Promise khác!
      return response.json(); // Promise này resolve với dữ liệu JSON đã parse
    }
  })
  .then(users => {
    console.log("Đã nhận và parse dữ liệu người dùng:", users);
    if (userListElement) {
        userListElement.innerHTML = ''; // Xóa chữ "Đang tải..."
        users.forEach(user => {
          const listItem = document.createElement('li');
          listItem.textContent = `${user.name} (${user.email})`;
          userListElement.appendChild(listItem);
        });
    }
  })
  .catch(error => {
    console.error('Không thể tải dữ liệu:', error);
     if (userListElement) userListElement.innerHTML = `<li>Lỗi: ${error.message}</li>`;
  });

console.log("Code này chạy ngay lập tức, không chờ fetch xong.");