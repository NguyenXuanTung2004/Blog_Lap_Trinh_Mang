---
title: "Tuần Tự Hóa (Serialization) - Phép Thuật 'Đông Lạnh' và 'Hồi Sinh' Đối Tượng Java"
date: 2025-10-23T16:00:00+07:00 # Past date
draft: false
categories: ["Học Java"]
---

Chúng ta đã thành thạo việc gửi các chuỗi ký tự (text) qua mạng bằng cả TCP và UDP. Nhưng sức mạnh thực sự của Java nằm ở Lập trình Hướng Đối Tượng (OOP). Sẽ ra sao nếu chúng ta muốn gửi không chỉ là text, mà là **toàn bộ trạng thái của một đối tượng Java** - ví dụ, một đối tượng `User` với `username`, `passwordHash`, `lastLoginTime` - từ Client lên Server để lưu vào database, hoặc từ Server gửi xuống Client để cập nhật giao diện?

Vấn đề là, mạng Internet hay ổ đĩa cứng không hiểu khái niệm "đối tượng Java" trong bộ nhớ RAM là gì. Chúng chỉ hiểu **dãy các byte (sequence of bytes)**.

**Tuần tự hóa (Serialization)** chính là cây cầu nối giữa hai thế giới này. Nó là quá trình "đông lạnh" 🥶 một đối tượng Java đang "sống" trong bộ nhớ (cùng với tất cả các thuộc tính của nó) thành một **luồng byte** tuần tự. Luồng byte này sau đó có thể:
* **Lưu trữ:** Ghi ra file để lưu trạng thái (`.ser`).
* **Vận chuyển:** Gửi qua mạng (TCP, UDP).
* **Truyền giữa các tiến trình:** Chia sẻ dữ liệu giữa các ứng dụng khác nhau.

**Giải tuần tự hóa (Deserialization)** là quá trình ngược lại: đọc luồng byte đó từ file hoặc từ mạng và "rã đông" 🔥, tái tạo lại (reconstruct) một bản sao y hệt của đối tượng ban đầu trong bộ nhớ.

---

## Điều Kiện Tiên Quyết: Giao Diện `java.io.Serializable`

Để một đối tượng Java có khả năng được "đông lạnh", Lớp (Class) của nó **bắt buộc** phải triển khai (implements) giao diện `java.io.Serializable`.

`Serializable` là một **Marker Interface** (Giao diện đánh dấu). Nó không định nghĩa bất kỳ phương thức nào mà lớp của bạn phải viết code. Việc `implements Serializable` chỉ đơn giản là một "tín hiệu" báo cho JVM biết rằng "Tôi cho phép đối tượng thuộc lớp này được tuần tự hóa". JVM sẽ tự động lo phần còn lại dựa trên cấu trúc của lớp.

**Quan trọng:** Nếu lớp của bạn chứa thuộc tính là đối tượng của lớp khác (ví dụ: `User` có thuộc tính `Address address`), thì lớp `Address` đó **cũng phải** `implements Serializable`. Nếu không, quá trình tuần tự hóa sẽ thất bại.

---

## Bộ Đôi Quyền Lực: `ObjectOutputStream` & `ObjectInputStream`

Để thực hiện việc "đông lạnh" và "hồi sinh", Java cung cấp hai lớp luồng đặc biệt (thuộc mô hình Decorator):

* **`java.io.ObjectOutputStream`:** Dùng để **tuần tự hóa (ghi)** đối tượng. Nó "bọc" một `OutputStream` cơ bản và có phương thức `writeObject(yourObject)`.
* **`java.io.ObjectInputStream`:** Dùng để **giải tuần tự hóa (đọc)** đối tượng. Nó "bọc" một `InputStream` cơ bản và có phương thức `readObject()`, trả về `Object` (cần ép kiểu).

---

## Ví dụ: Lưu và Tải lại Đối Tượng `User` vào File

```java
import java.io.*;

// Lớp User phải Serializable
class User implements Serializable {
    private static final long serialVersionUID = 1L; // Để quản lý phiên bản
    String username;
    transient String password; // Thuộc tính này sẽ KHÔNG được lưu
    int level;

    public User(String username, String password, int level) {
        this.username = username;
        this.password = password;
        this.level = level;
    }

    @Override
    public String toString() {
        // Lưu ý: Password sẽ là null khi đọc lại do 'transient'
        return "User [username=" + username + ", password=" + password + ", level=" + level + "]";
    }
}

// Lớp chính để chạy demo
public class SerializationFileDemo {
    public static void main(String[] args) {
        String filename = "user.ser"; // File để lưu đối tượng

        // --- BƯỚC 1: TẠO VÀ TUẦN TỰ HÓA (GHI) ĐỐI TƯỢNG ---
        User userToWrite = new User("NguyenVanA", "mySecret123", 5);
        System.out.println("Đối tượng gốc:\n" + userToWrite);

        try (
            FileOutputStream fos = new FileOutputStream(filename);
            ObjectOutputStream oos = new ObjectOutputStream(fos) // Bọc FileOutputStream
        ) {
            System.out.println("\nĐang tuần tự hóa và ghi ra file...");
            oos.writeObject(userToWrite); // Thực hiện "đông lạnh" và ghi
            System.out.println("Ghi file thành công!");
        } catch (IOException e) {
            System.err.println("Lỗi khi ghi đối tượng: " + e.getMessage());
        }

        // --- BƯỚC 2: GIẢI TUẦN TỰ HÓA (ĐỌC) ĐỐI TƯỢNG ---
        System.out.println("\n--- Đọc lại đối tượng từ file ---");
        User userToRead = null;

        try (
            FileInputStream fis = new FileInputStream(filename);
            ObjectInputStream ois = new ObjectInputStream(fis) // Bọc FileInputStream
        ) {
            System.out.println("Đang đọc và giải tuần tự hóa...");
            // Đọc từ luồng byte và "hồi sinh" thành đối tượng User
            userToRead = (User) ois.readObject(); 
            System.out.println("Đọc thành công!");
            System.out.println("Đối tượng đọc được:\n" + userToRead);

        } catch (IOException e) {
            System.err.println("Lỗi khi đọc đối tượng: " + e.getMessage());
        } catch (ClassNotFoundException e) {
            // Xảy ra nếu chương trình đọc không tìm thấy file .class của lớp User
            System.err.println("Lỗi: Không tìm thấy lớp 'User' khi giải tuần tự hóa.");
        }
    }
}