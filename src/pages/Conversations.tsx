import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useConversations, useMessages } from '@/hooks/useConversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageSquare, Phone, Clock, User, Bot, Filter, Loader2 } from 'lucide-react';

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
  const { tenantId } = useAuth();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Fetch real conversations
  const { data: conversations = [], isLoading: loadingConversations } = useConversations(tenantId);
  // Fetch messages for the selected conversation
  const { data: messages = [], isLoading: loadingMessages } = useMessages(tenantId, selectedConvId);

  const filtered = conversations.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    
    if (search) {
      const s = search.toLowerCase();
      const matchName = c.customer_name?.toLowerCase().includes(s);
      const matchPhone = c.customer_phone?.includes(s);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  const selected = conversations.find((c) => c.id === selectedConvId);

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Conversation List */}
      <Card className="w-[380px] flex-shrink-0 border-0 shadow-md flex flex-col">
        {tenantId === null && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 m-3 rounded-md text-xs font-bold text-center">
            ⚠️ O seu usuário não tem tenant_id no AuthContext. Crie uma nova conta!
          </div>
        )}
        <CardHeader className="pb-3 space-y-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Conversas
            <Badge variant="secondary" className="ml-auto">
              {loadingConversations ? <Loader2 className="w-3 h-3 animate-spin" /> : filtered.length}
            </Badge>
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar por nome ou telefone..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="pl-9 h-9 text-sm" 
            />
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
            {loadingConversations ? (
              <div className="flex items-center justify-center p-8 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center p-4 text-sm text-muted-foreground">
                Nenhuma conversa encontrada.
              </div>
            ) : (
              filtered.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    selectedConvId === conv.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : '#'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium truncate">
                          {conv.customer_name || 'Sem Nome'}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {conv.last_message_at 
                            ? new Date(conv.last_message_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                            : '--:--'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.customer_phone}</p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 ${statusColors[conv.status || 'active']}`}>
                          {statusLabels[conv.status || 'active'] || conv.status}
                        </Badge>
                        {conv.sentiment && (
                          <span className="text-[10px]">{sentimentEmoji[conv.sentiment] || ''}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground">{conv.message_count || 0} msgs</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Conversation Detail */}
      <Card className="flex-1 border-0 shadow-md flex flex-col relative overflow-hidden">
        {selected ? (
          <>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                  {selected.customer_name ? selected.customer_name.charAt(0).toUpperCase() : '#'}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selected.customer_name || 'Cliente Sem Nome'}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="w-3 h-3" /> {selected.customer_phone}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`${statusColors[selected.status || 'active']}`}>
                  {statusLabels[selected.status || 'active'] || selected.status}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 relative">
              {loadingMessages ? (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm z-10">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
              ) : null}

              <div className="space-y-4 max-w-2xl mx-auto pb-4">
                {messages.length === 0 && !loadingMessages ? (
                  <div className="text-center text-muted-foreground mt-10">Nenhuma mensagem no histórico.</div>
                ) : (
                  messages.map((msg) => {
                    const isCustomer = msg.sender_type === 'customer';
                    const time = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={msg.id} className={`flex ${isCustomer ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          isCustomer
                            ? 'bg-muted rounded-tl-sm text-foreground'
                            : 'gradient-primary text-white rounded-tr-sm'
                        }`}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            {isCustomer ? (
                              <User className="w-3 h-3 opacity-60" />
                            ) : (
                              <Bot className="w-3 h-3 opacity-60" />
                            )}
                            <span className="text-[10px] font-medium opacity-60">
                              {isCustomer ? 'Cliente' : 'Assistente IA'} • {time}
                            </span>
                          </div>
                          {msg.message_text}
                          
                          {/* If it was a system message that failed */}
                          {msg.status === 'failed' && (
                            <div className="text-[10px] text-red-200 mt-2 font-medium">⚠️ Falha no envio</div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Info bar */}
            <div className="px-6 py-3 border-t bg-muted/30 text-xs text-muted-foreground flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {messages.length || selected.message_count || 0} mensagens registradas
                </span>
                {selected.conversation_intent && (
                  <span>Intenção: <Badge variant="secondary" className="text-[10px] h-4 leading-none">{selected.conversation_intent}</Badge></span>
                )}
              </div>
              {selected.escalated_to_human && (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-600 text-[10px]">
                  Atendimento Humano
                </Badge>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground animate-fade-in relative">
            <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <MessageSquare className="w-10 h-10 text-primary/40" />
            </div>
            <p className="font-medium">Nenhuma conversa selecionada</p>
            <p className="text-xs mt-1">Selecione um atendimento na lista ao lado para ver os detalhes</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Conversations;
