# AI Playbook

<p align="center">
  <strong>一本规则书，管住所有 AI。</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/license-MIT-green" />
</p>

---

AI Playbook 是一个多模型 AI 管理控制台。在你的规则书里写好约束，所有 AI 自动遵守——不用在每个平台、每个会话里重复设置。

## 功能

**广播模式** — 一条消息同时发给多个 AI，回复并排对比。同一个 prompt，GPT 和 Claude 的输出有什么差异，一目了然。

**协同模式** — AI 按流水线协作。研究员查资料 → 分析师做判断 → 审核员把关。每个 AI 看到前面所有人的输出，你全程监工，随时插话。

**规则书** — 核心模块。规则分三级：红线（安全合规）、警告（编码规范）、建议（风格偏好）。写完自动注入所有 AI 的 system prompt。15 条预设模板可直接导入，支持拖拽排序。智能合规检查根据语义自动检测回复是否违规。

**多模态** — 粘贴或拖拽图片，GPT / Claude / Gemini 直接分析。一键切换纯文本 / 多模态模式。

**自定义模型** — 接入任何 OpenAI 兼容 API（Ollama、vLLM、第三方代理）。内置模型均可开关。

**中英文切换** — 界面完整双语，右上角一键切换。

## 内置模型

| 模型 | 厂商 |
|------|------|
| ChatGPT (GPT-4o) | OpenAI |
| Claude (Sonnet 4) | Anthropic |
| Gemini (Flash 2.5) | Google |
| DeepSeek | DeepSeek |
| 通义千问 | 阿里云 |
| Kimi | 月之暗面 |
| MiniMax (M2.7) | 稀宇科技 |

## 快速开始

```bash
git clone https://github.com/winstonice-prog/ai-playbook.git
cd ai-playbook
npm install
npm run dev
```

打开 `http://localhost:3000`。首次访问弹出引导，在设置中填入 API Key。Key 仅存浏览器本地，不上传服务器。

## 安全

所有 API Key 存储在浏览器 localStorage。请求通过 Next.js API Route 代理转发，Key 全程在浏览器和你的服务器之间传输，不经过第三方。

## 技术栈

Next.js 14 (App Router + Edge Runtime) · React 18 · TypeScript · Tailwind CSS · Zustand

## License

MIT
