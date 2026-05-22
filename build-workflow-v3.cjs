const fs = require('fs');
const v2 = JSON.parse(fs.readFileSync('./RxFlow AI Agent v2.json', 'utf8'));

const C = {
  supa: { id: 'yTRJoQx1XukrUzGv', name: 'RXFLOW-Supabase' },
  openai: { id: '8v2KhR9TWJLsscdJ', name: 'OpenAi account' },
  hdr: { id: 's4V4zLg7l8OdEnp6', name: 'Supabase Service Key Header' },
  evo: { id: 'pzLqDqzMvDj7A8DH', name: 'Evolution account' }
};

const WH = "$('Webhook - Entrada').first().json.body";

// ─── NEW NODES ──────────────────────────────────────────────────────────────

const nodeBuscarCliente = {
  id: 'n-buscar-cliente',
  name: 'Supabase: Buscar Cliente',
  type: 'n8n-nodes-base.supabase',
  typeVersion: 1,
  position: [176, 1232],
  alwaysOutputData: true,
  parameters: {
    operation: 'getAll',
    tableId: 'rx_conversations',
    limit: 1,
    matchType: 'allFilters',
    filters: {
      conditions: [
        { keyName: 'customer_phone', condition: 'eq', keyValue: `={{ ${WH}.customer_phone }}` },
        { keyName: 'tenant_id', condition: 'eq', keyValue: `={{ ${WH}.tenant_id }}` }
      ]
    }
  },
  credentials: { supabaseApi: C.supa }
};

const nodeSwitchMensagem = {
  id: 'n-switch-msg',
  name: 'Switch: Tipo de Mensagem',
  type: 'n8n-nodes-base.switch',
  typeVersion: 3,
  position: [400, 1232],
  parameters: {
    rules: {
      values: [
        {
          outputKey: 'audio',
          conditions: {
            conditions: [{ leftValue: `={{ ${WH}.message_type }}`, rightValue: 'audioMessage', operator: { type: 'string', operation: 'equals' } }],
            combinator: 'and'
          }
        },
        {
          outputKey: 'image',
          conditions: {
            conditions: [{ leftValue: `={{ ${WH}.message_type }}`, rightValue: 'imageMessage', operator: { type: 'string', operation: 'equals' } }],
            combinator: 'and'
          }
        },
        {
          outputKey: 'text',
          conditions: {
            conditions: [{ leftValue: `={{ ${WH}.message_type }}`, rightValue: '', operator: { type: 'string', operation: 'exists', singleValue: true } }],
            combinator: 'and'
          }
        }
      ]
    },
    options: {}
  }
};

const nodeDownloadAudio = {
  id: 'n-dl-audio',
  name: 'HTTP: Download Áudio',
  type: 'n8n-nodes-base.httpRequest',
  typeVersion: 4.2,
  position: [624, 1040],
  parameters: {
    method: 'GET',
    url: `={{ ${WH}.media_url }}`,
    responseFormat: 'file',
    options: {}
  }
};

const nodeTranscreverAudio = {
  id: 'n-transcribe',
  name: 'OpenAI: Transcrever Áudio',
  type: '@n8n/n8n-nodes-langchain.openAi',
  typeVersion: 1.6,
  position: [848, 1040],
  parameters: { resource: 'audio', operation: 'transcribe', options: {} },
  credentials: { openAiApi: C.openai }
};

const nodeAnalisarImagem = {
  id: 'n-vision',
  name: 'OpenAI: Analisar Imagem',
  type: '@n8n/n8n-nodes-langchain.openAi',
  typeVersion: 1.6,
  position: [624, 1424],
  parameters: {
    resource: 'image',
    operation: 'analyze',
    modelId: { __rl: true, value: 'gpt-4o', mode: 'list', cachedResultName: 'GPT-4O' },
    text: 'Analise esta imagem. Se for uma receita médica, extraia: medicamento(s), dosagem, médico, CRM, data de validade e qualquer outra informação relevante. Se não for uma receita, descreva o conteúdo da imagem brevemente.',
    inputType: 'url',
    imageUrl: `={{ ${WH}.media_url }}`,
    options: {}
  },
  credentials: { openAiApi: C.openai }
};

// Move history node and update its filter - now placed after switch branches
const nodeHistorico = {
  ...v2.nodes.find(n => n.name === 'Supabase: Histórico da Conversa'),
  position: [1072, 1232]
};

