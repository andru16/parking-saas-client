import { useEffect, useMemo, useState } from 'react';
import type { PrintingConfig } from '@/api/settings';
import type { PrintDocumentType } from '@/api/printing';
import {
  SettingsFormActions,
  SettingsSectionShell,
} from '@/modules/settings/components/SettingsSectionShell';
import {
  useSaveSettingsSection,
  useSettingsSectionData,
} from '@/modules/settings/hooks/useSettingsSection';
import { usePrintPreview } from '@/modules/printing/hooks/usePrinting';

const DEFAULT_PRINTING: PrintingConfig = {
  showLogo: true,
  showParkingName: true,
  showAddress: true,
  showPhone: true,
  showTaxId: true,
  logoUrl: null,
  businessName: '',
  businessTaxId: '',
  businessAddress: '',
  businessCity: '',
  businessPhone: '',
  header: '',
  footer: '',
  welcomeMessage: 'Bienvenido',
  farewellMessage: 'Gracias por su visita',
  lostTicketPolicy:
    'En caso de pérdida del ticket, el vehículo solo se entregará con documento de identidad.',
  paperSize: '80mm',
  copies: 1,
  enableQr: true,
  enableBarcode: true,
  preferredAdapter: 'browser',
  customMessages: { entry: '', exit: '', receipt: '', cash: '', membership: '' },
};

const PREVIEW_OPTIONS: { type: PrintDocumentType; label: string }[] = [
  { type: 'entry', label: 'Ingreso' },
  { type: 'exit', label: 'Salida' },
  { type: 'cash_open', label: 'Apertura' },
  { type: 'cash_close', label: 'Cierre' },
  { type: 'cash_audit', label: 'Arqueo' },
  { type: 'membership_new', label: 'Membresía' },
];

export function SettingsPrintingPage() {
  const query = useSettingsSectionData('printing');
  const save = useSaveSettingsSection('printing');

  if (query.isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-400">Cargando impresión...</p>
      </div>
    );
  }

  return (
    <SettingsSectionShell
      title="Impresión"
      description="Motor de impresión desacoplado · tickets, caja y membresías · 58mm / 80mm / A4."
    >
      {({ readOnly, formKey, finishEditing, cancelEditing }) => (
        <PrintingForm
          key={formKey}
          initial={{ ...DEFAULT_PRINTING, ...(query.data?.data ?? {}) }}
          readOnly={readOnly}
          isSaving={save.isPending}
          onCancel={cancelEditing}
          onSave={async (data) => {
            await save.mutateAsync(data);
            finishEditing();
          }}
        />
      )}
    </SettingsSectionShell>
  );
}

