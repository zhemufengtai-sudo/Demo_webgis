FROM node:10-buster

# 设置 npm 源为官方源
RUN npm config set registry https://registry.npmjs.org/

WORKDIR /app

COPY . /app

# 安装 pkg 和 pkg-fetch
RUN npm install -g pkg@5.3.0 && \
    npm install -g pkg-fetch && \
    pkg --version

# 安装构建工具
RUN apt-get update && apt-get install -y \
    make \
    git \
    && rm -rf /var/lib/apt/lists/*

# 将本地已下载的 Node.js 二进制文件复制到容器中
COPY ./pkg-fetch /pkg-fetch

# 设置 pkg-fetch 的缓存路径，指向解压后的目录
ENV PKG_FETCH_CACHE=/pkg-fetch

# 使用 pkg 构建二进制文件
RUN pkg . --targets node10-linux-x64 --output /app/geomodelservicecontainer --debug

# 清理临时文件
RUN rm -rf /pkg-fetch

CMD ["/app/geomodelservicecontainer"]
