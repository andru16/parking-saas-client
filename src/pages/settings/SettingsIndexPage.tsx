import { Navigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/AuthProvider';
import { filterSettingsSections } from '@/modules/settings/settings.sections';

export function SettingsIndexPage() {
  const { user } = useAuth();
  const sections = filterSettingsSections(user?.permissions);
  const first = sections[0]?.path ?? '/acceso-denegado';
  return <Navigate to={first} replace />;
}
