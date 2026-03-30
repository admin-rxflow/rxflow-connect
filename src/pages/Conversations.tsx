import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Search, MessageSquare, Phone, Clock, User, Bot, Filter, ArrowUpDown } from 'lucide-react';

const demoConversations = Array.from({ length: 20 }, (_, i) => ({
  id: `conv_${i}`,
  customer_name: ['Maria Silva', 'João Santos', 'Ana Oliveira', 'Carlos Lima', 'Beatriz Souza', 'Pedro Costa', 'Laura Ferreira', 'Lucas Martins'][i % 8],
  customer_phone: `(${11 + (i % 5)}) 9${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`,
  status: ['active', 'closed', 'escalated', 'archived'][i % 4] as 'active' | 'closed' | 'escalated' | 'archived',
  sentiment: ['positive', 'neutral', 'negative'][i % 3] as 'positive' | 'neutral' | 'negative',
  intent: ['ORDER', 'QUESTION', 'DELIVERY', 'INVENTORY'][i % 4],
  message_count: Math.floor(Math.random() * 20) + 3,
  last_message_at: new Date(Date.now() - i * 3600000).toISOString(),
  escalated_to_human: i % 4 === 2,
  messages: [
    { sender_type: 'customer', text: 'Olá, gostaria de saber o preço da dipirona 500mg', time: '10:30' },
    { sender_type: 'ai_agent', text: 'Olá! O preço da Dipirona 500mg é R$ 8,90 a caixa com 10 comprimidos. Posso ajudar com mais alguma coisa?', time: '10:30' },
    { sender_type: 'customer', text: 'Quero 3 caixas. Vocês entregam?', time: '10:32' },
    { sender_type: 'ai_agent', text: 'Sim! Entregamos na sua região. O total seria R$ 26,70 + frete de R$ 5,00. Deseja confirmar o pedido?', time: '10:32' },
  ],
}));

const statusColors: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  closed: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  escalated: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  archived: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};

const statusLabels: Record<string, string> = {
  active: 'Ativa',
  closed: 'Fechada',
  escalated: 'Escalada',
  archived: 'Arquivada',
};

const sentimentEmoji: Record<string, string> = {
  positive: '😊',
  neutral: '😐',
  negative: '😞',
};

const Conversations = () => {
  const [selectedConv, setSelectedConv] = useState<string | null>(demoConversations[0]?.id);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = demoConversations.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (search && !c.customer_name.toLowerCase().includes(search.toLowerCase()) && !c.customer_phone.includes(search)) return false;
    return true;
  });

  const selected = demoConversations.find((c) => c.id === selectedConv);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Conversation List */}
      <Card className="w-[380px] flex-shrink-0 border-0 shadow-md flex flex-col">
        <CardHeader className="pb-3 space-y-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Conversas
            <Badge variant="secondary" className="ml-auto">{filtered.length}</Badge>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9 text-sm" />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="closed">Fechadas</SelectItem>
                <SelectItem value="escalated">Escaladas</SelectItem>
                <SelectItem value="archived">Arquivadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="px-2 pb-2 space-y-1">
            {filtered.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConv(conv.id)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedConv === conv.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {conv.customer_name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{conv.customer_name}</p>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.customer_phone}</p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusColors[conv.status]}`}>
                        {statusLabels[conv.status]}
                      </Badge>
                      <span className="text-[10px]">{sentimentEmoji[conv.sentiment]}</span>
                      <span className="text-[10px] text-muted-foreground">{conv.message_count} msgs</span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Conversation Detail */}
      <Card className="flex-1 border-0 shadow-md flex flex-col">
        {selected ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {selected.customer_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selected.customer_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" /> {selected.customer_phone}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${statusColors[selected.status]}`}>
                  {statusLabels[selected.status]}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 max-w-2xl mx-auto">
                {selected.messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender_type === 'customer' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender_type === 'customer'
                        ? 'bg-muted rounded-tl-sm'
                        : 'gradient-primary text-white rounded-tr-sm'
                    }`}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.sender_type === 'customer' ? (
                          <User className="w-3 h-3 opacity-60" />
                        ) : (
                          <Bot className="w-3 h-3 opacity-60" />
                        )}
                        <span className="text-[10px] opacity-60">{msg.time}</span>
                      </div>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Info bar */}
            <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {selected.message_count} mensagens</span>
                <span>Intenção: {selected.intent}</span>
              </div>
              {selected.escalated_to_human && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-[10px]">
                  Escalada para humano
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Selecione uma conversa para ver os detalhes</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Conversations;
