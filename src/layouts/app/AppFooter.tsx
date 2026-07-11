export function AppFooter() {
  const year = new Date().getFullYear();
  const appName = import.meta.env.VITE_APP_NAME ?? 'Parking SaaS';

  return (
    <footer className="border-t border-slate-200 bg-white/80 px-4 py-3 text-center text-xs text-slate-400 sm:px-6">
      © {year} {appName} · Operación de parqueaderos
    </footer>
  );
}
