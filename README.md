# AI Rules Center

<p align="center">
  <strong>一个地方，管理所有 AI 的规则。一次设置，全部遵守。</strong>
</p>

<p align="center">
  One place to manage rules for all AIs. Set once, enforced everywhere.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

## 为什么需要这个

现在每个人都在用多个 AI——ChatGPT 写文案、Claude 审代码、Gemini 查资料、DeepSeek 跑批量。问题来了：

- 每个 AI 都有自己的对话页面，来回切换很烦
- 每个 AI 都要重新告诉它"我是谁、我要什么风格、底线是什么"
- 没人知道团队在用 AI 做什么，出了合规问题找不到源头
- 想让多个 AI 一起讨论一个任务？只能人肉复制粘贴

**AI Rules Center 解决的就是这个。** 它是一个开源的 AI 管理控制台，把你的规则书、多个 AI 模型、协作流水线放到一个界面里。

---

## 核心功能

### 📡 广播模式

一条消息同时发给所有启用的 AI，回复并排对比。同样的 prompt，GPT 和 Claude 的回答有什么不同？一眼看出来。

- 实时流式输出，六栏同步滚动
- 任意开关模型，发送前自由组合
- 支持文本 + 图片（多模态）

### 🔀 协同模式

AI 不再各说各话。像团队一样按流水线协作：

> 研究员（DeepSeek）→ 分析师（Claude）→ 审核员（GPT）

每个 AI 看到前面所有 AI 的输出，带着自己的角色继续工作。你作为监工全程观看，随时插话。

- 拖拽调整 AI 执行顺序
- 一键"让 AI 自己讨论分配岗位"
- 串行流水线，上下文自动传递

### 📋 规则书

这是产品的核心。

写完规则后自动注入到所有 AI 的 system prompt 里。三个严重级别：

| 级别 | 含义 | 行为 |
|------|------|------|
| 🔴 红线 | 数据安全、法律合规 | 违反时醒目标记，建议人工复核 |
| 🟡 警告 | 编码规范、品牌语气 | 标记提示 |
| 🟢 建议 | 风格偏好 | 静默注入 |

配套 15 条预设模板（禁止 emoji、数据脱敏、代码注释、结构化输出……），一键导入。规则按严重级别分组展示，拖拽排序。

智能合规检查会根据规则语义在 AI 回复中自动检测违规内容（而非简陋的关键词匹配）。

### 🖼️ 多模态

在输入框粘贴或拖拽图片，GPT / Claude / Gemini 直接分析。右上角一键切换纯文本 / 多模态模式。

### 🔌 自定义模型

不只是内置的 7 个模型。设置中可添加任何 OpenAI 兼容 API——本地 Ollama、vLLM、第三方代理。填 URL 和 Key 即可，模型列表、广播、协同全部自动纳入。

内置模型：

| 模型 | 厂商 | 特点 |
|------|------|------|
| ChatGPT (GPT-4o) | OpenAI | 综合能力最强 |
| Claude (Sonnet 4) | Anthropic | 长文本与深度推理 |
| Gemini (Flash 2.5) | Google | 多模态原生支持 |
| DeepSeek | DeepSeek | 性价比极高 |
| 通义千问 | 阿里云 | 阿里自研大模型 |
| Kimi | 月之暗面 | 超长上下文 |
| MiniMax (M2.7) | 稀宇科技 | Agent 与编码优化 |

### 🌐 中英文切换

界面完整双语支持。右上角一键切换，所有组件同步更新。

---

## 快速开始

```bash
# 克隆
git clone https://github.com/yourname/ai-rules-center.git
cd ai-rules-center

# 安装
npm install

# 启动
npm run dev
```

浏览器打开 `http://localhost:3000`。

首次访问弹出引导，在设置中填入你要用的 AI 的 API Key。Key 仅存浏览器本地 localStorage，不上传任何服务器。

你需要到以下平台获取 Key：

| 模型 | 获取地址 |
|------|----------|
| OpenAI | https://platform.openai.com/api-keys |
| Anthropic | https://console.anthropic.com/ |
| Google AI | https://aistudio.google.com/apikey |
| DeepSeek | https://platform.deepseek.com/ |
| 阿里云百炼 | https://dashscope.aliyun.com/ |
| 月之暗面 | https://platform.moonshot.cn/ |
| MiniMax | https://platform.minimaxi.com/ |

---

## 架构

```
浏览器                    Next.js 服务端               AI 厂商
┌──────────┐     ┌──────────────────────┐     ┌──────────┐
│  React UI │────▶│  /api/chat (Edge)    │────▶│  OpenAI  │
│          │     │  /api/test (Edge)    │     │  Claude  │
│ Zustand  │     │                      │     │  Gemini  │
│ 状态管理  │     │  规则注入 + 流式转发   │     │  ...     │
│          │◀────│  格式转换 (SSE)       │◀────│          │
│localStorage    └──────────────────────┘     └──────────┘
│ 规则书/Key  │
└──────────┘
```

- 规则注入在服务端执行，用户的 system prompt 层面生效
- SSE 流式响应统一转换为 OpenAI 格式，前端只认一种流格式
- Key 通过请求体传递，不持久化在服务端
- 所有数据（规则书、Key、历史记录）存储在浏览器本地

---

## 技术栈

- **框架**：Next.js 14 (App Router + Edge Runtime)
- **UI**：React 18 + TypeScript + Tailwind CSS
- **状态**：Zustand
- **图标**：Lucide React

## License

MIT
