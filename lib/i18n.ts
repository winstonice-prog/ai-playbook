export type Lang = 'zh' | 'en'
export type TranslationKey = keyof typeof zh

export const zh = {
  // Header
  appTitle: 'AI Rules Center',
  broadcast: '广播',
  orchestrate: '协同',
  rules: '规则',
  settings: '设置',
  configure: '配置',

  // Status Bar
  idle: '待命',
  loading: '生成中',
  done: '完成',
  error: '出错',
  needReview: '需审核',
  modelsCount: '{n} 模型',
  rulesCount: '{n} 规则',
  processing: '处理中',
  noModelsEnabled: '未启用任何模型。点击右上角设置按钮配置 API Key。',

  // Model Selector
  noKey: '未配置 API Key',

  // Chat Panel
  chatPlaceholder: '输入消息，可粘贴/拖拽图片，Enter 发送',
  chatPlaceholderNoModel: '请先启用至少一个模型',
  sendingToAll: '同时发送到 {n} 个 AI',
  enterToSend: 'Enter 发送 · Shift+Enter 换行',
  thinking: '思考中...',
  emptyChatPrompt1: '在下方输入消息，同时发送到全部 AI',
  emptyChatPrompt2: '支持粘贴或拖拽图片，AI 将分析图片内容。设置规则书后会自动遵守。',
  multimodal: '多模态',
  textOnly: '纯文本',

  // Rules Panel
  ruleBook: '规则书',
  rulesActive: '{n} 条生效中',
  addRule: '添加规则',
  noRules: '还没有规则',
  noRulesHint: '添加第一条规则，所有 AI 将自动遵守',
  ruleTitle: '规则名称',
  ruleContent: '规则内容，AI 将严格遵守。例如：始终使用中文回复、不要主动询问我的个人信息',
  ruleScope: '生效范围（不选 = 全部模型）',
  ruleAllModels: '全部模型',
  ruleSpecified: '已指定',
  addImage: '添加图片',
  delete: '删除',

  // Orchestration
  orchWorkflow: '协同工作流',
  orchDesc: 'AI 按顺序执行任务，你可以随时插入问题。',
  teamTask: '团队任务',
  taskPlaceholder: '描述团队要完成的任务...',
  jobPositions: '工作岗位（拖拽调整顺序）',
  quickFill: '快速填充默认角色',
  availableModels: '可用模型',
  startOrchestrate: '启动协同',
  running: '运行中...',
  needRoles: '请先添加工作岗位',
  intervenePlaceholder: '插入问题或指令，所有 AI 都会看到',
  interveneHint: '输入内容后按 Enter 插入，所有 AI 都会看到你的消息',
  orchestrateTaskHint: '先在左侧面板设置工作岗位和任务后启动',

  // Brainstorm
  brainstorm: '让 AI 自己讨论分配岗位',
  brainstorming: 'AI 正在讨论...',
  rebrainstorm: '重新讨论',
  brainstormResult: 'AI 讨论结果',
  confirmAssign: '确认分配，开始协同',
  acceptOnlyRoles: '仅采纳岗位分配',
  roleColon: '角色',
  reasonColon: '理由',

  // Settings
  apiKeys: 'API Keys',
  apiKeysHint: '仅存浏览器本地，不上传服务器。测试按钮可验证 Key 是否有效。',
  configured: '已填',
  configured_: '已配置',
  test: '测试',
  testOk: 'Key 有效（被限流）',
  testSuccess: '连接成功',
  testInvalid: 'Key 无效或权限不足',
  modelToggle: '模型开关',
  customModels: '自定义模型',
  addCustom: '添加',
  modelName: '模型名称',
  providerName: '厂商名称',
  modelId: '模型 ID',
  apiUrl: 'API 地址',
  apiType: 'API 类型',
  apiKeyOptional: 'API Key（可选）',
  confirm: '确认添加',
  cancel: '取消',
  noCustomModels: '没有自定义模型。点击上方按钮接入你自己的 API。',

  // Setup Wizard
  welcome: '欢迎使用 AI Rules Center',
  welcomeDesc: '一个地方，管理所有 AI 的规则。一次设置，全部遵守。',
  configKeys: '配置 API Key',
  configKeysDesc: '输入你想使用的 AI 模型的 Key。不上传到任何服务器，只存在你的浏览器本地。',
  allReady: '一切就绪',
  allReadyDesc: '你可以随时在设置中修改配置。现在开始吧。',
  skipForNow: '稍后配置，先看看',
  continue_: '继续',
  back: '上一步',
  start: '开始使用',

  // API Test
  networkError: '网络错误',
  noApiKey: '请先配置 API Key',

  // Model roles
  researcher: '研究员',
  researcherDesc: '负责收集和分析信息，给出客观全面的调研结果。',
  analyst: '分析师',
  analystDesc: '基于调研结果进行深度分析，给出专业判断和建议。',
  reviewer: '审核员',
  reviewerDesc: '对前面的分析和建议进行审核，指出潜在风险和遗漏。',
}

