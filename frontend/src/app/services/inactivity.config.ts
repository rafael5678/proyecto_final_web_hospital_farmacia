/** Tiempos de inactividad antes de cerrar sesión (estilo banca / empresa) */
export const INACTIVITY_TIMEOUT_MS = {
  /** Portal médico: 7 minutos sin interacción */
  MEDICO: 7 * 60 * 1000,
  /** Panel admin: 10 minutos sin interacción (máxima seguridad) */
  ADMIN: 10 * 60 * 1000
} as const;
