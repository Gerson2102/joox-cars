/** A WhatsApp chat with the business number (digits only, with country code, from the CMS), with the text typed in. */
export function wa(number: string, text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
