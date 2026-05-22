import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Tipo manual que inclui os campos da migration 002
export interface TenantSettings {
  id: string;
  name: string;
  cnpj: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  postal_code: string | null;
  plan: string | null;
  status: string | null;
  // Campos WhatsApp/Evolution API (migration 002)
  evolution_api_url: string | null;
  evolution_api_key: string | null;
  evolution_instance: string | null;
  n8n_webhook_url: string | null;
  // Campos legados Meta (mantidos para compatibilidade)
  whatsapp_business_phone_id: string | null;
  whatsapp_webhook_verify_token: string | null;
}

export type TenantSettingsUpdate = Partial<Omit<TenantSettings, 'id' | 'email'>>;

export function useTenantSettings(tenantId: string | null) {
  return useQuery({
    queryKey: ['tenantSettings', tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase
        .from('rx_tenants')
        .select('*')
        .eq('id', tenantId)
        .single();
      if (error) throw error;
      return data as unknown as TenantSettings;
    },
    enabled: !!tenantId,
  });
}

export function useUpdateTenantSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ tenantId, data }: { tenantId: string; data: TenantSettingsUpdate }) => {
      const { data: updated, error } = await supabase
        .from('rx_tenants')
        .update(data as Record<string, unknown>)
        .eq('id', tenantId)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: (_data, { tenantId }) => {
      queryClient.invalidateQueries({ queryKey: ['tenantSettings', tenantId] });
    },
  });
}
