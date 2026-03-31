import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type AIConfigRow = Database['public']['Tables']['rx_ai_configs']['Row'];
type AIConfigInsert = Database['public']['Tables']['rx_ai_configs']['Insert'];
type AIConfigUpdate = Database['public']['Tables']['rx_ai_configs']['Update'];

export function useAIConfig(tenantId: string | null) {
  return useQuery({
    queryKey: ['aiConfig', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;

      const { data, error } = await supabase
        .from('rx_ai_configs')
        .select('*')
        .eq('tenant_id', tenantId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching AI config:', error);
        throw error;
      }

      return data as AIConfigRow | null;
    },
    enabled: !!tenantId,
  });
}

export function useUpdateAIConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: AIConfigInsert | AIConfigUpdate) => {
      // Because tenant_id is UNIQUE, we can use upsert on it
      const { data, error } = await supabase
        .from('rx_ai_configs')
        .upsert(config, { onConflict: 'tenant_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating AI config:', error);
        throw error;
      }

      return data as AIConfigRow;
    },
    onSuccess: (data) => {
      // Invalidate the cache to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['aiConfig', data.tenant_id] });
    },
  });
}
