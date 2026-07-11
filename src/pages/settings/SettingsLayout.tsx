import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useAuth } from '@/modules/auth/AuthProvider';
import {
  SETTINGS_TABS,
  filterSettingsSections,
  sectionsForTab,
  type SettingsTabId,
} from '@/modules/settings/settings.sections';

export function SettingsLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const planFeatures = useMemo(() => {
    const raw = user?.organization?.subscription?.plan?.features;
    if (!raw) return null;
    return raw as Record<string, boolean>;
  }, [user]);

  const sections = filterSettingsSections(user?.permissions, planFeatures);

  const activeTab: SettingsTabId = useMemo(() => {
    const match = sections.find(
      (s) => location.pathname === s.path || location.pathname.startsWith(`${s.path}/`),
    );
    return match?.tab ?? 'general';
  }, [location.pathname, sections]);

  const tabSections = sectionsForTab(activeTab, sections);
  const visibleTabs = SETTINGS_TABS.filter((tab) =>
    sections.some((s) => s.tab === tab.id),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Centro de Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configuración del parqueadero organizada por pestañas. Según su plan solo verá lo
          permitido.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-1 border-b border-slate-200">
        {visibleTabs.map((tab) => {
          const first = sectionsForTab(tab.id, sections)[0];
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => first && navigate(first.path)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-teal-800 after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:rounded-full after:bg-teal-700'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {tabSections.length > 1 && (
          <aside className="lg:col-span-3">
            <nav className="space-y-1 rounded-xl border border-slate-200 bg-white p-2">
              {tabSections.map((section) => (
                <NavLink
                  key={section.id}
                  to={section.path}
                  className={({ isActive }) =>
                    `block rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive
                        ? 'bg-teal-50 text-teal-900'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {section.label}
                </NavLink>
              ))}
            </nav>
          </aside>
        )}

        <div className={tabSections.length > 1 ? 'lg:col-span-9' : 'lg:col-span-12'}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
