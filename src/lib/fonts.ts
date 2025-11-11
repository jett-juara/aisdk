import {
  Montserrat,
  Raleway,
  Rubik,
  Manrope,
  JetBrains_Mono,
  Montagu_Slab,
} from 'next/font/google';

// Next/font harus dipanggil di module scope (bukan via dynamic import)
const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-montserrat',
  display: 'swap',
});

const raleway = Raleway({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-raleway',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-rubik',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
  weight: ['400', '700'],
  variable: '--font-montagu-slab',
  display: 'swap',
});

export function getFontVariables() {
  if (process.env.DISABLE_GOOGLE_FONTS === 'true') {
    return '';
  }
  return [
    montserrat.variable,
    raleway.variable,
    rubik.variable,
    manrope.variable,
    jetbrainsMono.variable,
    montaguSlab.variable,
  ].join(' ');
}
