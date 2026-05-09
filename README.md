# AI Playbook

<p align="center">
  <strong>给所有 AI 发同一本规则书，然后在同一个地方看它们干活。</strong>
</p>

---

我平时要用四五个 AI。ChatGPT 写文案，Claude 审代码，Gemini 查资料，DeepSeek 跑批量。时间久了发现一个问题：每个 AI 都得重新交代一遍"我是谁、喜欢什么风格、底线是什么"。换一个模型，重新解释。换个对话窗口，重新解释。

很烦。于是做了这个东西。

## 它能干什么

**一个输入框，所有 AI 同时回复。** 同一条 prompt，GPT 和 Claude 的回答有什么不一样，并排摆着看。

**写一本规则书，自动注给所有 AI。** 不要用 emoji、保持中文回复、代码必须带注释——写完一次，每个 AI 的 system prompt 里都会带上。三级分类：红线（必须遵守）、警告（应当遵守）、建议（参考即可）。15 条预设模板可以直接导入。

**让 AI 组队干活。** 研究员查资料 → 分析师做判断 → 审核员把关。你在旁边看着它们互相传话，随时插一句。

**贴图进去。** 支持粘贴或拖拽图片，GPT/Claude/Gemini 能直接理解图片内容。

**接入你自己的模型。** 除了内置的 7 个模型，可以加任何 OpenAI 兼容的 API——本地 Ollama、第三方代理都行。

**中英文随意切。** 右上角点一下。

## 内置模型

ChatGPT (GPT-4o) · Claude (Sonnet 4) · Gemini (Flash 2.5) · DeepSeek · 通义千问 · Kimi · MiniMax (M2.7)

都可以单独开关，不用的关掉就行。

## 跑起来

```bash
git clone https://github.com/winstonice-prog/ai-playbook.git
cd ai-playbook
npm install
npm run dev
```

打开 `http://localhost:3000`。首次访问会弹引导，在设置里填 API Key。

Key 只存在浏览器本地，不经过任何第三方服务器。API 请求走 Next.js 的 Route 转发，你的 Key 全程在你自己的浏览器和服务器之间。

## 技术

Next.js 14 + React 18 + TypeScript + Tailwind + Zustand

## License

MIT
