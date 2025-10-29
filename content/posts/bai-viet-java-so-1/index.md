---
title: "Gã Khổng Lồ 'Write Once, Run Anywhere'"
date: 2022-10-25T17:30:00+07:00
draft: false
categories: ["Java"]
tags: ["Java", "Giới thiệu", "JVM"]
image: featured-image.jpg
---

Chào bạn! Chắc hẳn bạn đã nghe nói về "Lập trình Hướng đối tượng" (OOP), về các hệ thống ngân hàng tỷ đô, hay về ứng dụng Android. Đứng đằng sau rất nhiều trong số đó, là một gã khổng lồ thầm lặng: **Java**.

Nhưng tại sao Java lại trở nên quyền lực như vậy?

Hãy tưởng tượng bạn là một kiến trúc sư vĩ đại.
* Nếu bạn xây nhà bằng C++, bạn phải là chuyên gia về nền đất. Bạn xây nhà trên "nền đất Windows", bạn phải dùng vật liệu của Windows. Khi sang "nền đất macOS", bạn phải thiết kế lại móng và tường để chịu được "thời tiết" của macOS. Cực kỳ tốn công!
* Với Java, bạn không cần quan tâm đến nền đất. Bạn chỉ cần tập trung thiết kế một **"bản vẽ thần kỳ" (Magic Blueprint)** duy nhất.

Sau đó, bạn đưa "bản vẽ" này cho "Đội Thi Công" tại bất kỳ đâu (Windows, macOS, Linux). "Đội Thi Công" tại mỗi nơi sẽ tự động đọc bản vẽ của bạn và xây nên ngôi nhà y hệt, một cách hoàn hảo.

"Bản vẽ thần kỳ" đó gọi là **Bytecode**. Và "Đội Thi Công" đó chính là **Máy ảo Java (JVM)**.

Đây chính là triết lý đã làm nên tên tuổi của Java:

> **"Write Once, Run Anywhere" (Viết một nơi, Chạy khắp chốn)**

![Write Once Run Anywhere](/images/java-wora.png) 

---

## Java Thực Sự Là Gì? "Giải Nén" 4 Tính Chất Cốt Lõi

Java là một ngôn ngữ lập trình **bậc cao**, **hướng đối tượng**, **bảo mật**, và **đa nền tảng**. Chúng ta sẽ "giải nén" từng cái.

### 1. Đa nền tảng (Platform Independent)

Đây là điều chúng ta vừa nói. Nhờ có Máy ảo Java (JVM), code của bạn (đã được biên dịch thành Bytecode) có thể chạy trên mọi hệ điều hành mà không cần sửa đổi một dòng code nào.

### 2. Hướng đối tượng (Object-Oriented Programming - OOP)

Đây không chỉ là một tính năng, đây là một **triết lý lập trình**.

Thay vì viết các hàm (procedures) rời rạc, OOP giúp bạn mô phỏng thế giới thực vào trong code. Bạn tạo ra các "Khuôn mẫu" (Class) và đúc ra các "Đối tượng" (Object).

* **Class (Lớp):** Là một bản thiết kế. Ví dụ: Bản thiết kế `XeHoi`.
* **Object (Đối tượng):** Là một sản phẩm cụ thể được đúc từ bản thiết kế đó. Ví dụ: `xeCuaTung` (màu đỏ, 4 bánh) và `xeCuaBan` (màu xanh, 2 bánh) là 2 đối tượng *từ cùng* lớp `XeHoi`.

Chúng ta sẽ nói về 4 trụ cột của OOP (Đóng gói, Kế thừa, Đa hình, Trừu tượng) trong các bài viết sau.

### 3. Bậc cao & Tự động "Dọn Rác" (Garbage Collection)

Java là ngôn ngữ bậc cao (gần với ngôn ngữ người). Một trong những tính năng "ăn tiền" nhất là **Automatic Garbage Collection** (Tự động thu gom rác).

Trong các ngôn ngữ như C++, bạn phải tự mình quản lý bộ nhớ. Bạn "mượn" một ô nhớ, dùng xong, bạn phải "trả" lại. Nếu bạn quên "trả", ô nhớ đó bị chiếm dụng mãi mãi (gọi là "memory leak"), và chương trình của bạn sẽ sập vì hết bộ nhớ.

Với Java, JVM hành động như một "quản gia" mẫn cán. JVM tự động theo dõi xem ô nhớ nào không còn ai dùng đến nữa, và nó sẽ tự đi "thu dọn" (giải phóng) ô nhớ đó. Điều này giúp lập trình viên tập trung vào logic nghiệp vụ thay vì lo lắng về quản lý bộ nhớ.

### 4. Bảo mật (Secure)

Nhờ việc chạy code bên trong một "hộp cát" (sandbox) của JVM, Java ngăn chặn các đoạn mã độc truy cập trực tiếp vào phần cứng hoặc các vùng nhớ nhạy cảm của hệ điều hành, khiến nó an toàn hơn cho các ứng dụng mạng.

---

## Kiến Trúc Thần Kỳ: JVM & Bytecode Hoạt Động

Hãy xem lại quy trình 3 bước từ code đến lúc chạy:

1.  **Viết Code (File `.java`):** Bạn viết code bằng ngôn ngữ Java, ví dụ `Student.java`.
2.  **Biên dịch (File `.class`):** Bạn chạy trình biên dịch `javac` (Java Compiler).
    `javac Student.java`
    Lệnh này **không** tạo ra file `.exe` cho Windows. Nó tạo ra "bản vẽ thần kỳ" **`Student.class`**, chứa mã **Java Bytecode** trung gian.
3.  **Thực thi (JVM):** Bạn dùng lệnh `java` để yêu cầu JVM chạy.
    `java Student`
    Lúc này, "Đội Thi Công" JVM tại máy của bạn (Windows JVM, Mac JVM...) sẽ đọc file `.class` đó, thông dịch (hoặc biên dịch JIT) nó ra mã máy gốc của hệ điều hành đó và thực thi.

![Sơ đồ quy trình JVM](/images/jvm.png)

---

## Code Example: Không Chỉ Là "Hello, World!"

Hãy làm một ví dụ phức tạp hơn, thể hiện sức mạnh của "Hướng đối tượng". Chúng ta sẽ tạo một "Khuôn mẫu" `Student` và một chương trình `School` để tạo ra các sinh viên.

#### File 1: `Student.java` (Lớp - Khuôn mẫu)

```java
// Đây là "bản thiết kế" hay "khuôn mẫu" cho một sinh viên
// Nó không phải là một chương trình chạy được

public class Student {
    
    // 1. Thuộc tính (Properties) - Đặc điểm của đối tượng
    String name;
    int age;
    String studentID;

    // 2. Constructor - "Cỗ máy" để đúc ra đối tượng từ khuôn
    // Tên của nó phải trùng với tên Class
    public Student(String name, int age, String id) {
        // "this.name" là "name" của đối tượng
        // "name" (bên phải) là tham số đầu vào
        this.name = name;
        this.age = age;
        this.studentID = id;
        System.out.println("Đã tạo sinh viên: " + this.name);
    }

    // 3. Phương thức (Method) - Hành vi của đối tượng
    public void displayInfo() {
        System.out.println("--- Thông tin Sinh viên ---");
        System.out.println("Tên: " + name);
        System.out.println("Tuổi: " + age);
        System.out.println("MSSV: " + studentID);
        System.out.println("---------------------------");
    }
}