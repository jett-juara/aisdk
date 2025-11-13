import {
  Montserrat,
  Rubik,
  Manrope,
  JetBrains_Mono,
  Montagu_Slab,
  Albert_Sans,
  Instrument_Sans,
} from 'next/font/google';

// Next/font harus dipanggil di module scope (bukan via dynamic import)
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700','800','900'],
  style: ['normal','italic'],
  variable: '--font-montserrat',
  display: 'swap',
});


const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300','400','500','600','700','800','900'],
  style: ['normal','italic'],
  variable: '--font-rubik',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const montaguSlab = Montagu_Slab({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-montagu-slab',
  display: 'swap',
});

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['100','200','300','400','500','600','700','800','900'],
  style: ['normal','italic'],
  variable: '--font-albert-sans',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-sans',
  display: 'swap',
});

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
