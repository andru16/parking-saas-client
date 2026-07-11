import { SETUP_STEPS } from '../constants';

export function SetupProgressBar({ currentStep }: { currentStep: string }) {
  const currentIndex = Math.max(
    0,
    SETUP_STEPS.findIndex((s) => s.key === currentStep),
  );

  return (
    <div className="mb-8">
      <div className="flex justify-between text-xs text-gray-500 mb-2">
        <span>
          Paso {currentIndex + 1} de {SETUP_STEPS.length}
        </span>
        <span>{Math.round(((currentIndex + 1) / SETUP_STEPS.length) * 100)}%</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-600 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / SETUP_STEPS.length) * 100}%` }}
        />
      </div>
      <ol className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
        {SETUP_STEPS.map((step, index) => {
          const isActive = step.key === currentStep;
          const isDone = index < currentIndex;
          return (
            <li
              key={step.key}
              className={`text-sm px-2 py-1 rounded ${
                isActive
                  ? 'bg-primary-100 text-primary-800 font-medium'
                  : isDone
                    ? 'text-green-700'
                    : 'text-gray-500'
              }`}
            >
              {index + 1}. {step.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
