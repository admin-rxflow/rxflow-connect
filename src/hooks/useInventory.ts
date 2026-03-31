import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

export type InventoryItem = Database['public']['Tables']['rx_inventory']['Row'];
export type InventoryInsert = Database['public']['Tables']['rx_inventory']['Insert'];
export type InventoryUpdate = Database['public']['Tables']['rx_inventory']['Update'];

export function useInventory(tenantId: string | null) {
  return useQuery({
    queryKey: ['inventory', tenantId],
    queryFn: async () => {
      if (!tenantId) return [];

      const { data, error } = await supabase
        .from('rx_inventory')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('medication_name', { ascending: true });

      if (error) {
        console.error('Error fetching inventory:', error);
        toast.error('Erro ao carregar o estoque');
        throw error;
      }

      return data as InventoryItem[];
    },
    enabled: !!tenantId,
  });
}

export function useAddInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: InventoryInsert) => {
      const { data, error } = await supabase
        .from('rx_inventory')
        .insert([item])
        .select()
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', data.tenant_id] });
      toast.success('Produto adicionado com sucesso!');
    },
    onError: (error) => {
      console.error('Add inventory error:', error);
      toast.error('Erro ao adicionar produto. Verifique os dados.');
    }
  });
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: InventoryUpdate }) => {
      const { data, error } = await supabase
        .from('rx_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', data.tenant_id] });
      toast.success('Produto atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Update inventory error:', error);
      toast.error('Erro ao atualizar produto.');
    }
  });
}

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tenantId }: { id: string; tenantId: string }) => {
      const { error } = await supabase
        .from('rx_inventory')
        .delete()
        .eq('id', id)
        .eq('tenant_id', tenantId);

      if (error) throw error;
      return { id, tenantId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory', data.tenantId] });
      toast.success('Produto excluído com sucesso!');
    },
    onError: (error) => {
      console.error('Delete inventory error:', error);
      toast.error('Erro ao excluir produto.');
    }
  });
}