const nodeAgregarContexto = {
  id: 'n-agregar',
  name: 'Code: Agregar Contexto',
  type: 'n8n-nodes-base.code',
  typeVersion: 2,
  position: [1296, 1232],
  parameters: {
    jsCode: `
const histItems = $input.all();
const body = $('Webhook - Entrada').first().json.body;
const aiConfig = $('Supabase: Config do Agente').first().json;
const clienteData = $('Supabase: Buscar Cliente').first().json;

// Determine if returning customer
const isReturningCustomer = clienteData && clienteData.id ? true : false;
const customerGreeting = isReturningCustomer
  ? 'Cliente conhecido (já atendeu antes nesta farmácia).'
  : 'Novo cliente (primeira interação).';

// Determine the actual message text (could be transcribed audio or analyzed image)
let finalMessage = body.message_text || '';
let messageContext = '';

try {
  const audioNode = $('OpenAI: Transcrever Áudio');
  if (audioNode && audioNode.first() && audioNode.first().json.text) {
    finalMessage = audioNode.first().json.text;
    messageContext = '[MENSAGEM DE ÁUDIO TRANSCRITA]: ';
  }
} catch(e) {}

try {
  const visionNode = $('OpenAI: Analisar Imagem');
  if (visionNode && visionNode.first() && visionNode.first().json.message?.content) {
    const visionText = visionNode.first().json.message.content;
    messageContext = '[IMAGEM ENVIADA - ANÁLISE]: ';
    finalMessage = visionText;
    // Check if it looks like a prescription
    if (visionText.toLowerCase().includes('receita') || visionText.toLowerCase().includes('médico') || visionText.toLowerCase().includes('crm')) {
      messageContext = '[RECEITA MÉDICA ENVIADA - ANÁLISE]: ';
    }
  }
} catch(e) {}

// Aggregate conversation history
const history = histItems
  .filter(item => item.json && item.json.message_text)
  .sort((a, b) => new Date(a.json.created_at) - new Date(b.json.created_at))
  .slice(-10)
  .map(item => {
    const role = item.json.sender_type === 'customer' ? '👤 Cliente' : '🤖 IA';
    return role + ': ' + item.json.message_text;
  });

const historyText = history.length > 0
  ? history.join('\\n')
  : 'Sem histórico anterior nesta sessão.';

return [{
  json: {
    ...body,
    final_message: messageContext + finalMessage,
    history_formatted: historyText,
    history_count: history.length,
    is_returning_customer: isReturningCustomer,
    customer_status: customerGreeting,
    is_media: body.message_type === 'imageMessage' || body.message_type === 'audioMessage',
    is_prescription_candidate: messageContext.includes('RECEITA')
  }
}];
`
  }
};

const nodeIfEscalada = {
  id: 'n-if-escalada',
  name: 'If: IA Escalada?',
  type: 'n8n-nodes-base.if',
  typeVersion: 2.2,
  position: [1520, 1232],
  parameters: {
    conditions: {
      conditions: [
        {
          id: 'esc-check',
          leftValue: `={{ $('Supabase: Buscar Cliente').first().json.escalated_to_human || false }}`,
          rightValue: true,
          operator: { type: 'boolean', operation: 'true', singleValue: true }
        }
      ],
      combinator: 'and'
    },
    options: {}
  }
};

// ─── UPDATED EXISTING NODES ─────────────────────────────────────────────────

// Move all existing main nodes to the right
const nodeWebhook = { ...v2.nodes.find(n => n.name === 'Webhook - Entrada'), position: [-688, 1232] };
const nodeConfigTenant = { ...v2.nodes.find(n => n.name === 'Supabase: Config do Tenant'), position: [-464, 1232] };
const nodeConfigAgente = { ...v2.nodes.find(n => n.name === 'Supabase: Config do Agente'), position: [-240, 1232] };

