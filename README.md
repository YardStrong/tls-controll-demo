Node 8.12.0

---

tls 连接 demo



Server端 ``node bin/startServer.js``

Client端  ``node bin/testClient.js``



---



遇到的在生产中使用场景：

Server端关闭证书验证，嵌入式Linux使用Socat工具提供连接，脚本见 ``script/remoteTTY.sh``

