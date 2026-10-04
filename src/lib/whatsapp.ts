// The business number, digits only with country code: 8716-3308 in Costa Rica, confirmed by
// the client as its WhatsApp.
const WHATSAPP_NUMBER = "50687163308";

export function wa(text: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
