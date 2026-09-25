# Session Handoff

Last Updated: 2026-09-25

Current Version: 0.1.0

Current Milestone: M2 中文交互

## This Session

从空工作区建立“向阳 · 光储估算”项目；完成本地估算核心、中文交互页面、本地 HTTP 服务、测试和长期项目文档。

## Files Changed

新增 `AGENTS.md`、`README.md`、`index.html`、`styles.css`、`server.js`、`src/engineering.js`、`src/app.js`、`tests/`、`package.json`、`.gitignore` 和 `docs/` 项目记忆文件。

## Important Decisions

- 首版离线运行，不接入模型或第三方运行时包。
- 确定性计算是容量、发电和收益数字的唯一来源。
- 项目组合计划保存在被 Git 忽略的 `work/PORTFOLIO_PLAN.md`。
- 公开源码仓库：`https://github.com/Wang716-tim/solar-storage-planner`；当前发布分支为 `main`。
- 初始版本提交：`efad91db41d9b1f72b3380c23f29ae05294e4a9e`。

## Tests

- `npm test`：10 项通过，0 项失败。
- 浏览器检查：窄屏结果布局、无效输入提示和恢复示例正常。

## Known Issues

- 计算模型未按地区逐时模拟天气、朝向、遮挡、电价和设备衰减。
- 静态回收期不是完整财务测算。
- 桌面宽屏浏览器视觉检查尚未完成。

## Current Blockers

- 当前没有阻塞项。

## Next Recommended Task

补充一组标注假设的计算样例，并完成宽屏视觉检查；随后规划 M3 本地方案比较。

## Commands

- 启动：`npm start`，然后访问 `http://127.0.0.1:4173`
- 测试：`npm test`
