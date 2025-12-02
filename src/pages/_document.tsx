// src/pages/_document.tsx
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { roboto } from '@/theme/fonts';

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Favicon goes here */}
          <link rel="icon" href="/favicon.jpeg" />
          {/* or: <link rel="icon" type="image/png" href="/favicon.png" /> */}
        </Head>
        <body className={roboto.className}>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