function PrintingForm({
  initial,
  readOnly,
  isSaving,
  onCancel,
  onSave,
}: {
  initial: PrintingConfig;
  readOnly: boolean;
  isSaving: boolean;
  onCancel: () => void;
  onSave: (data: PrintingConfig) => Promise<void>;
}) {
  const [data, setData] = useState(initial);
  const [previewType, setPreviewType] = useState<PrintDocumentType>('entry');
  const [debouncedDraft, setDebouncedDraft] = useState(data);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedDraft(data), 400);
    return () => clearTimeout(timer);
  }, [data]);

  const draft = useMemo(
    () => debouncedDraft as unknown as Record<string, unknown>,
    [debouncedDraft],
  );
  const previewQuery = usePrintPreview(previewType, draft, true);

  const field =
    'w-full rounded-lg border px-3 py-2 disabled:cursor-not-allowed disabled:bg-gray-50';

  const setFlag = (key: keyof PrintingConfig, value: boolean) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  return (
    <form
      className="grid gap-6 lg:grid-cols-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(data);
      }}
    >
      <div className="space-y-4">
        <fieldset disabled={readOnly} className="space-y-4 border-0 p-0">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Datos del negocio (ticket)</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              Opcional: sobrescribe nombre, NIT y contacto solo en impresiones.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(
                [
                  ['businessName', 'Nombre del negocio'],
                  ['businessTaxId', 'NIT'],
                  ['businessAddress', 'Dirección'],
                  ['businessCity', 'Ciudad'],
                  ['businessPhone', 'Teléfono'],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <label className="mb-1 block text-sm font-medium">{label}</label>
                  <input
                    className={field}
                    value={data[key] ?? ''}
                    onChange={(e) => setData((d) => ({ ...d, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <h3 className="text-sm font-semibold text-gray-900">Visibilidad</h3>
          <div className="flex flex-wrap gap-3 text-sm">
            {(
              [
                ['showLogo', 'Logo'],
                ['showParkingName', 'Nombre'],
                ['showAddress', 'Dirección'],
                ['showPhone', 'Teléfono'],
                ['showTaxId', 'NIT'],
                ['enableQr', 'QR'],
                ['enableBarcode', 'Código de barras'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={Boolean(data[key])}
                  onChange={(e) => setFlag(key, e.target.checked)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Logo (URL)</label>
              <input
                className={field}
                value={data.logoUrl ?? ''}
                onChange={(e) => setData((d) => ({ ...d, logoUrl: e.target.value || null }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tamaño de papel</label>
              <select
                className={field}
                value={data.paperSize}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    paperSize: e.target.value as PrintingConfig['paperSize'],
                  }))
                }
              >
                <option value="58mm">58 mm (térmica)</option>
                <option value="80mm">80 mm (térmica)</option>
                <option value="A4">A4 (reportes)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Copias</label>
              <input
                type="number"
                min={1}
                max={5}
                className={field}
                value={data.copies}
                onChange={(e) => setData((d) => ({ ...d, copies: Number(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Canal preferido</label>
              <select
                className={field}
                value={data.preferredAdapter ?? 'browser'}
                onChange={(e) =>
                  setData((d) => ({
                    ...d,
                    preferredAdapter: e.target.value as PrintingConfig['preferredAdapter'],
                  }))
                }
              >
                <option value="browser">Navegador</option>
                <option value="escpos">ESC/POS (prep.)</option>
                <option value="pdf">PDF</option>
                <option value="bluetooth">Bluetooth (prep.)</option>
                <option value="lan">Red LAN (prep.)</option>
                <option value="usb">USB (prep.)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Encabezado</label>
            <input
              className={field}
              value={data.header}
              onChange={(e) => setData((d) => ({ ...d, header: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mensaje de bienvenida</label>
            <textarea
              className={field}
              rows={2}
              value={data.welcomeMessage}
              onChange={(e) => setData((d) => ({ ...d, welcomeMessage: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Mensaje de despedida</label>
            <textarea
              className={field}
              rows={2}
              value={data.farewellMessage}
              onChange={(e) => setData((d) => ({ ...d, farewellMessage: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Política de pérdida del ticket</label>
            <textarea
              className={field}
              rows={3}
              value={data.lostTicketPolicy}
              onChange={(e) => setData((d) => ({ ...d, lostTicketPolicy: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Pie de página</label>
            <textarea
              className={field}
              rows={2}
              value={data.footer}
              onChange={(e) => setData((d) => ({ ...d, footer: e.target.value }))}
            />
          </div>
        </fieldset>

        {!readOnly && <SettingsFormActions isSaving={isSaving} onCancel={onCancel} />}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-gray-900">Vista previa</h3>
          <div className="flex flex-wrap rounded-lg border border-gray-200 p-0.5 text-xs">
            {PREVIEW_OPTIONS.map((opt) => (
              <button
                key={opt.type}
                type="button"
                className={`rounded-md px-2 py-1 ${
                  previewType === opt.type ? 'bg-gray-900 text-white' : 'text-gray-600'
                }`}
                onClick={() => setPreviewType(opt.type)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
          {previewQuery.isLoading && (
            <p className="p-4 text-sm text-gray-500">Generando vista previa...</p>
          )}
          {previewQuery.isError && (
            <p className="p-4 text-sm text-red-600">No se pudo generar la vista previa.</p>
          )}
          {typeof previewQuery.data?.content === 'string' && (
            <iframe
              title="Vista previa de impresión"
              className="h-[640px] w-full bg-white"
              srcDoc={previewQuery.data.content}
            />
          )}
        </div>
        <p className="text-xs text-gray-500">
          Vista previa con datos de ejemplo. La impresión operativa usa el Motor de Impresión
          (`/api/printing`), no lógica dentro de Tickets o Caja.
        </p>
      </div>
    </form>
  );
}
