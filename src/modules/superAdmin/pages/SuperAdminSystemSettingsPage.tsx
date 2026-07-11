import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, type ReactNode } from 'react';
import { adminApi } from '@/modules/superAdmin/adminApi';

interface PlatformSettings {
  branding: {
    platformName: string;
    logoUrl: string | null;
    faviconUrl: string | null;
    primaryColor: string;
    secondaryColor: string;
  };
  maintenance: { enabled: boolean; message: string };
  security: {
    maxSessionMinutes: number;
    maxLoginAttempts: number;
    loginWindowMinutes: number;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireNumber: boolean;
    passwordRequireSpecial: boolean;
  };
  saas: { defaultTrialDays: number; gracePeriodDays: number };
  defaults: { timezone: string; language: string; currency: string };
}

export function SuperAdminSystemSettingsPage() {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['admin', 'system-settings'],
    queryFn: async () => {
      const { data } = await adminApi.get('/admin/system-settings');
      return data.data.settings as PlatformSettings;
    },
  });

  const [form, setForm] = useState<PlatformSettings | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (query.data) setForm(structuredClone(query.data));
  }, [query.data]);

  const save = useMutation({
    mutationFn: async (payload: PlatformSettings) => {
      const { data } = await adminApi.put('/admin/system-settings', payload);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin', 'system-settings'] });
      setMessage('Configuración global guardada');
    },
  });

  if (query.isLoading || !form) {
    return <p className="text-sm text-slate-400">Cargando configuración global...</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Configuración global</h1>
        <p className="mt-1 text-sm text-slate-500">
          Marca, mantenimiento, seguridad SaaS y valores por defecto de la plataforma
        </p>
      </div>

      {message && <p className="text-sm text-teal-700">{message}</p>}

      <Section title="Marca">
        <Field label="Nombre de la plataforma">
          <input
            className={inputClass}
            value={form.branding.platformName}
            onChange={(e) =>
              setForm({
                ...form,
                branding: { ...form.branding, platformName: e.target.value },
              })
            }
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Color principal">
            <input
              type="color"
              className="h-10 w-full rounded border"
              value={form.branding.primaryColor}
              onChange={(e) =>
                setForm({
                  ...form,
                  branding: { ...form.branding, primaryColor: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Color secundario">
            <input
              type="color"
              className="h-10 w-full rounded border"
              value={form.branding.secondaryColor}
              onChange={(e) =>
                setForm({
                  ...form,
                  branding: { ...form.branding, secondaryColor: e.target.value },
                })
              }
            />
          </Field>
        </div>
        <Field label="URL logo global">
          <input
            className={inputClass}
            value={form.branding.logoUrl ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                branding: { ...form.branding, logoUrl: e.target.value || null },
              })
            }
          />
        </Field>
        <Field label="URL favicon">
          <input
            className={inputClass}
            value={form.branding.faviconUrl ?? ''}
            onChange={(e) =>
              setForm({
                ...form,
                branding: { ...form.branding, faviconUrl: e.target.value || null },
              })
            }
          />
        </Field>
      </Section>

      <Section title="Mantenimiento">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.maintenance.enabled}
            onChange={(e) =>
              setForm({
                ...form,
                maintenance: { ...form.maintenance, enabled: e.target.checked },
              })
            }
          />
          Modo mantenimiento activo
        </label>
        <Field label="Mensaje">
          <textarea
            className={inputClass}
            rows={2}
            value={form.maintenance.message}
            onChange={(e) =>
              setForm({
                ...form,
                maintenance: { ...form.maintenance, message: e.target.value },
              })
            }
          />
        </Field>
      </Section>

      <Section title="Seguridad y sesión">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Sesión máx. (minutos)">
            <input
              type="number"
              className={inputClass}
              value={form.security.maxSessionMinutes}
              onChange={(e) =>
                setForm({
                  ...form,
                  security: {
                    ...form.security,
                    maxSessionMinutes: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="Intentos de login máx.">
            <input
              type="number"
              className={inputClass}
              value={form.security.maxLoginAttempts}
              onChange={(e) =>
                setForm({
                  ...form,
                  security: {
                    ...form.security,
                    maxLoginAttempts: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
          <Field label="Longitud mínima contraseña">
            <input
              type="number"
              className={inputClass}
              value={form.security.passwordMinLength}
              onChange={(e) =>
                setForm({
                  ...form,
                  security: {
                    ...form.security,
                    passwordMinLength: Number(e.target.value),
                  },
                })
              }
            />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          {(
            [
              ['passwordRequireUppercase', 'Requiere mayúscula'],
              ['passwordRequireNumber', 'Requiere número'],
              ['passwordRequireSpecial', 'Requiere carácter especial'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.security[key]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    security: { ...form.security, [key]: e.target.checked },
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="SaaS (trial y gracia)">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Días de trial por defecto">
            <input
              type="number"
              className={inputClass}
              value={form.saas.defaultTrialDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  saas: { ...form.saas, defaultTrialDays: Number(e.target.value) },
                })
              }
            />
          </Field>
          <Field label="Días de gracia">
            <input
              type="number"
              className={inputClass}
              value={form.saas.gracePeriodDays}
              onChange={(e) =>
                setForm({
                  ...form,
                  saas: { ...form.saas, gracePeriodDays: Number(e.target.value) },
                })
              }
            />
          </Field>
        </div>
      </Section>

      <Section title="Valores por defecto">
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Zona horaria">
            <input
              className={inputClass}
              value={form.defaults.timezone}
              onChange={(e) =>
                setForm({
                  ...form,
                  defaults: { ...form.defaults, timezone: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Idioma">
            <input
              className={inputClass}
              value={form.defaults.language}
              onChange={(e) =>
                setForm({
                  ...form,
                  defaults: { ...form.defaults, language: e.target.value },
                })
              }
            />
          </Field>
          <Field label="Moneda">
            <input
              className={inputClass}
              value={form.defaults.currency}
              onChange={(e) =>
                setForm({
                  ...form,
                  defaults: { ...form.defaults, currency: e.target.value.toUpperCase() },
                })
              }
            />
          </Field>
        </div>
      </Section>

      <button
        type="button"
        disabled={save.isPending}
        onClick={() => void save.mutateAsync(form)}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {save.isPending ? 'Guardando...' : 'Guardar configuración'}
      </button>
    </div>
  );
}

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  );
}
