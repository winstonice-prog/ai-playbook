export interface AIModel {
  id: string
  name: string
  provider: string
  apiType: 'openai' | 'anthropic' | 'gemini'
  baseUrl: string
  color: string
  enabled: boolean
  modelId: string  // actual model name for API
  description: string
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt',
    name: 'ChatGPT',
    provider: 'OpenAI',
    apiType: 'openai',
    baseUrl: 'https://api.openai.com/v1',
    color: '#10a37f',
    enabled: true,
    modelId: 'gpt-4o',
    description: '综合能力最强的模型之一',
  },
  {
    id: 'claude',
    name: 'Claude',
    provider: 'Anthropic',
    apiType: 'anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    color: '#d97757',
    enabled: true,
    modelId: 'claude-sonnet-4-20250514',
    description: '长文本处理与深度推理',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    provider: 'Google',
    apiType: 'gemini',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    color: '#4285f4',
    enabled: true,
    modelId: 'gemini-2.5-flash',
    description: 'Google 最新多模态模型',
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    apiType: 'openai',
    baseUrl: 'https://api.deepseek.com/v1',
    color: '#4d6bfe',
    enabled: true,
    modelId: 'deepseek-chat',
    description: '性价比极高的国产模型',
  },
  {
    id: 'qwen',
    name: '通义千问',
    provider: '阿里云',
    apiType: 'openai',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    color: '#615ced',
    enabled: true,
    modelId: 'qwen-plus',
    description: '阿里自研大模型',
  },
  {
    id: 'kimi',
    name: 'Kimi',
    provider: '月之暗面',
    apiType: 'openai',
    baseUrl: 'https://api.moonshot.cn/v1',
    color: '#35c759',
    enabled: true,
    modelId: 'moonshot-v1-8k',
    description: '超长上下文处理',
  },
  {
    id: 'minimax',
    name: 'MiniMax',
    provider: '稀宇科技',
    apiType: 'openai',
    baseUrl: 'https://api.minimax.chat/v1',
    color: '#14b8a6',
    enabled: true,
    modelId: 'minimax-m2.7',
    description: '高性价比 Agent 与编码',
  },
]
