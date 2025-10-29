---
title: "Ba Chàng Ngự Lâm Mạng Java (InetAddress, URL, URLConnection)"
date: 2025-10-20T14:00:00+07:00
draft: false
categories: ["Networking"]
tags: ["Java", "Networking", "IP", "URL"]
image: featured-image.jpg
---

Trước khi bắt tay vào xây dựng các "đường hầm" (Sockets) phức tạp để giao tiếp hai chiều, mọi lập trình viên mạng cần nắm vững cách xác định và tương tác với "địa chỉ" trên Internet. Giống như bạn không thể gửi thư nếu không biết địa chỉ người nhận, chương trình Java cũng không thể kết nối nếu không biết "tọa độ" của máy chủ đích.

Trong Java, có ba lớp cốt lõi, như "ba chàng ngự lâm", giúp bạn xử lý các vấn đề về địa chỉ và kết nối cơ bản: `InetAddress`, `URL`, và `URLConnection`.

***

## 1. `InetAddress`: Tấm Bản Đồ Tra Cứu Tọa Độ IP 🗺️

Trong thế giới thực, chúng ta dùng địa chỉ nhà (`Số 10, phố Quang Trung`) vì nó dễ nhớ. Nhưng hệ thống định vị (GPS) lại cần tọa độ (`21.02° N, 105.85° E`) để tìm đường.

Trên Internet cũng vậy:
* **Tên miền (Domain Name):** Như `google.com`, `facebook.com`. Con người dễ nhớ, dễ gõ.
* **Địa chỉ IP (IP Address):** Như `142.250.204.142` (IPv4) hoặc `2404:6800:4003:c07::8e` (IPv6). Đây là "tọa độ" thật sự mà các thiết bị mạng (router) dùng để tìm đường đi cho dữ liệu.

Lớp `java.net.InetAddress` chính là "cuốn danh bạ" hay "tấm bản đồ" giúp bạn thực hiện **Phân giải Tên miền (DNS Lookup)**: chuyển đổi giữa tên miền dễ nhớ và địa chỉ IP khó nhớ.

### DNS Lookup: Phép Thuật Phía Sau Hậu Trường

Khi bạn gọi `InetAddress.getByName("google.com")`, điều gì xảy ra?
1.  Chương trình Java của bạn hỏi Hệ điều hành (Windows, Linux...).
2.  Hệ điều hành kiểm tra cache DNS cục bộ (xem gần đây có tra cứu `google.com` chưa).
3.  Nếu không có, nó hỏi máy chủ DNS được cấu hình trong mạng của bạn (thường là của nhà mạng VNPT, FPT...).
4.  Máy chủ DNS này có thể lại phải hỏi các máy chủ DNS cấp cao hơn (Root DNS, TLD DNS...).
5.  Cuối cùng, một máy chủ DNS "có thẩm quyền" cho `google.com` sẽ trả về(các) địa chỉ IP tương ứng.
6.  Kết quả IP được trả về cho chương trình Java của bạn dưới dạng đối tượng `InetAddress`.

### Ví Dụ Chi Tiết Hơn

```java
import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Arrays;

public class InetAddressAdvancedDemo {
    public static void main(String[] args) {
        String[] domains = {"google.com", "facebook.com", "vnexpress.net", "invalid-domain-xyz123.com"};

        for (String domain : domains) {
            System.out.println("--- Phân giải tên miền: " + domain + " ---");
            try {
                // Lấy TẤT CẢ các địa chỉ IP liên kết với tên miền này
                // (Nhiều trang lớn dùng nhiều IP để cân bằng tải - Load Balancing)
                InetAddress[] addresses = InetAddress.getAllByName(domain);

                System.out.println("Tìm thấy " + addresses.length + " địa chỉ IP:");
                for (InetAddress addr : addresses) {
                    System.out.println("  - Host Name: " + addr.getHostName()); // Có thể vẫn là domain hoặc tên cụ thể hơn
                    System.out.println("    IP Address: " + addr.getHostAddress());
                    System.out.println("    Is Loopback: " + addr.isLoopbackAddress()); // Có phải là localhost (127.0.0.1)?
                    System.out.println("    Is Site Local: " + addr.isSiteLocalAddress()); // Có phải IP mạng nội bộ (192.168...)?
                }

            } catch (UnknownHostException e) {
                // Xảy ra khi tên miền không tồn tại hoặc máy chủ DNS không phản hồi
                System.err.println(" LỖI: Không thể phân giải tên miền '" + domain + "'. Lý do: " + e.getMessage());
            }
            System.out.println(); // In dòng trống cho dễ nhìn
        }

        // Lấy thông tin máy hiện tại
        try {
            System.out.println("--- Thông tin máy cục bộ ---");
            InetAddress localhost = InetAddress.getLocalHost();
            System.out.println(" My Host Name: " + localhost.getHostName());
            System.out.println(" My IP Address: " + localhost.getHostAddress());
        } catch (UnknownHostException e) {
            System.err.println(" LỖI: Không lấy được thông tin máy cục bộ.");
        }
    }
}