// Updated Agent with improved system prompt referencing Code node output
const nodeAgente = {
  ...v2.nodes.find(n => n.name === 'Agente IA RxFlow'),
  position: [1744, 1232],
  parameters: {
    promptType: 'define',
    text: "={{ $json.final_message }}",
    options: {
      systemMessage: `={{ $('Supabase: Config do Agente').first().json.system_prompt
+ '\\n\\n# FARMÁCIA\\n- Nome: ' + $('Supabase: Config do Agente').first().json.pharmacy_name
+ '\\n- Horário: ' + $('Supabase: Config do Agente').first().json.pharmacy_hours
+ '\\n\\n# CONTEXTO DO ATENDIMENTO'
+ '\\n- Tenant ID: ' + $json.tenant_id
+ '\\n- Conversa ID: ' + $json.conversation_id
+ '\\n- Telefone: ' + $json.customer_phone
+ '\\n- Nome: ' + ($json.customer_name || 'Não informado')
+ '\\n- ' + $json.customer_status
+ '\\n- Tipo de mensagem: ' + $json.message_type
+ ($json.is_prescription_candidate ? '\\n⚠️ ATENÇÃO: Cliente enviou receita médica! Verifique os dados extraídos e processe o pedido com receita.' : '')
+ '\\n\\n# MODO AUTÔNOMO'
+ '\\n- Ativo: ' + $('Supabase: Config do Agente').first().json.autonomous_mode
+ '\\n- Limite auto-aprovação: R$ ' + $('Supabase: Config do Agente').first().json.autonomous_max_value
+ '\\n\\n# HISTÓRICO DA CONVERSA (últimas mensagens)\\n' + $json.history_formatted
+ '\\n\\n# MENSAGENS PADRÃO'
+ '\\n- Espera: ' + $('Supabase: Config do Agente').first().json.msg_waiting
+ '\\n- Receita: ' + $('Supabase: Config do Agente').first().json.msg_prescription_request
+ '\\n- Controlado: ' + $('Supabase: Config do Agente').first().json.msg_controlled_warning
+ '\\n- Encerramento: ' + $('Supabase: Config do Agente').first().json.msg_closing }}`
    }
  }
};

const nodeEvoEnviar = {
  ...v2.nodes.find(n => n.name === 'Evolution API: Enviar Resposta'),
  position: [1968, 1232],
  parameters: {
    resource: 'messages-api',
    instanceName: 'iacod',
    remoteJid: `={{ $('Code: Agregar Contexto').first().json.customer_phone }}`,
    messageText: "={{ $('Agente IA RxFlow').item.json.output }}",
    options_message: {}
  }
};

// Fix tenant_id bug in save node
const nodeSalvar = {
  ...v2.nodes.find(n => n.name === 'Supabase: Salvar Resposta IA'),
  position: [2192, 1232],
  parameters: {
    tableId: 'rx_messages',
    fieldsUi: {
      fieldValues: [
        { fieldId: 'conversation_id', fieldValue: `={{ $('Code: Agregar Contexto').first().json.conversation_id }}` },
        { fieldId: 'tenant_id', fieldValue: `={{ $('Code: Agregar Contexto').first().json.tenant_id }}` }, // BUG FIXED
        { fieldId: 'message_text', fieldValue: "={{ $('Agente IA RxFlow').item.json.output }}" },
        { fieldId: 'sender_type', fieldValue: 'ai_agent' },
        { fieldId: 'message_type', fieldValue: 'text' }
      ]
    }
  }
};

const nodeResponder = { ...v2.nodes.find(n => n.name === 'Responder Webhook'), position: [2416, 1232] };
const nodeResponderEscalada = {
  id: 'n-respond-esc',
  name: 'Responder: Escalada',
  type: 'n8n-nodes-base.respondToWebhook',
  typeVersion: 1.1,
  position: [1744, 1040],
  parameters: {
    respondWith: 'json',
    responseBody: '={ "received": true, "escalated": true }',
    options: {}
  }
};

// Tool nodes - keep exactly as in v2
const toolNodes = v2.nodes.filter(n => n.type === '@n8n/n8n-nodes-langchain.toolHttpRequest');
const modelNode = {
  ...v2.nodes.find(n => n.name === 'OpenAI GPT-4o'),
  position: [1488, 1568]
};
const modelVision = {
  id: 'n-openai-vision-model',
  name: 'OpenAI GPT-4o (Vision)',
  type: '@n8n/n8n-nodes-langchain.lmChatOpenAi',
  typeVersion: 1.2,
  position: [624, 1632],
  parameters: { model: { __rl: true, value: 'gpt-4o', mode: 'list', cachedResultName: 'gpt-4o' }, options: { temperature: 0 } },
  credentials: { openAiApi: C.openai }
};

