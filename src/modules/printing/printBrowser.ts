/**
 * Imprime HTML del ticket sin abrir popups (evita bloqueo del navegador).
 * Usa un iframe oculto en el documento actual e invoca contentWindow.print().
 */
export function printHtmlContent(html: string, copies = 1) {
  const count = Math.min(5, Math.max(1, copies));

  const existing = document.getElementById('parking-print-frame');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'parking-print-frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('title', 'Impresión de ticket');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;';

  document.body.appendChild(iframe);

  const frameWindow = iframe.contentWindow;
  const frameDoc = frameWindow?.document;

  if (!frameWindow || !frameDoc) {
    iframe.remove();
    throw new Error('No se pudo preparar la impresión en el navegador.');
  }

  frameDoc.open();
  frameDoc.write(html);
  frameDoc.close();

  const cleanup = () => {
    // Dar tiempo a que el diálogo de impresión tome el contenido.
    window.setTimeout(() => {
      iframe.remove();
    }, 60_000);
  };

  const runPrint = () => {
    try {
      for (let i = 0; i < count; i += 1) {
        frameWindow.focus();
        frameWindow.print();
      }
    } finally {
      cleanup();
    }
  };

  // Esperar a que carguen estilos/imágenes del ticket.
  const trigger = () => window.setTimeout(runPrint, 250);

  if (frameDoc.readyState === 'complete') {
    trigger();
  } else {
    iframe.onload = () => trigger();
  }
}
