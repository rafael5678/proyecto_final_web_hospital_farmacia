/** Tiempos de inactividad antes de cerrar sesión (IA + máxima seguridad) */
export const INACTIVITY_TIMEOUT_MS = {
  /** Portal médico: 5 minutos sin interacción (estricto por HIPAA/Ley 1581) */
  MEDICO: 5 * 60 * 1000,
  /** Panel admin: 10 SEGUNDOS sin interacción (máxima seguridad) */
  ADMIN: 10 * 1000
} as const;
