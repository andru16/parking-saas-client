import { Link } from 'react-router-dom';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  reportHint?: string;
}

export function ModulePlaceholderPage({ title, description, reportHint }: ModulePlaceholderProps) {
  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-3 text-sm text-gray-600">{description}</p>
      <p className="mt-2 text-xs text-gray-400">
        El módulo CRUD estará disponible en una próxima fase. La API operativa y los reportes ya
        existen donde aplica.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/dashboard"
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Ir al Dashboard
        </Link>
        {reportHint && (
          <Link
            to="/reports"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {reportHint}
          </Link>
        )}
      </div>
    </div>
  );
}
