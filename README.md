Node 8.12.0

---

tls 连接 demo



Server端 ``node bin/startServer.js``

Client端  ``node bin/testClient.js``



---



遇到的在生产中使用场景：

Server端关闭证书验证，嵌入式Linux使用Socat工具提供连接，脚本见 ``script/remoteTTY.sh``

推测其开发者原本想要使用 tls证书连接（server和嵌入式设备），但是使用中设备端只接受server控制，而server端有 设备SN码验证流程，所以舍弃了tls证书验证，只保留了tls加密连接

