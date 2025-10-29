---
title: "Socket TCP - Thiết Lập Đường Dây Nóng Hai Chiều"
date: 2025-10-21T09:00:00+07:00
draft: false
categories: ["Networking"]
tags: ["Java", "Networking", "Socket", "TCP"]
image: featured-image.jpg
---

Ở bài trước, `URLConnection` giống như việc bạn gửi yêu cầu đến một máy chủ web và nhận lại trang HTML - một tương tác khá thụ động. Bây giờ, chúng ta sẽ bước vào thế giới "chủ động" hơn: tạo ra một kênh giao tiếp **hai chiều**, **liên tục** giữa hai chương trình Java chạy trên các máy khác nhau (hoặc trên cùng một máy). Công cụ chính cho việc này là **Socket**. 🔌

Hãy tưởng tượng **Socket** như một cặp **điện thoại** được kết nối qua một **đường dây riêng**. Giao thức **TCP (Transmission Control Protocol)** chính là "dịch vụ đảm bảo" của công ty viễn thông chạy trên đường dây đó.

Khi bạn lập trình với Socket TCP, bạn đang mô phỏng một cuộc gọi điện thoại:

1.  **Hướng Kết Nối (Connection-Oriented):** Phải có sự "bắt tay" (handshake) ban đầu. Client (người gọi) phải chủ động quay số (địa chỉ IP + cổng) của Server (người nghe). Server phải "nhấc máy" (chấp nhận kết nối) trước khi cuộc trò chuyện bắt đầu. Một kết nối ảo được thiết lập và duy trì.
2.  **Đáng Tin Cậy (Reliable):** Đây là điểm mạnh nhất của TCP. Nó đảm bảo rằng mọi byte dữ liệu bạn gửi đi sẽ đến được đầu bên kia, **đúng thứ tự**, và **không bị lỗi**. Nếu một gói tin bị mất trên đường truyền, TCP sẽ tự động phát hiện và yêu cầu gửi lại mà bạn không cần can thiệp. Giống như nhà mạng đảm bảo bạn không bị mất chữ nào khi nói chuyện.
3.  **Dựa Trên Luồng (Stream-Based):** Sau khi kết nối thành công, TCP tạo ra hai "đường ống" (luồng I/O) ảo giữa hai điện thoại: một `InputStream` để "nghe" dữ liệu đến và một `OutputStream` để "nói" dữ liệu đi. Bạn chỉ cần đọc/ghi vào các luồng này, TCP sẽ lo phần còn lại.

Mô hình kinh điển của Socket TCP là **Client-Server**:
* **Server:** Chạy trước, "mở" một cổng (port) trên máy và lắng nghe các yêu cầu kết nối đến. Nó giống như một tổng đài viên chờ điện thoại reo.
* **Client:** Chạy sau, biết địa chỉ IP và cổng của Server, chủ động thực hiện kết nối. Nó là người gọi đến tổng đài.

### 1. `Server.java` - Tổng Đài Viên Kiên Nhẫn ☎️

Server sử dụng lớp `java.net.ServerSocket` để "đặt" một dịch vụ tại một cổng cụ thể và chờ đợi.

```java
import java.net.ServerSocket;
import java.net.Socket;
import java.io.PrintWriter; // Dùng PrintWriter cho tiện gửi text
import java.io.BufferedReader; // Dùng BufferedReader cho tiện đọc text
import java.io.InputStreamReader;
import java.io.IOException;
import java.net.InetAddress;

public class TCPEchoServer {
    public static void main(String[] args) {
        final int PORT = 12345; // Chọn một cổng chưa được sử dụng (trên 1024)

        ServerSocket serverSocket = null;
        Socket clientSocket = null;
        BufferedReader reader = null;
        PrintWriter writer = null;

        try {
            // 1. Tạo ServerSocket để lắng nghe trên cổng PORT
            // Tham số thứ 2 (backlog) là số lượng kết nối chờ tối đa trong hàng đợi
            serverSocket = new ServerSocket(PORT, 50); 
            InetAddress serverIP = InetAddress.getLocalHost(); // Lấy IP của máy chủ
            System.out.println("Echo Server đang chạy tại IP: " + serverIP.getHostAddress() + " trên cổng " + PORT);
            System.out.println("Đang chờ Client kết nối...");

            // 2. Chấp nhận kết nối từ Client (blocking call)
            // Chương trình sẽ dừng ở đây cho đến khi có Client kết nối
            clientSocket = serverSocket.accept(); 
            InetAddress clientIP = clientSocket.getInetAddress();
            int clientPort = clientSocket.getPort();
            System.out.println("-> Client đã kết nối từ IP: " + clientIP.getHostAddress() + ", Port: " + clientPort);

            // 3. Tạo luồng đọc (để nhận từ Client) và luồng ghi (để gửi cho Client)
            // Bọc InputStream bằng InputStreamReader (chuyển byte thành char) 
            // và BufferedReader (đọc cả dòng)
            reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            
            // Bọc OutputStream bằng PrintWriter (ghi text tiện lợi, autoFlush=true để tự đẩy đi)
            writer = new PrintWriter(clientSocket.getOutputStream(), true); 

            // 4. Vòng lặp giao tiếp: Đọc tin nhắn và gửi lại (Echo)
            String clientMessage;
            System.out.println("Bắt đầu phiên Echo. Gõ 'bye' từ Client để kết thúc.");
            while ((clientMessage = reader.readLine()) != null) { // Đọc từng dòng Client gửi
                System.out.println("   Client -> Server: " + clientMessage);
                
                // Kiểm tra điều kiện dừng
                if ("bye".equalsIgnoreCase(clientMessage.trim())) {
                    writer.println("Tạm biệt!"); // Gửi lời chào cuối
                    break; // Thoát vòng lặp
                }
                
                // Gửi lại (echo) tin nhắn cho Client, thêm tiền tố "Server Echo: "
                writer.println("Server Echo: " + clientMessage); 
            }

        } catch (IOException e) {
            System.err.println("Lỗi Server: " + e.getMessage());
            e.printStackTrace();
        } finally {
            // 5. Đóng tất cả tài nguyên (rất quan trọng!)
            // Đóng theo thứ tự ngược lại khi mở
            System.out.println("Đang đóng kết nối...");
            try {
                if (writer != null) writer.close();
                if (reader != null) reader.close();
                if (clientSocket != null) clientSocket.close();
                if (serverSocket != null) serverSocket.close();
                System.out.println("Server đã dừng.");
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }
}