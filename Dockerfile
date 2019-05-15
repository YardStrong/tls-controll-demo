FROM node:8.12.0
MAINTAINER yardstrong<yardstrong@163.com>

RUN \
    rm /etc/localtime && \
    ln -s /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /app

COPY . /app

EXPOSE 8091

CMD ["node", "/app/bin/tlsServerStart.js"]
