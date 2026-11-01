export function cleanProductSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export function cleanPackSize(packSize: string): string {
  const s = (packSize || '').toUpperCase().trim();
  const match = s.match(
    /(\d+(?:\.\d+)?)\s*(GM|GRAM|GRAMS|G|ML|KG|KILOGRAM|LT|LTR|LITER|LITRE|L|BOLUS|BOL|TABLET|TAB|PC|PCS)/i
  );
  if (match) {
    const qty = match[1];
    let unit = match[2].toUpperCase();
    if (['GM', 'GRAM', 'GRAMS', 'G'].includes(unit)) unit = 'G';
    else if (['ML', 'MILLILITER'].includes(unit)) unit = 'ML';
    else if (['KG', 'KILOGRAM', 'KILOGRAMS'].includes(unit)) unit = 'KG';
    else if (['LT', 'LTR', 'LITER', 'LITRE', 'L'].includes(unit)) unit = 'L';
    else if (['BOLUS', 'BOLUSES', 'TABLET', 'TABLETS', 'TAB', 'TABS', 'BOL'].includes(unit)) unit = 'BOL';
    else if (['PCS', 'PC', 'PIECE', 'PIECES'].includes(unit)) unit = 'PC';
    return `${qty}${unit}`;
  }
  const fallback = s.replace(/[^A-Z0-9]/g, '').slice(0, 7);
  return fallback || 'STD';
}

export function getFormFactorCode(formFactor: string): string {
  const formMap: Record<string, string> = {
    POWDER: 'POW',
    LIQUID: 'LIQ',
    BOLUS: 'BOL',
    TABLET: 'BOL',
    SACHET: 'SAC',
    SOLUTION: 'SOL',
    OINTMENT: 'OIN',
    INJECTION: 'INJ',
    OTHER: 'OTH',
  };
  return formMap[(formFactor || '').toUpperCase()] || 'GEN';
}

export function formatSerialCode(serial: number | string | null | undefined): string {
  if (serial === null || serial === undefined || serial === '') {
    return '001';
  }
  const parsed = parseInt(String(serial).replace(/\D/g, ''), 10);
  if (!isNaN(parsed)) {
    return String(parsed).padStart(3, '0');
  }
  const cleanStr = String(serial).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  return cleanStr || '001';
}

export function generateStandardSku(
  serialOrName: number | string | null | undefined,
  formFactor: string,
  packSize: string
): string {
  const serialCode = formatSerialCode(serialOrName);
  const formCode = getFormFactorCode(formFactor);
  const packCode = cleanPackSize(packSize);

  return `RAV-${serialCode}-${formCode}-${packCode}`;
}