export const en: typeof zh = {
  appTitle: 'AI Rules Center',
  broadcast: 'Broadcast',
  orchestrate: 'Orchestrate',
  rules: 'Rules',
  settings: 'Settings',
  configure: 'Config',

  idle: 'Idle',
  loading: 'Generating',
  done: 'Done',
  error: 'Error',
  needReview: 'Review',
  modelsCount: '{n} models',
  rulesCount: '{n} rules',
  processing: 'Processing',
  noModelsEnabled: 'No models enabled. Configure API Keys in Settings.',

  noKey: 'No API Key',

  chatPlaceholder: 'Type a message, paste/drag images, Enter to send',
  chatPlaceholderNoModel: 'Enable at least one model first',
  sendingToAll: 'Sending to {n} AIs',
  enterToSend: 'Enter to send · Shift+Enter for newline',
  thinking: 'Thinking...',
  emptyChatPrompt1: 'Type a message below to send to all AIs simultaneously',
  emptyChatPrompt2: 'Paste or drag images. Configure rules and all AIs will comply.',
  multimodal: 'Multimodal',
  textOnly: 'Text Only',

  ruleBook: 'Rulebook',
  rulesActive: '{n} active',
  addRule: 'Add Rule',
  noRules: 'No rules yet',
  noRulesHint: 'Add your first rule. All AIs will automatically comply.',
  ruleTitle: 'Rule Name',
  ruleContent: 'Rule content. AIs must comply. E.g.: Always respond in English, Do not ask for personal info',
  ruleScope: 'Scope (unselected = all models)',
  ruleAllModels: 'All Models',
  ruleSpecified: 'Specified',
  addImage: 'Add Image',
  delete: 'Delete',

  orchWorkflow: 'Workflow',
  orchDesc: 'AIs execute tasks in sequence. You can intervene at any time.',
  teamTask: 'Team Task',
  taskPlaceholder: 'Describe the task for the team...',
  jobPositions: 'Roles (drag to reorder)',
  quickFill: 'Quick-fill default roles',
  availableModels: 'Available Models',
  startOrchestrate: 'Start Workflow',
  running: 'Running...',
  needRoles: 'Add roles first',
  intervenePlaceholder: 'Insert a question, all AIs will see it',
  interveneHint: 'Type and press Enter to insert. All AIs will see your message.',
  orchestrateTaskHint: 'Set up roles and task in the left panel first',

  brainstorm: 'Let AIs discuss role assignment',
  brainstorming: 'AIs discussing...',
  rebrainstorm: 'Discuss again',
  brainstormResult: 'AI Discussion Results',
  confirmAssign: 'Confirm & Start Workflow',
  acceptOnlyRoles: 'Accept Roles Only',
  roleColon: 'Role',
  reasonColon: 'Reason',

  apiKeys: 'API Keys',
  apiKeysHint: 'Stored locally only, never uploaded. Use Test to verify.',
  configured: 'Set',
  configured_: 'Configured',
  test: 'Test',
  testOk: 'Key valid (rate-limited)',
  testSuccess: 'Connected',
  testInvalid: 'Invalid key or insufficient permissions',
  modelToggle: 'Model Toggle',
  customModels: 'Custom Models',
  addCustom: 'Add',
  modelName: 'Model Name',
  providerName: 'Provider',
  modelId: 'Model ID',
  apiUrl: 'API URL',
  apiType: 'API Type',
  apiKeyOptional: 'API Key (optional)',
  confirm: 'Add',
  cancel: 'Cancel',
  noCustomModels: 'No custom models. Click Add to connect your own API.',

  welcome: 'Welcome to AI Rules Center',
  welcomeDesc: 'One place to manage rules for all AIs. Set once, enforced everywhere.',
  configKeys: 'Configure API Keys',
  configKeysDesc: 'Enter API keys for the AIs you use. Stored locally, never uploaded.',
  allReady: "You're All Set",
  allReadyDesc: 'You can always change settings later. Let\'s get started.',
  skipForNow: 'Skip for now',
  continue_: 'Continue',
  back: 'Back',
  start: 'Get Started',

  networkError: 'Network error',
  noApiKey: 'Please configure API Key first',

  researcher: 'Researcher',
  researcherDesc: 'Collect and analyze information, provide objective research results.',
  analyst: 'Analyst',
  analystDesc: 'Deep analysis of findings, professional judgment and recommendations.',
  reviewer: 'Reviewer',
  reviewerDesc: 'Review analysis and recommendations, identify potential risks.',
}

export function t(lang: Lang, key: TranslationKey, params?: Record<string, string | number>): string {
  const source = lang === 'zh' ? zh : en
  let text = source[key] as string
  if (!text) return key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}
