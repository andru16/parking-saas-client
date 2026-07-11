/**
 * Selector de organización — arquitectura preparada para multi-org.
 */
export function OrganizationSwitcher({
  organizationName,
}: {
  organizationName?: string | null;
}) {
  return (
    <div className="hidden min-w-0 max-w-[14rem] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 sm:flex">
      <span className="truncate text-xs font-medium text-slate-700">
        {organizationName ?? 'Sin organización'}
      </span>
      <span
        className="shrink-0 rounded bg-slate-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate-500"
        title="Multi-organización disponible en una fase posterior"
      >
        Org
      </span>
    </div>
  );
}
