/**
 * Formatos de placa colombiana y resolución de categoría.
 *
 * - Carro: 3 letras + 3 números → CBF424
 * - Moto antigua: 3 letras + 2 números → UMO47
 * - Moto 2000+: 3 letras + 2 números + 1 letra → ZGT26F
 */

export type PlateKind = 'car' | 'moto' | 'unknown';

export type CategoryOptionLike = {
  id: string;
  name: string;
  icon?: string;
};

export type ResolveCategoryResult = {
  categoryId: string | null;
  autoDetected: boolean;
  reason: 'single_category' | 'plate_format' | 'no_categories' | 'plate_kind_mismatch' | 'unknown_format' | 'ambiguous';
  plateKind: PlateKind;
  message: string | null;
};

export function normalizePlate(plate: string): string {
  return plate.replace(/[\s\-.]/g, '').toUpperCase();
}

export function detectColombianPlateKind(plate: string): PlateKind {
  const p = normalizePlate(plate);
  if (!p) return 'unknown';
  if (/^[A-Z]{3}\d{3}$/.test(p)) return 'car';
  if (/^[A-Z]{3}\d{2}[A-Z]$/.test(p)) return 'moto';
  if (/^[A-Z]{3}\d{2}$/.test(p)) return 'moto';
  return 'unknown';
}

export function isValidColombianPlate(plate: string): boolean {
  return detectColombianPlateKind(plate) !== 'unknown';
}

function categoryKind(category: CategoryOptionLike): 'car' | 'moto' | 'bike' | 'other' {
  const icon = String(category.icon ?? '').toLowerCase();
  const name = String(category.name ?? '').toLowerCase();

  if (icon === 'car' || /carro|auto|veh[ií]culo|camioneta|autom[oó]vil/.test(name)) {
    return 'car';
  }
  if (icon === 'motorcycle' || icon === 'moto' || /moto/.test(name)) {
    return 'moto';
  }
  if (icon === 'bicycle' || /bici/.test(name)) {
    return 'bike';
  }
  return 'other';
}

export function resolveCategoryFromPlate(
  plate: string,
  categories: CategoryOptionLike[] = [],
): ResolveCategoryResult {
  const withId = categories
    .filter((c) => c.id)
    .map((c) => ({ ...c, kind: categoryKind(c) }));

  if (withId.length === 0) {
    return {
      categoryId: null,
      autoDetected: false,
      reason: 'no_categories',
      plateKind: detectColombianPlateKind(plate),
      message: 'No hay categorías activas configuradas',
    };
  }

  const plateKind = detectColombianPlateKind(plate);
  const cars = withId.filter((c) => c.kind === 'car');
  const motos = withId.filter((c) => c.kind === 'moto');
  const onlyCars = cars.length > 0 && motos.length === 0;
  const onlyMotos = motos.length > 0 && cars.length === 0;

  if (withId.length === 1) {
    const only = withId[0];
    if (plate && plateKind !== 'unknown') {
      if (only.kind === 'car' && plateKind === 'moto') {
        return {
          categoryId: null,
          autoDetected: false,
          reason: 'plate_kind_mismatch',
          plateKind,
          message: 'La placa parece de moto, pero este parqueadero solo opera carros',
        };
      }
      if (only.kind === 'moto' && plateKind === 'car') {
        return {
          categoryId: null,
          autoDetected: false,
          reason: 'plate_kind_mismatch',
          plateKind,
          message: 'La placa parece de carro, pero este parqueadero solo opera motos',
        };
      }
    }
    return {
      categoryId: only.id,
      autoDetected: true,
      reason: 'single_category',
      plateKind,
      message: null,
    };
  }

  if (plate && plateKind === 'car' && onlyMotos) {
    return {
      categoryId: null,
      autoDetected: false,
      reason: 'plate_kind_mismatch',
      plateKind,
      message: 'La placa parece de carro, pero este parqueadero solo opera motos',
    };
  }

  if (plate && plateKind === 'moto' && onlyCars) {
    return {
      categoryId: null,
      autoDetected: false,
      reason: 'plate_kind_mismatch',
      plateKind,
      message: 'La placa parece de moto, pero este parqueadero solo opera carros',
    };
  }

  if (plateKind === 'car' || plateKind === 'moto') {
    const matches = withId.filter((c) => c.kind === plateKind);
    if (matches.length === 1) {
      return {
        categoryId: matches[0].id,
        autoDetected: true,
        reason: 'plate_format',
        plateKind,
        message: null,
      };
    }
  }

  return {
    categoryId: null,
    autoDetected: false,
    reason: plateKind === 'unknown' ? 'unknown_format' : 'ambiguous',
    plateKind,
    message: null,
  };
}

export function plateKindLabel(kind: PlateKind): string {
  if (kind === 'car') return 'carro';
  if (kind === 'moto') return 'moto';
  return 'desconocido';
}
