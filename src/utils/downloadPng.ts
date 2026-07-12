// Convierte un data URL base64 en un Blob del mismo tipo MIME.
function dataUrlToBlob(dataUrl: string): Blob {
  const commaIndex = dataUrl.indexOf(',');
  const header = dataUrl.slice(0, commaIndex);
  const base64 = dataUrl.slice(commaIndex + 1);
  const mime = /data:(.*?);base64/.exec(header)?.[1] ?? 'image/png';

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

// Descarga un data URL como archivo. Se pasa por un Blob + object URL en vez
// de asignar el data URL directamente al href: los data URL grandes (una foto
// a resolución de webcam pesa varios MB) hacen que Chrome marque la descarga
// como "fallida". El object URL evita ese límite y se revoca tras el click.
export function downloadPng(dataUrl: string, filename: string): void {
  const objectUrl = URL.createObjectURL(dataUrlToBlob(dataUrl));
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
