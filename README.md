# IOT-smart-traffic

Hệ thống giao thông thông minh dùng camera + rasberry Pi truyền luồng stream qua websocket tới server Nodejs, thực hiện các thuật toán ML để xử lí luồng stream. 

Hệ thống đã xây dựng hiện tại bao gồm những chức năng chính như sau :  
 + Giả lập giao thức xác thực của camera bằng token dựa trên kết nối tcp tới port 8888 và 9999 trên camera. Đồng thời, thiết kế lỗ hổng bảo mật phục vụ mục đích học tập. (Xem thêm file `cam_test.js`, `tcp.c`)
 + Giả lập truyền tải thông tin về xe cộ và hiển thị lên web thông qua giao thức MQTT.
 + Stream video bằng websocket vs Wsavcplayer để decode, đồng thời dùng coco-ssd để detect vật thể. (Xem thêm file `public/vendor/dist/http-live-player.js` hàm `detectFromVideoFrame` và file `views/camera.js`).

## Setup

Trên rasberry pi có kết nối camera, chỉnh sửa `ip` trong file `config/defaul.json` thành ip của máy chủ linux.  

```
git clone https://github.com/hacmao/IOT-smart-traffic.git
cd IOT-smart-traffic/cam
npm install
./run.sh
```

Trên máy chủ Linux, chỉnh sửa `ip` trong file `config/default.json` thành ip của máy chủ rồi sau đó thực thi câu lệnh.  
```
git clone https://github.com/hacmao/IOT-smart-traffic.git
cd IOT-smart-traffic
npm install
node wot-server.js
```

Để kết nối với camera, chỉnh sửa ip của camera trong `sqlite` database.  


## Demo
![](img/2021-01-25-21-03-27.png)

![](img/2021-01-25-21-03-47.png)

![](img/2021-01-25-21-02-48.png)

![](img/2021-01-25-21-03-08.png)




