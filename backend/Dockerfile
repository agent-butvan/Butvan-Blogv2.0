# -----------------
# 1. 编译构建阶段
# -----------------
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# 拷贝父项目及子模块的 pom.xml
COPY pom.xml .
COPY blog-common/pom.xml blog-common/
COPY blog-pojo/pom.xml blog-pojo/
COPY blog-service/pom.xml blog-service/

# 下载依赖（利用 Docker 缓存机制）
RUN mvn dependency:go-offline -B

# 拷贝各模块源码并打包
COPY blog-common/src blog-common/src
COPY blog-pojo/src blog-pojo/src
COPY blog-service/src blog-service/src
RUN mvn clean package -DskipTests

# -----------------
# 2. 运行阶段
# -----------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# 安装 HEIC/HEIF 图片格式转换工具（heif-convert）
RUN apk add --no-cache libheif-tools

# 拷贝编译完成的可运行包
COPY --from=builder /app/blog-service/target/blog-service-*.jar app.jar

ENV PORT=8080
EXPOSE 8080

# 生产环境运行（限制最大堆内存 384M，初始堆内存 256M，防止 2C2G 服务器 OOM 假死）
ENTRYPOINT ["java", "-Xms256m", "-Xmx384m", "-jar", "app.jar", "--spring.profiles.active=prod"]

