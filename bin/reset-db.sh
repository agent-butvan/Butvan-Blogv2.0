#!/bin/bash

# ============================================================================
# Butvan Blog 2.0 - 本地开发数据库一键重置脚本
#
# 警告：此操作将清空本地数据库的所有数据，并重新初始化！
# ============================================================================

# 颜色控制
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}======================================================${NC}"
echo -e "${YELLOW}   警告：此脚本将重置本地 Docker 中的 PostgreSQL 数据库！ ${NC}"
echo -e "${YELLOW}   本地数据库中保存的临时文章、评论及交互配置将会被全部清空。${NC}"
echo -e "${YELLOW}======================================================${NC}"

# 如果有交互式环境，则要求确认。若是自动环境则直接执行。
if [ -t 0 ]; then
    read -p "确定要继续重置本地数据库吗？(y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}已取消重置操作。${NC}"
        exit 0
    fi
fi

# 获取当前工作目录，确保在项目根目录运行
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT" || exit 1

# 解析 .env 文件中的数据库账号，获取最准确的配置
DB_USER="butvan"
if [ -f ".env" ]; then
    ENV_USER=$(grep -E "^POSTGRES_USER=" .env | cut -d'=' -f2 | tr -d '\r' | tr -d '"' | tr -d "'")
    if [ -n "$ENV_USER" ]; then
        DB_USER="$ENV_USER"
    fi
fi

# 寻找可用的 PostgreSQL 容器 (优先 blog-postgres，其次 pgsql)
CONTAINER_NAME=""
if docker ps --format '{{.Names}}' | grep -q "^blog-postgres$"; then
    CONTAINER_NAME="blog-postgres"
elif docker ps --format '{{.Names}}' | grep -q "^pgsql$"; then
    CONTAINER_NAME="pgsql"
fi

if [ -n "$CONTAINER_NAME" ]; then
    echo -e "\n${BLUE}[1/2] 检测到正在运行的 PostgreSQL 容器: ${CONTAINER_NAME}${NC}"
    echo -e "正在使用用户 '${DB_USER}' 强制断开连接并重建 'butvan_blog' 数据库..."
    
    # 必须连到 template1 或 postgres 默认库上，才能 DROP butvan_blog 数据库
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d template1 -c "
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'butvan_blog'
          AND pid <> pg_backend_pid();
    " >/dev/null 2>&1

    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d template1 -c "DROP DATABASE IF EXISTS butvan_blog;"
    docker exec -i "$CONTAINER_NAME" psql -U "$DB_USER" -d template1 -c "CREATE DATABASE butvan_blog WITH OWNER = ${DB_USER};"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}数据库 butvan_blog 重建成功！${NC}"
    else
        echo -e "${RED}数据库重建失败，请检查容器权限或手动执行重建。${NC}"
        exit 1
    fi
else
    echo -e "\n${YELLOW}[警告] 未检测到运行中的 Docker 容器 (blog-postgres 或 pgsql)。${NC}"
    echo -e "尝试使用本地宿主机的 psql 命令行工具执行重置..."
    
    if command -v psql &> /dev/null; then
        psql -U "$DB_USER" -d template1 -c "
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = 'butvan_blog'
              AND pid <> pg_backend_pid();
            DROP DATABASE IF EXISTS butvan_blog;
            CREATE DATABASE butvan_blog WITH OWNER = ${DB_USER};
        "
    else
        echo -e "${RED}未找到本地 psql 工具且无 Docker 容器运行，无法执行自动重置。${NC}"
        exit 1
    fi
fi

echo -e "\n${BLUE}[2/2] 重置完毕。${NC}"
echo -e "${YELLOW}======================================================${NC}"
echo -e "${GREEN} 本地数据库重置成功！${NC}"
echo -e "${YELLOW} 提示：由于本地表结构已被清空：${NC}"
echo -e "${YELLOW} 1. 请手动重启后端服务 (blog-service) 以重新触发 Flyway 表迁移与种子数据注入。${NC}"
echo -e "${YELLOW} 2. 注入完成后，前后台管理系统将恢复到包含高质量初始开发数据的干净状态。${NC}"
echo -e "${YELLOW}======================================================${NC}"


