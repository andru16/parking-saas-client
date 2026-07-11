import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getSettingsSection,
  listSettingsSections,
  saveSettingsSection,
  type SettingsSectionKey,
} from '@/api/settings';

export const settingsKeys = {
  all: ['settings-center'] as const,
  sections: () => [...settingsKeys.all, 'sections'] as const,
  section: (key: SettingsSectionKey) => [...settingsKeys.all, 'section', key] as const,
};

export function useSettingsSectionsList() {
  return useQuery({
    queryKey: settingsKeys.sections(),
    queryFn: async () => {
      const response = await listSettingsSections();
      return response.data.sections;
    },
    staleTime: 60_000,
  });
}

export function useSettingsSectionData<K extends SettingsSectionKey>(sectionKey: K) {
  return useQuery({
    queryKey: settingsKeys.section(sectionKey),
    queryFn: async () => {
      const response = await getSettingsSection(sectionKey);
      return response.data;
    },
    staleTime: 30_000,
  });
}

export function useSaveSettingsSection<K extends SettingsSectionKey>(sectionKey: K) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: unknown) => saveSettingsSection(sectionKey, payload),
    onSuccess: (response) => {
      queryClient.setQueryData(settingsKeys.section(sectionKey), response.data);
      queryClient.invalidateQueries({ queryKey: settingsKeys.sections() });
    },
  });
}
