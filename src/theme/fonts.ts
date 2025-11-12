// src/theme/fonts.ts
import { Manrope, Roboto } from 'next/font/google';

export const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '800'],
  variable: '--font-manrope',
});

export const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400'],
  variable: '--font-roboto',
});
