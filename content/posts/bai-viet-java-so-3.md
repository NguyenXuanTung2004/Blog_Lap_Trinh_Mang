---
title: "Đa Tuyến (Multithreading) - Biến Hóa Phân Thân, Xử Lý Song Song"
date: 2025-10-19T11:00:00+07:00 # Past date
draft: false
categories: ["Học Java"]
---

Hãy tưởng tượng bạn đang xây dựng một ứng dụng Java phức tạp, ví dụ một trình duyệt web.

* **Chạy đơn tuyến (Single-threaded):** Nếu bạn chỉ có một "luồng thực thi" (thread) duy nhất, nó phải làm mọi thứ tuần tự. Khi bạn bấm tải một trang web lớn, luồng đó bận rộn tải dữ liệu, và toàn bộ giao diện người dùng (các nút bấm, thanh cuộn) sẽ bị "đơ" (freeze) cho đến khi tải xong. Trải nghiệm cực kỳ tệ! 🥶
* **Chạy đa tuyến (Multi-threaded):** Bạn có thể tạo ra nhiều luồng:
    * Luồng chính (UI Thread): Chỉ lo vẽ giao diện, đảm bảo nút bấm luôn nhạy.
    * Luồng tải dữ liệu 1: Đi tải HTML.
    * Luồng tải dữ liệu 2: Đi tải ảnh.
    * Luồng tải dữ liệu 3: Đi tải CSS/JavaScript.
    Các luồng tải dữ liệu chạy ngầm, không làm ảnh hưởng đến luồng giao diện. Kết quả: Trình duyệt của bạn mượt mà, phản hồi nhanh nhạy. ✨

Đây chính là sức mạnh của **Đa tuyến (Multithreading)**. Nó cho phép một chương trình thực hiện nhiều tác vụ **đồng thời** (concurrently) hoặc **song song** (parallel, nếu máy có nhiều CPU core), bằng cách tạo ra các "tiểu trình" (Thread) độc lập.

Trong Lập trình Mạng, một **Server** bắt buộc phải là đa tuyến. Nó không thể "đơ" toàn bộ hệ thống chỉ vì đang phục vụ một Client. Nó phải sẵn sàng tiếp nhận và xử lý hàng trăm, hàng ngàn Client cùng lúc.

***

## Lợi Ích và Thách Thức

**Lợi ích:**
* **Tăng khả năng phản hồi (Responsiveness):** Giao diện người dùng không bị "đơ" khi có tác vụ nặng chạy ngầm.
* **Tận dụng CPU đa nhân (Performance):** Nếu máy có nhiều CPU core, các thread có thể chạy song song thực sự, tăng tốc độ xử lý.
* **Chia sẻ tài nguyên hiệu quả:** Các thread trong cùng một process có thể chia sẻ bộ nhớ (dữ liệu) dễ dàng hơn so với các process riêng biệt.

**Thách thức:**
* **Phức tạp (Complexity):** Quản lý nhiều luồng khó hơn nhiều so với một luồng.
* **Vấn đề Đồng bộ hóa (Synchronization):** Khi nhiều luồng cùng truy cập và thay đổi một dữ liệu chung, có thể xảy ra lỗi "dẫm chân lên nhau" (race condition), dẫn đến dữ liệu sai lệch. Cần các cơ chế khóa (lock) để bảo vệ.
* **Deadlock:** Hai hay nhiều luồng chờ đợi lẫn nhau mãi mãi, không luồng nào chạy tiếp được.
* **Tốn tài nguyên:** Mỗi thread cũng tiêu tốn một ít bộ nhớ và CPU để quản lý.

***

## Tạo Thread trong Java: Kế Thừa vs. Hợp Đồng

Như đã đề cập, có 2 cách chính:

### Cách làm : `extends Thread`

Tạo một lớp kế thừa trực tiếp từ `java.lang.Thread` và override phương thức `run()`.

```java
class MyThread extends Thread {
    private String taskName;
    public MyThread(String name) { this.taskName = name; }

    @Override
    public void run() {
        System.out.println("Thread '" + taskName + "' đang chạy...");
        // Làm việc gì đó...
        try { Thread.sleep(1000); } catch (InterruptedException e) {}
        System.out.println("Thread '" + taskName + "' kết thúc.");
    }
}

// Cách sử dụng:
MyThread t1 = new MyThread("Task A");
t1.start(); // Quan trọng: Gọi start() để tạo luồng mới