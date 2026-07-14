import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { isAxiosError } from 'axios';
import { Link, useSearchParams } from 'react-router-dom';
import type {
  GeneralInfoData,
  OperationalData,
  RateItem,
  SetupStepKey,
  VehicleCategoryItem,
} from '@/api/setup';
import { SETUP_STEPS } from '../constants';
import type { GeneralInfoFormValues, OperationalFormValues } from '../schemas/setup.schemas';
import type { SetupStepSubmit } from '../types';
import { useSaveSetupStep, useSetupStepData } from '../hooks/useSetup';
import { SetupProgressBar } from './SetupProgressBar';
import { GeneralInfoStepForm } from './steps/GeneralInfoStepForm';
import { OperationalStepForm } from './steps/OperationalStepForm';
import { VehicleCategoriesStepForm } from './steps/VehicleCategoriesStepForm';
import { RatesStepForm } from './steps/RatesStepForm';
import { SummaryStep } from './steps/SummaryStep';

export function SetupWizard() {
  const [searchParams] = useSearchParams();
  const isReopen = searchParams.get('reopen') === '1';
  const stepParam = searchParams.get('step');
  const initialStep =
    stepParam && SETUP_STEPS.some((s) => s.key === stepParam)
      ? (stepParam as SetupStepKey)
      : 'general_info';
  const [currentStep, setCurrentStep] = useState<SetupStepKey>(initialStep);
  const [error, setError] = useState<string | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const stepSubmitRef = useRef<SetupStepSubmit | null>(null);

  const stepIndex = useMemo(
    () => SETUP_STEPS.findIndex((s) => s.key === currentStep),
    [currentStep],
  );

  useEffect(() => {
    if (stepParam && SETUP_STEPS.some((s) => s.key === stepParam)) {
      setCurrentStep(stepParam as SetupStepKey);
    }
  }, [stepParam]);

  useEffect(() => {
    if (currentStep === 'cash_point') {
      setCurrentStep('summary');
    }
  }, [currentStep]);

  const registerStepSubmit = useCallback((fn: SetupStepSubmit) => {
    stepSubmitRef.current = fn;
    return () => {
      if (stepSubmitRef.current === fn) {
        stepSubmitRef.current = null;
      }
    };
  }, []);

  const saveGeneral = useSaveSetupStep<GeneralInfoData>('general_info');
  const saveOperational = useSaveSetupStep<OperationalData>('operational');
  const saveCategories = useSaveSetupStep<{ categories: VehicleCategoryItem[] }>(
    'vehicle_categories',
  );
  const saveRates = useSaveSetupStep<{ rates: RateItem[]; categories: unknown[] }>('rates');

  const generalQuery = useSetupStepData<GeneralInfoData>(
    'general_info',
    currentStep === 'general_info',
  );
  const operationalQuery = useSetupStepData<OperationalData>(
    'operational',
    currentStep === 'operational',
  );
  const categoriesQuery = useSetupStepData<{ categories: VehicleCategoryItem[] }>(
    'vehicle_categories',
    currentStep === 'vehicle_categories',
  );
  const ratesQuery = useSetupStepData<{
    rates: RateItem[];
    categories: { _id: string; name: string }[];
  }>('rates', currentStep === 'rates');

  const goNext = async () => {
    setError(null);
    setAdvancing(true);
    try {
      if (stepSubmitRef.current) {
        const ok = await stepSubmitRef.current();
        if (!ok) {
          setError('Complete y corrija los campos del paso actual antes de continuar.');
          return;
        }
      }
      const next = SETUP_STEPS[stepIndex + 1];
      if (next) setCurrentStep(next.key);
    } catch {
      setError('Complete y corrija los campos del paso actual antes de continuar.');
    } finally {
      setAdvancing(false);
    }
  };

  const goBack = () => {
    const prev = SETUP_STEPS[stepIndex - 1];
    if (prev) setCurrentStep(prev.key);
  };

  const handleSaveError = useCallback((err: unknown) => {
    if (isAxiosError(err) && err.response?.data?.message) {
      setError(err.response.data.message);
    } else {
      setError('No se pudo guardar la configuración');
    }
  }, []);

  const onSaveGeneral = useCallback(
    async (data: GeneralInfoFormValues) => {
      setError(null);
      try {
        await saveGeneral.mutateAsync(data);
      } catch (err) {
        handleSaveError(err);
        throw err;
      }
    },
    [saveGeneral.mutateAsync, handleSaveError],
  );

  const onSaveOperational = useCallback(
    async (data: OperationalFormValues) => {
      setError(null);
      try {
        await saveOperational.mutateAsync(data);
      } catch (err) {
        handleSaveError(err);
        throw err;
      }
    },
    [saveOperational.mutateAsync, handleSaveError],
  );

  const onSaveCategories = useCallback(
    async (categories: VehicleCategoryItem[]) => {
      setError(null);
      try {
        const response = await saveCategories.mutateAsync({ categories });
        return response.data.data.categories;
      } catch (err) {
        handleSaveError(err);
        throw err;
      }
    },
    [saveCategories.mutateAsync, handleSaveError],
  );

  const onSaveRates = useCallback(
    async (rates: RateItem[]) => {
      setError(null);
      try {
        const response = await saveRates.mutateAsync({ rates });
        const savedRates = response.data?.data?.rates;
        if (!Array.isArray(savedRates)) {
          throw new Error('Respuesta de tarifas inválida');
        }
        return savedRates;
      } catch (err) {
        handleSaveError(err);
        throw err;
      }
    },
    [saveRates.mutateAsync, handleSaveError],
  );

  const isSaving =
    saveGeneral.isPending ||
    saveOperational.isPending ||
    saveCategories.isPending ||
    saveRates.isPending;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isReopen ? 'Configuración del parqueadero' : 'Configuración inicial'}
          </h1>
          <p className="mt-1 text-gray-600">
            {isReopen
              ? 'Puede actualizar categorías, tarifas y datos operativos en cualquier momento.'
              : 'Complete los pasos para habilitar su parqueadero.'}
          </p>
        </div>
        {isReopen && (
          <Link
            to="/dashboard"
            className="shrink-0 text-sm font-medium text-primary-600 hover:underline"
          >
            Volver al dashboard
          </Link>
        )}
      </div>

      <SetupProgressBar currentStep={currentStep} />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {currentStep === 'general_info' && !generalQuery.isLoading && (
        <GeneralInfoStepForm
          initialData={generalQuery.data?.data}
          isSaving={saveGeneral.isPending}
          onSave={onSaveGeneral}
          registerStepSubmit={registerStepSubmit}
        />
      )}

      {currentStep === 'operational' && !operationalQuery.isLoading && (
        <OperationalStepForm
          initialData={operationalQuery.data?.data}
          isSaving={saveOperational.isPending}
          onSave={onSaveOperational}
          registerStepSubmit={registerStepSubmit}
        />
      )}

      {currentStep === 'vehicle_categories' && !categoriesQuery.isLoading && (
        <VehicleCategoriesStepForm
          initialCategories={categoriesQuery.data?.data.categories ?? []}
          isSaving={saveCategories.isPending}
          onSave={onSaveCategories}
          registerStepSubmit={registerStepSubmit}
        />
      )}

      {currentStep === 'rates' && !ratesQuery.isLoading && (
        <RatesStepForm
          initialRates={ratesQuery.data?.data.rates ?? []}
          categories={ratesQuery.data?.data.categories ?? []}
          isSaving={saveRates.isPending}
          onSave={onSaveRates}
          registerStepSubmit={registerStepSubmit}
        />
      )}

      {currentStep === 'summary' && (
        <SummaryStep onGoToStep={(key) => setCurrentStep(key as SetupStepKey)} />
      )}

      {currentStep !== 'summary' && (
        <div className="mt-8 flex justify-between">
          <button
            type="button"
            onClick={goBack}
            disabled={stepIndex === 0 || advancing}
            className="cursor-pointer rounded-lg border px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => void goNext()}
            disabled={advancing || isSaving}
            className="cursor-pointer rounded-lg bg-primary-600 px-4 py-2 text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {advancing ? 'Validando...' : 'Siguiente'}
          </button>
        </div>
      )}
    </div>
  );
}
