---
title: "Luồng (Stream) trong Java - Đường Ống Dẫn Dữ Liệu Tinh Tế"
date: 2025-10-25T10:00:00+07:00 # Sửa lại ngày hôm nay
draft: false
categories: ["Học Java"]
---

Trong bài 1, chúng ta đã gặp Java, gã khổng lồ đa nền tảng. Nhưng một chương trình mạnh mẽ đến đâu cũng cần "giao tiếp" với thế giới bên ngoài: đọc dữ liệu cấu hình từ file, lưu trạng thái người dùng, nhận yêu cầu từ mạng, gửi phản hồi đi... Tất cả những hoạt động "ra vào" này trong Java đều xoay quanh một khái niệm trung tâm: **Stream (Luồng)**. 🌊

Hãy tưởng tượng **Stream** như một **đường ống nước** một chiều. "Nước" chính là **dữ liệu (data)**, chảy tuần tự từng chút một. Chương trình của bạn có thể lắp đặt đường ống để:

* **Nhận nước vào (Input Stream):** Đọc dữ liệu từ một nguồn (file, bàn phím, kết nối mạng).
* **Xả nước ra (Output Stream):** Ghi dữ liệu đến một đích (file, màn hình, kết nối mạng).

Java I/O API cung cấp một hệ thống "ống nước" cực kỳ linh hoạt và mạnh mẽ.

## Phân Loại Ống Nước: Byte vs. Character

Java chia các loại ống thành 2 họ chính, dựa trên loại "nước" chúng vận chuyển:

### 1. Byte Streams (Luồng Byte) - Vận Chuyển "Nước Thô" 🧱

* Đây là loại ống cơ bản nhất, xử lý dữ liệu dưới dạng **byte** (8 bit).
* Nó dùng để đọc/ghi **mọi loại dữ liệu**: file nhị phân (ảnh `.jpg`, video `.mp4`, file thực thi `.exe`), dữ liệu nén, và cả file text thô.
* Các lớp trừu tượng gốc là `InputStream` và `OutputStream`.
* Các lớp cụ thể phổ biến:
    * `FileInputStream` / `FileOutputStream`: Đọc/ghi file.
    * `ByteArrayInputStream` / `ByteArrayOutputStream`: Đọc/ghi từ mảng byte trong bộ nhớ.
    * `ObjectInputStream` / `ObjectOutputStream`: Đọc/ghi đối tượng Java (sẽ học ở bài Serialization).

### 2. Character Streams (Luồng Ký Tự) - Vận Chuyển "Nước Tinh Khiết" (Văn Bản) 📄

* Loại ống này được tối ưu hóa đặc biệt cho việc đọc/ghi **dữ liệu văn bản (text)**.
* Nó xử lý dữ liệu dưới dạng **ký tự (char)** (16 bit trong Java, hỗ trợ Unicode).
* **Điểm mạnh:** Nó tự động xử lý việc **chuyển đổi mã hóa (encoding)**. Khi bạn đọc một file text (có thể là UTF-8, ANSI...), Character Stream sẽ tự động dịch các byte thành ký tự Java Unicode chuẩn xác, giúp bạn hiển thị tiếng Việt, tiếng Nhật... mà không bị lỗi font chữ "?".
* Các lớp trừu tượng gốc là `Reader` và `Writer`.
* Các lớp cụ thể phổ biến:
    * `FileReader` / `FileWriter`: Đọc/ghi file text (cách đơn giản).
    * `BufferedReader` / `BufferedWriter`: Đọc/ghi text hiệu quả hơn nhờ bộ đệm.
    * `InputStreamReader` / `OutputStreamWriter`: Là những **"cây cầu nối"** quan trọng, giúp chuyển đổi giữa Byte Stream và Character Stream. Ví dụ, bạn có `InputStream` từ mạng (là byte stream), bạn có thể bọc nó bằng `InputStreamReader` để đọc text dễ dàng.

**Khi nào dùng loại nào?**
* Dữ liệu **nhị phân** (ảnh, âm thanh, file nén...) => **Byte Streams**.
* Dữ liệu **văn bản** (code, HTML, JSON, log...) => **Character Streams**.

## Sức Mạnh Kết Hợp: Mô Hình Decorator 🪄

Điều làm cho Java I/O trở nên linh hoạt là khả năng "lắp ráp" các luồng lại với nhau, giống như bạn lắp các đoạn ống nước có chức năng khác nhau. Đây là một mẫu thiết kế (Design Pattern) nổi tiếng gọi là **Decorator**.

Bạn có một luồng cơ bản (ví dụ: `FileInputStream` đọc file), nhưng nó chỉ có chức năng đọc byte thô. Bạn có thể "bọc" (wrap) nó bằng các luồng "trang trí" khác để thêm tính năng:

* `FileInputStream` -> `BufferedInputStream` (Thêm bộ đệm, đọc nhanh hơn)
* `FileInputStream` -> `DataInputStream` (Thêm khả năng đọc các kiểu dữ liệu nguyên thủy như `int`, `double`)
* `FileInputStream` -> `InputStreamReader` (Chuyển byte thành ký tự) -> `BufferedReader` (Đọc cả dòng text)

Bạn có thể lồng nhiều lớp "trang trí" vào nhau!

### Ví dụ : Copy File Ảnh (Dùng Byte Stream & Buffer)

Hãy xem cách dùng `FileInputStream`, `FileOutputStream` và bộ đệm (`BufferedInputStream`, `BufferedOutputStream`) để copy một file ảnh.

```java
import java.io.*;

public class FileCopyByteStreamDemo {

    public static void main(String[] args) {
        String sourceFile = "input.jpg"; // Đặt file ảnh của bạn ở đây
        String destinationFile = "output_copy.jpg";

        // Sử dụng try-with-resources để đảm bảo luồng tự đóng
        try (
            InputStream fis = new FileInputStream(sourceFile);
            BufferedInputStream bis = new BufferedInputStream(fis); // Bọc thêm buffer đọc
            OutputStream fos = new FileOutputStream(destinationFile);
            BufferedOutputStream bos = new BufferedOutputStream(fos) // Bọc thêm buffer ghi
        ) {
            byte[] buffer = new byte[4096]; // Tạo bộ đệm 4KB
            int bytesRead;

            System.out.println("Bắt đầu copy file...");

            // Đọc từ bis vào buffer, ghi từ buffer ra bos
            // bis.read(buffer) trả về số byte đã đọc, hoặc -1 nếu hết file
            while ((bytesRead = bis.read(buffer)) != -1) {
                bos.write(buffer, 0, bytesRead); // Chỉ ghi đúng số byte đã đọc
            }

            System.out.println("Copy file thành công!");

        } catch (FileNotFoundException e) {
            System.err.println("Lỗi: Không tìm thấy file nguồn: " + sourceFile);
        } catch (IOException e) {
            System.err.println("Lỗi I/O: " + e.getMessage());
        }
    }
}