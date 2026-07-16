# 项目名称：
Butvan Blog2.0
可梵的个人博客系统2.0

## 技术方向
- 前端使用next.js + next ui(pnpm add @heroui/styles @heroui/react)
- 后端使用 SpringBoot3.x 
- 数据库使用 postgresql

## 开发规范
- 每次完成一个任务模块之后，都需要git commit，并遵循Git规范化提交
- 整体开发需要遵循大厂开发规范
- 代码需要具备可读性、可维护性、可扩展性
- 项目目录结构严格约束，遵循大厂开发规范
- 每个函数方法，都要有中文注释说明
- 数据库版本管理采用 Flyway 规范：
  - 后端迁移 SQL 脚本存放于 `backend/blog-service/src/main/resources/db/migration` 下，作为数据库结构的唯一更新同步源。
  - 迁移脚本文件命名强制采用 `VYYYYMMDDHHMM__描述.sql` 格式（如 `V202607161900__add_user_avatar.sql`），利用具体时间戳彻底避免多人协作时的版本号冲突（注意是双下划线 `__`）。
  - 严禁修改任何已经提交并部署过的 SQL 脚本。若需要对表结构做修改或订正，必须通过新增更高版本号（时间戳）的 SQL 脚本文件来实施。
  - 本地与线上环境必须关闭持久层框架（如 Hibernate JPA）的自动建表更新功能（即 `ddl-auto: update`），统一将其设置为 `validate` 或 `none`，由 Flyway 独立接管所有结构变更。
  - `/docx/database` 仅作为系统初始 DDL 结构的归档库（存放初始 `schema.sql` 作为文档参考），不再保留任何历史增量迁移文件（如 `migration-v*.sql`），以防止版本冲突。
- 页面不要总是使用模块化布局，我不喜欢模块卡片式的布局方式
- 布局方面，我不喜欢留白太多，要紧凑一些，内容信息、功能丰富一点

## 工作流程
每次执行编码任务时：

1. 先阅读相关文档
2. 如果项目目录变化了请同步帮我修改`DIRECTORY.md`,并附加详细文件说明。
3. 总结修改了哪些文件，以及验证结果