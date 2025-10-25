---
title: "Java RMI - 'Phép Dịch Chuyển Tức Thời' Cho Đối Tượng Java"
date: 2025-10-25T17:00:00+07:00 # Past date
draft: false
categories: ["Học Java"]
---

Chúng ta đã đi một chặng đường dài trong lập trình mạng Java: từ việc tìm địa chỉ (`InetAddress`), tải nội dung web (`URLConnection`), đến việc thiết lập kênh giao tiếp hai chiều tin cậy (`TCP Socket`), kênh tốc độ cao (`UDP Socket`), và thậm chí "đông lạnh" đối tượng để gửi đi (`Serialization`).

Bây giờ, hãy đến với một khái niệm trừu tượng và mạnh mẽ hơn: **Java RMI (Remote Method Invocation - Gọi Phương Thức Từ Xa)**.

Hãy tưởng tượng bạn có thể ngồi ở máy Client và gọi một phương thức của đối tượng đang chạy trên máy Server *y như thể* đối tượng đó đang nằm ngay trên máy Client của bạn. Bạn không cần bận tâm đến việc mở Socket, tạo `ObjectOutputStream`, hay xử lý lỗi mạng. Bạn chỉ cần viết: `remoteCalculator.add(5, 3)` và nhận kết quả.

Đó chính là phép màu của RMI! ✨ Nó tạo ra một lớp trừu tượng cao cấp, che giấu hoàn toàn sự phức tạp của việc giao tiếp mạng, cho phép bạn xây dựng các **ứng dụng phân tán (Distributed Applications)** một cách tự nhiên theo đúng phong cách Hướng Đối Tượng của Java.

---

## Tại Sao Cần RMI? Vượt Lên Socket Cơ Bản

Lập trình Socket trực tiếp rất mạnh mẽ nhưng cũng rất "thủ công":
* Bạn phải tự định nghĩa giao thức (protocol).
* Bạn phải tự xử lý việc tuần tự hóa/giải tuần tự hóa dữ liệu.
* Bạn phải tự quản lý kết nối, xử lý lỗi mạng.

RMI tự động hóa tất cả những việc này:
* **Giao thức:** RMI sử dụng giao thức riêng (JRMP) hoặc IIOP.
* **Tuần tự hóa:** RMI tự động dùng Java Serialization.
* **Quản lý kết nối:** RMI tự lo việc thiết lập và duy trì kết nối.

---

## Mô Hình Kiến Trúc RMI: Ai Làm Gì? 🎭

Một hệ thống RMI điển hình bao gồm:

1.  **Remote Interface:** `interface` Java kế thừa `java.rmi.Remote`, định nghĩa các phương thức gọi từ xa (phải `throws RemoteException`). Đây là "hợp đồng".
2.  **Remote Object Implementation:** Lớp Java `implements` Remote Interface, thường kế thừa `java.rmi.server.UnicastRemoteObject`. Chứa code logic thật sự trên Server.
3.  **RMI Registry:** "Danh bạ" chạy trên Server. Server đăng ký (bind) đối tượng vào Registry với một tên duy nhất.
4.  **Stub:** Proxy chạy trên Client, có cùng kiểu Remote Interface. Client lấy Stub từ Registry thông qua `lookup()`. Khi Client gọi phương thức trên Stub, Stub đóng gói tham số, gửi qua mạng.
5.  **Skeleton (ẩn):** Phía Server nhận yêu cầu từ Stub, giải nén, gọi phương thức trên Remote Object thật, đóng gói kết quả, gửi lại cho Stub.



---

## Ví Dụ Code Chi Tiết: Máy Tính Từ Xa

Chúng ta sẽ tạo 4 file `.java` riêng biệt.

