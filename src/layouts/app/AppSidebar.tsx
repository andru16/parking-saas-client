import { NavLink, useLocation } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, X } from 'lucide-react';
import { useAuth } from '@/modules/auth/AuthProvider';
import {
  COMING_SOON_BADGE,
  filterNavGroups,
  findNavGroupByPath,
  type NavGroup,
  type NavItem,
} from '@/modules/navigation/nav.config';
import { useSidebar } from '@/layouts/app/SidebarContext';
import { AppLogo } from '@/components/brand/AppLogo';

function planFeaturesFromUser(
  user: ReturnType<typeof useAuth>['user'],
): Record<string, boolean> | null {
  const raw = user?.organization?.subscription?.plan?.features;
  if (!raw || typeof raw !== 'object') return null;
  return raw;
}

export function AppSidebar() {
  const { user } = useAuth();
  const location = useLocation();
  const { collapsed, mobileOpen, setMobileOpen, toggleCollapsed } = useSidebar();
  const groups = filterNavGroups(user?.permissions, planFeaturesFromUser(user));
  const activeGroupId = findNavGroupByPath(location.pathname)?.id;

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Cerrar menú"
          className="fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-950 text-slate-100',
          'transition-[width,transform] duration-300 ease-in-out',
          'md:static md:z-0 md:translate-x-0',
          collapsed ? 'md:w-[4.5rem]' : 'md:w-64',
          'w-64',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        <div className="flex h-20 shrink-0 items-center gap-2 border-b border-slate-800 px-3">
          {!collapsed ? (
            <div className="min-w-0 flex-1 overflow-hidden px-1">
              <AppLogo size="md" className="h-12 max-h-12 max-w-full" />
            </div>
          ) : (
            <div className="flex flex-1 justify-center">
              <AppLogo variant="mark" size="sm" decorative />
            </div>
          )}

          <button
            type="button"
            onClick={toggleCollapsed}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-900 hover:text-white md:inline-flex"
            aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? (
              <ChevronsRight className="h-5 w-5" strokeWidth={1.75} />
            ) : (
              <ChevronsLeft className="h-5 w-5" strokeWidth={1.75} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-900 hover:text-white md:hidden"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-4" aria-label="Menú principal">
          {groups.map((group) => (
            <NavGroupBlock
              key={group.id}
              group={group}
              collapsed={collapsed}
              activeGroup={group.id === activeGroupId}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}
        </nav>

        {!collapsed && user && (
          <div className="shrink-0 border-t border-slate-800 px-4 py-3">
            <p className="truncate text-sm font-medium text-white">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-slate-400">
              {user.role?.displayName ?? user.role?.name}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function NavGroupBlock({
  group,
  collapsed,
  activeGroup,
  onNavigate,
}: {
  group: NavGroup;
  collapsed: boolean;
  activeGroup: boolean;
  onNavigate: () => void;
}) {
  return (
    <div>
      {!collapsed && (
        <p
          className={[
            'mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.16em]',
            activeGroup ? 'text-teal-400' : 'text-slate-500',
          ].join(' ')}
        >
          {group.label}
        </p>
      )}
      {collapsed && (
        <div
          className={`mx-auto mb-1.5 h-px w-8 ${activeGroup ? 'bg-teal-500/50' : 'bg-slate-800'}`}
          aria-hidden
        />
      )}
      <ul className="space-y-0.5">
        {group.items.map((item) => (
          <li key={item.id}>
            <NavItemLink item={item} collapsed={collapsed} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavItemLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={({ isActive }) =>
        [
          'group relative flex h-10 items-center gap-3 rounded-lg text-sm font-medium transition-colors',
          collapsed ? 'justify-center px-2' : 'px-3',
          isActive
            ? 'bg-teal-500/15 text-teal-300'
            : 'text-slate-300 hover:bg-slate-900 hover:text-white',
          item.comingSoon ? 'opacity-90' : '',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={[
              'h-5 w-5 shrink-0',
              isActive ? 'text-teal-300' : 'text-slate-400 group-hover:text-white',
            ].join(' ')}
            strokeWidth={1.75}
            aria-hidden
          />
          {!collapsed && (
            <span className="flex min-w-0 flex-1 items-center gap-2 truncate">
              <span className="truncate">{item.label}</span>
              {item.comingSoon && (
                <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  {COMING_SOON_BADGE}
                </span>
              )}
            </span>
          )}

          {/* Tooltip al colapsar */}
          {collapsed && (
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-50 ml-2 hidden whitespace-nowrap rounded-md bg-slate-800 px-2 py-1 text-xs text-white shadow-lg group-hover:block"
            >
              {item.label}
              {item.comingSoon ? ` · ${COMING_SOON_BADGE}` : ''}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
