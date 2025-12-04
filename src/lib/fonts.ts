const montserrat = { variable: '' };
const rubik = { variable: '' };
const manrope = { variable: '' };
const jetbrainsMono = { variable: '' };
const montaguSlab = { variable: '' };
const albertSans = { variable: '' };
const instrumentSans = { variable: '' };

export function getFontVariables() {
  if (process.env.DISABLE_GOOGLE_FONTS === 'true') {
    return '';
  }
  return [
    montserrat.variable,
    rubik.variable,
    manrope.variable,
    jetbrainsMono.variable,
    montaguSlab.variable,
    albertSans.variable,
    instrumentSans.variable,
  ].join(' ');
}
// Helper untuk heading font (Albert Sans)
export const albertSansFont = {
  cssVariable: '--font-albert-sans',
  family: '"Albert Sans", sans-serif',
};

// Helper untuk button font (Instrument Sans)
export const instrumentSansFont = {
  cssVariable: '--font-instrument-sans',
  family: '"Instrument Sans", sans-serif',
};