```java
// File: Calculator.java (Remote Interface)
import java.rmi.Remote;
import java.rmi.RemoteException;

public interface Calculator extends Remote {
    int add(int a, int b) throws RemoteException;
    int subtract(int a, int b) throws RemoteException; // Thêm phương thức trừ
}

// --------------------------------------------------

// File: CalculatorImpl.java (Remote Object Implementation)
import java.rmi.server.UnicastRemoteObject;
import java.rmi.RemoteException;

public class CalculatorImpl extends UnicastRemoteObject implements Calculator {

    // Constructor mặc định (bắt buộc cho UnicastRemoteObject)
    protected CalculatorImpl() throws RemoteException {
        super(); 
    }

    @Override
    public int add(int a, int b) throws RemoteException {
        System.out.println("SERVER: Nhận được yêu cầu add(" + a + ", " + b + ")");
        return a + b;
    }

    @Override
    public int subtract(int a, int b) throws RemoteException {
        System.out.println("SERVER: Nhận được yêu cầu subtract(" + a + ", " + b + ")");
        return a - b;
    }
}

// --------------------------------------------------

// File: Server.java (Khởi tạo, Đăng ký)
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.rmi.RemoteException;

public class Server {
    public static void main(String[] args) {
        try {
            // 1. Tạo đối tượng dịch vụ
            CalculatorImpl calculator = new CalculatorImpl();
            System.out.println("SERVER: Đã tạo đối tượng CalculatorImpl.");

            // 2. Tạo hoặc lấy RMI Registry đang chạy ở cổng 1099
            Registry registry;
            try {
                registry = LocateRegistry.createRegistry(1099); // Thử tạo mới
                System.out.println("SERVER: Đã tạo RMI Registry ở cổng 1099.");
            } catch (RemoteException e) {
                System.out.println("SERVER: RMI Registry có vẻ đã chạy, đang lấy tham chiếu...");
                registry = LocateRegistry.getRegistry(1099);
            }

            // 3. Đăng ký (bind) đối tượng dịch vụ vào Registry
            registry.rebind("MyCalculatorService", calculator); // Dùng tên khác
            System.out.println("SERVER: Đã đăng ký 'MyCalculatorService' vào Registry.");

            System.out.println("SERVER: Sẵn sàng nhận yêu cầu từ Client.");

        } catch (Exception e) { 
            System.err.println("SERVER: Gặp lỗi: " + e.toString());
            e.printStackTrace();
        }
    }
}

// --------------------------------------------------

// File: Client.java (Tra cứu, Gọi phương thức)
import java.rmi.registry.LocateRegistry;
import java.rmi.registry.Registry;
import java.util.Scanner;

public class Client {
    public static void main(String[] args) {
        String serverHost = "localhost"; 
        if (args.length > 0) {
           serverHost = args[0]; 
        }

        try {
            // 1. Lấy tham chiếu đến Registry
            System.out.println("CLIENT: Đang kết nối đến RMI Registry tại " + serverHost + ":1099...");
            Registry registry = LocateRegistry.getRegistry(serverHost, 1099);
            System.out.println("CLIENT: Kết nối Registry thành công.");

            // 2. Tra cứu (lookup) đối tượng từ xa
            System.out.println("CLIENT: Đang tìm dịch vụ 'MyCalculatorService'...");
            Calculator calculatorStub = (Calculator) registry.lookup("MyCalculatorService"); 
            System.out.println("CLIENT: Đã lấy được Stub của MyCalculatorService.");

            // 3. Tương tác với người dùng và gọi phương thức từ xa
            Scanner scanner = new Scanner(System.in);
            while (true) {
                System.out.println("\nChọn phép toán:");
                System.out.println("1. Cộng (add)");
                System.out.println("2. Trừ (subtract)");
                System.out.println("0. Thoát");
                System.out.print("Lựa chọn của bạn: ");
                int choice = scanner.nextInt();

                if (choice == 0) break;

                System.out.print("Nhập số a: ");
                int a = scanner.nextInt();
                System.out.print("Nhập số b: ");
                int b = scanner.nextInt();

                int result;
                if (choice == 1) {
                    System.out.println("CLIENT: Gọi phương thức add(" + a + ", " + b + ") từ xa...");
                    result = calculatorStub.add(a, b); 
                    System.out.println("CLIENT: Nhận kết quả từ Server: " + result);
                } else if (choice == 2) {
                     System.out.println("CLIENT: Gọi phương thức subtract(" + a + ", " + b + ") từ xa...");
                    result = calculatorStub.subtract(a, b); 
                    System.out.println("CLIENT: Nhận kết quả từ Server: " + result);
                } else {
                    System.out.println("Lựa chọn không hợp lệ.");
                }
            }
            scanner.close();
            System.out.println("CLIENT: Kết thúc.");

        } catch (Exception e) {
            System.err.println("CLIENT: Gặp lỗi: " + e.toString());
            e.printStackTrace();
        }
    }
}