// Códigos de grupo: PALABRA-4 dígitos (por ejemplo LUNA-4821).
export function normalizarCodigo(c: string): string {
  return c.trim().toUpperCase().replace(/\s+/g, '').replace(/[–—]/g, '-');
}

export function validarCodigo(c: string): boolean {
  return /^[A-ZÑ]{3,10}-\d{4}$/.test(normalizarCodigo(c));
}
