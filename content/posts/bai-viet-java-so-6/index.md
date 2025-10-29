---
title: "Socket UDP - Gửi Dữ Liệu Tốc Hành, Không Cần 'Bắt Tay'"
date: 2025-10-22T15:00:00+07:00
draft: false
categories: ["Networking"]
tags: ["Java", "Networking", "Socket", "UDP"]
image: featured-image.jpg
---

Trong thế giới mạng, TCP giống như một cuộc gọi điện thoại được đảm bảo: bạn phải quay số, chờ người kia nhấc máy, nói chuyện và đảm bảo từng lời được nghe đúng. Ngược lại, **UDP (User Datagram Protocol)** giống như việc bạn **viết thông tin lên một loạt bưu thiếp và thả vào hòm thư** 📮.

Đặc điểm chính của UDP:

1.  **Không Kết Nối (Connectionless):** Không cần "bắt tay" (handshake). Bên gửi chỉ cần biết địa chỉ IP và cổng của bên nhận, đóng gói dữ liệu vào một "bưu thiếp" (`DatagramPacket`) và "ném" nó vào mạng. Bên nhận chỉ cần "mở hòm thư" (`DatagramSocket`) ở cổng đó và chờ thư đến.
2.  **Không Đáng Tin Cậy (Unreliable):** Internet (bưu điện) **không đảm bảo** bưu thiếp sẽ đến đích. Nó có thể bị thất lạc, bị hỏng trên đường đi, hoặc đến nơi nhưng bị hỏng (checksum error). UDP không tự động gửi lại. Nếu cần độ tin cậy, ứng dụng tầng trên (ví dụ: game của bạn) phải tự xử lý.
3.  **Không Theo Thứ Tự (Out-of-Order Delivery):** Bạn gửi 3 bưu thiếp 1, 2, 3. Người nhận có thể nhận được theo thứ tự 3, 1, 2 hoặc chỉ nhận được 1 và 3. UDP không đảm bảo thứ tự.
4.  **Nhẹ và Nhanh (Lightweight & Fast):** Chính vì bỏ qua các cơ chế đảm bảo của TCP (handshake, sequence number, acknowledgement, retransmission), UDP có phần header rất nhỏ và xử lý rất nhanh. Nó không gây thêm độ trễ (latency) không cần thiết.

**Khi nào nên dùng UDP?**
Khi **tốc độ** quan trọng hơn **độ tin cậy tuyệt đối**, và ứng dụng có thể chấp nhận hoặc tự xử lý việc mất mát/sai thứ tự gói tin.
* **Game thời gian thực (Real-time Gaming):** Gửi vị trí người chơi. Mất một gói tin vị trí cũ không quá tệ, miễn là các vị trí mới đến nhanh.
* **Truyền phát Video/Audio (Streaming - VoIP, IPTV):** Mất một vài khung hình/mẫu âm thanh thường ít ảnh hưởng hơn là bị giật/lag do chờ gói tin bị mất của TCP.
* **DNS (Domain Name System):** Yêu cầu phân giải tên miền cần phản hồi nhanh nhất có thể.
* **DHCP (Dynamic Host Configuration Protocol):** Cấp phát địa chỉ IP trong mạng LAN.

### Thành Phần Chính: `DatagramSocket` và `DatagramPacket`

Thay vì `Socket` và `Stream` của TCP, UDP dùng:
* `java.net.DatagramSocket`: Đại diện cho "hòm thư" tại một cổng (port) cụ thể trên máy bạn. Nó dùng để **gửi** và **nhận** các `DatagramPacket`.
* `java.net.DatagramPacket`: Chính là "tấm bưu thiếp". Nó là một gói dữ liệu chứa:
    * Mảng byte dữ liệu (`byte[] data`).
    * Độ dài dữ liệu (`int length`).
    * Địa chỉ IP của người nhận/người gửi (`InetAddress address`).
    * Cổng của người nhận/người gửi (`int port`).

### 1. `UDPEchoServer.java` - Người Nhận và Phản Hồi Bưu Thiếp 📬

Server tạo `DatagramSocket` để lắng nghe trên một cổng cố định.

```java
import java.net.DatagramSocket;
import java.net.DatagramPacket;
import java.net.InetAddress;
import java.io.IOException;

public class UDPEchoServer {
    public static void main(String[] args) {
        final int PORT = 9876; // Cổng lắng nghe
        final int BUFFER_SIZE = 1024; // Kích thước tối đa của một bưu thiếp nhận

        DatagramSocket socket = null;

        try {
            // 1. Tạo DatagramSocket để lắng nghe trên PORT
            socket = new DatagramSocket(PORT);
            System.out.println("UDP Echo Server đang lắng nghe trên cổng " + PORT + "...");

            byte[] receiveBuffer = new byte[BUFFER_SIZE];

            // Vòng lặp vô hạn để phục vụ nhiều client (nhưng vẫn đơn tuyến)
            while (true) { 
                // 2. Tạo DatagramPacket rỗng để chuẩn bị nhận dữ liệu
                // Packet này sẽ được điền thông tin (dữ liệu, IP, port người gửi) khi nhận
                DatagramPacket receivePacket = new DatagramPacket(receiveBuffer, receiveBuffer.length);

                // 3. Chờ nhận Packet (blocking call)
                // Chương trình sẽ dừng ở đây cho đến khi có packet đến
                socket.receive(receivePacket); 

                // 4. Xử lý Packet nhận được
                InetAddress clientAddress = receivePacket.getAddress(); // Lấy IP người gửi
                int clientPort = receivePacket.getPort();            // Lấy Port người gửi
                // Lấy dữ liệu, chỉ lấy đúng phần có nội dung (getLength)
                String clientMessage = new String(receivePacket.getData(), 0, receivePacket.getLength()); 
                
                System.out.println("Nhận từ [" + clientAddress.getHostAddress() + ":" + clientPort + "]: " + clientMessage);

                // 5. Chuẩn bị Packet để gửi phản hồi (echo)
                byte[] sendBuffer = clientMessage.toUpperCase().getBytes(); // Chuyển thành chữ hoa rồi gửi lại
                
                // Tạo Packet gửi đi, chỉ rõ địa chỉ và port của Client đã gửi đến
                DatagramPacket sendPacket = new DatagramPacket(sendBuffer, sendBuffer.length, clientAddress, clientPort);

                // 6. Gửi Packet phản hồi
                socket.send(sendPacket);
                System.out.println("   -> Đã gửi phản hồi echo (chữ hoa)");

                // Reset buffer nhận cho lần lặp sau (không bắt buộc nhưng nên làm)
                // receiveBuffer = new byte[BUFFER_SIZE]; // Hoặc dùng Arrays.fill
            }
        } catch (IOException e) {
            System.err.println("Lỗi Server UDP: " + e.getMessage());
            e.printStackTrace();
        } finally {
            if (socket != null && !socket.isClosed()) {
                socket.close();
                System.out.println("Server UDP đã đóng.");
            }
        }
    }
}