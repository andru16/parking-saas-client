import { useRef } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

/**
 * Campos ocultos anti-bot (honeypot). Los humanos no los ven;
 * los bots suelen rellenarlos automáticamente.
 */
export function HoneypotFields({
  websiteRegister,
}: {
  websiteRegister: UseFormRegisterReturn;
}) {
  return (
    <div
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: 'absolute',
        left: '-10000px',
        top: 'auto',
        width: '1px',
        height: '1px',
        overflow: 'hidden',
      }}
    >
      <label>
        Sitio web
        <input type="text" autoComplete="off" tabIndex={-1} {...websiteRegister} />
      </label>
    </div>
  );
}

/** Guarda el instante en que se montó el formulario (anti-bot por timing). */
export function useFormStartedAt() {
  const startedAtRef = useRef(Date.now());
  return startedAtRef.current;
}
