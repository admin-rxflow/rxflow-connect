import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

// Fetches all conversations for a specific tenant and subscribes to realtime updates
export const useConversations = (tenantId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId) return;

    // Supabase Realtime Subscription for rx_conversations
    const channel = supabase
      .channel('rx_conversations_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rx_conversations', filter: `tenant_id=eq.${tenantId}` },
        () => {
          // Quando algo mudar, invalida o cache do react-query para buscar de novo
          queryClient.invalidateQueries({ queryKey: ['conversations', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, queryClient]);

  return useQuery({
    queryKey: ['conversations', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('rx_conversations')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('last_message_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });
};

// Fetches all messages for a specific conversation and subscribes to realtime updates
export const useMessages = (tenantId: string | null, conversationId: string | null) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!tenantId || !conversationId) return;

    // Supabase Realtime Subscription for rx_messages
    const channel = supabase
      .channel(`rx_messages_${conversationId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rx_messages', filter: `conversation_id=eq.${conversationId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
          // Atualiza também a lista principal de conversas pra pegar "Última Mensagem" nova
          queryClient.invalidateQueries({ queryKey: ['conversations', tenantId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, conversationId, queryClient]);

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data, error } = await supabase
        .from('rx_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!conversationId,
  });
};
