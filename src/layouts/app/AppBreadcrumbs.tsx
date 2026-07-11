import { Link, useLocation } from 'react-router-dom';
import { ROUTE_LABELS } from '@/modules/navigation/nav.config';

export function AppBreadcrumbs() {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs: { label: string; to?: string }[] = [{ label: 'Inicio', to: '/dashboard' }];

  let acc = '';
  for (const segment of segments) {
    acc += `/${segment}`;
    const label = ROUTE_LABELS[acc] ?? segment.replace(/-/g, ' ');
    crumbs.push({ label, to: acc });
  }

  const last = crumbs[crumbs.length - 1];
  if (last) delete last.to;

  return (
    <nav aria-label="Breadcrumb" className="text-xs text-slate-500">
      <ol className="flex flex-wrap items-center gap-1">
        {crumbs.map((crumb, index) => (
          <li key={`${crumb.label}-${index}`} className="flex items-center gap-1">
            {index > 0 && <span className="text-slate-300">/</span>}
            {crumb.to ? (
              <Link to={crumb.to} className="hover:text-slate-800">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-slate-800">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
