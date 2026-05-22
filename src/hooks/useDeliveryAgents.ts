import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DeliveryAgent {
  id: string;
  tenant_id: string;
  name: string;
  phone: string;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DeliveryAgentInsert = {
  tenant_id: string;
  name: string;
  phone: string;
  notes?: string | null;
  is_active?: boolean;
};

export function useDeliveryAgents(tenantId: string | null) {
  return useQuery({
    queryKey: ['deliveryAgents', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from('rx_delivery_agents' as never)
        .select('*')
        .eq('tenant_id', tenantId)
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as DeliveryAgent[];
    },
    enabled: !!tenantId,
  });
}

export function useCreateDeliveryAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (agent: DeliveryAgentInsert) => {
      const { data, error } = await supabase
        .from('rx_delivery_agents' as never)
        .insert(agent as never)
        .select()
        .single();
      if (error) throw error;
      return data as DeliveryAgent;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAgents', (data as DeliveryAgent).tenant_id] });
    },
  });
}

export function useToggleDeliveryAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tenantId, is_active }: { id: string; tenantId: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('rx_delivery_agents' as never)
        .update({ is_active } as never)
        .eq('id', id);
      if (error) throw error;
      return { id, tenantId };
    },
    onSuccess: ({ tenantId }) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAgents', tenantId] });
    },
  });
}

export function useDeleteDeliveryAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { error } = await supabase
        .from('rx_delivery_agents' as never)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return { tenantId };
    },
    onSuccess: ({ tenantId }) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryAgents', tenantId] });
    },
  });
}