// ─── ASSEMBLE NODES ─────────────────────────────────────────────────────────
const nodes = [
  nodeWebhook, nodeConfigTenant, nodeConfigAgente,
  nodeBuscarCliente, nodeSwitchMensagem,
  nodeDownloadAudio, nodeTranscreverAudio,
  nodeAnalisarImagem,
  nodeHistorico, nodeAgregarContexto, nodeIfEscalada,
  nodeAgente, nodeEvoEnviar, nodeSalvar, nodeResponder,
  nodeResponderEscalada, modelNode,
  ...toolNodes
];

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────
const connections = {
  'Webhook - Entrada': { main: [[{ node: 'Supabase: Config do Tenant', type: 'main', index: 0 }]] },
  'Supabase: Config do Tenant': { main: [[{ node: 'Supabase: Config do Agente', type: 'main', index: 0 }]] },
  'Supabase: Config do Agente': { main: [[{ node: 'Supabase: Buscar Cliente', type: 'main', index: 0 }]] },
  'Supabase: Buscar Cliente': { main: [[{ node: 'Switch: Tipo de Mensagem', type: 'main', index: 0 }]] },
  'Switch: Tipo de Mensagem': {
    main: [
      [{ node: 'HTTP: Download Áudio', type: 'main', index: 0 }],      // audio
      [{ node: 'OpenAI: Analisar Imagem', type: 'main', index: 0 }],   // image
      [{ node: 'Supabase: Histórico da Conversa', type: 'main', index: 0 }] // text/other
    ]
  },
  'HTTP: Download Áudio': { main: [[{ node: 'OpenAI: Transcrever Áudio', type: 'main', index: 0 }]] },
  'OpenAI: Transcrever Áudio': { main: [[{ node: 'Supabase: Histórico da Conversa', type: 'main', index: 0 }]] },
  'OpenAI: Analisar Imagem': { main: [[{ node: 'Supabase: Histórico da Conversa', type: 'main', index: 0 }]] },
  'Supabase: Histórico da Conversa': { main: [[{ node: 'Code: Agregar Contexto', type: 'main', index: 0 }]] },
  'Code: Agregar Contexto': { main: [[{ node: 'If: IA Escalada?', type: 'main', index: 0 }]] },
  'If: IA Escalada?': {
    main: [
      [{ node: 'Agente IA RxFlow', type: 'main', index: 0 }],       // false (not escalated)
      [{ node: 'Responder: Escalada', type: 'main', index: 0 }]     // true (escalated)
    ]
  },
  'Agente IA RxFlow': { main: [[{ node: 'Evolution API: Enviar Resposta', type: 'main', index: 0 }]] },
  'Evolution API: Enviar Resposta': { main: [[{ node: 'Supabase: Salvar Resposta IA', type: 'main', index: 0 }]] },
  'Supabase: Salvar Resposta IA': { main: [[{ node: 'Responder Webhook', type: 'main', index: 0 }]] },
  'OpenAI GPT-4o': { ai_languageModel: [[{ node: 'Agente IA RxFlow', type: 'ai_languageModel', index: 0 }]] },
  'Tool: Verificar Estoque': { ai_tool: [[{ node: 'Agente IA RxFlow', type: 'ai_tool', index: 0 }]] },
  'Tool: Criar Pedido': { ai_tool: [[{ node: 'Agente IA RxFlow', type: 'ai_tool', index: 0 }]] },
  'Tool: Base de Conhecimento': { ai_tool: [[{ node: 'Agente IA RxFlow', type: 'ai_tool', index: 0 }]] },
  'Tool: Escalar para Humano': { ai_tool: [[{ node: 'Agente IA RxFlow', type: 'ai_tool', index: 0 }]] },
  'Tool: Notificar Entregador': { ai_tool: [[{ node: 'Agente IA RxFlow', type: 'ai_tool', index: 0 }]] }
};

// ─── FINAL WORKFLOW ──────────────────────────────────────────────────────────
const v3 = {
  name: 'RxFlow AI Agent v3',
  nodes,
  connections,
  pinData: v2.pinData,
  settings: { executionOrder: 'v1', binaryMode: 'separate', availableInMCP: false },
  active: false,
  tags: v2.tags,
  meta: v2.meta
};

fs.writeFileSync('./RxFlow AI Agent v3.json', JSON.stringify(v3, null, 2));
console.log('✅ RxFlow AI Agent v3.json gerado com sucesso!');
console.log('Nodes:', v3.nodes.length);
console.log('Connections:', Object.keys(v3.connections).length);
