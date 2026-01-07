import { defineConfig } from 'vite';
import { resolve } from 'path';

import dts from 'vite-plugin-dts';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'lib'),
    },
  },
  build: {
    lib: {
      entry: {
        api: './lib/api/index.ts',
        federation: './lib/federation/index.ts',
        'handler/core': './lib/handler/core/index.ts',
        'handler/par': './lib/handler/par/index.ts',
        'handler/authorization': './lib/handler/authorization/index.ts',
        'handler/authorization-decision':
          './lib/handler/authorization-decision/index.ts',
        'handler/authorization-fail':
          './lib/handler/authorization-fail/index.ts',
        'handler/authorization-issue':
          './lib/handler/authorization-issue/index.ts',
        'handler/credential': './lib/handler/credential/index.ts',
        'handler/token': './lib/handler/token/index.ts',
        'handler/token-issue': './lib/handler/token-issue/index.ts',
        'handler/token-fail': './lib/handler/token-fail/index.ts',
        'handler/token-create': './lib/handler/token-create/index.ts',
        'handler/introspection': './lib/handler/introspection/index.ts',
        'handler/service-configuration':
          './lib/handler/service-configuration/index.ts',
        'handler/credential-metadata':
          './lib/handler/credential-metadata/index.ts',
        'handler/credential-single-parse':
          './lib/handler/credential-single-parse/index.ts',
        'handler/credential-single-issue':
          './lib/handler/credential-single-issue/index.ts',
        'handler/credential-issuer-jwks':
          './lib/handler/credential-issuer-jwks/index.ts',
        'handler/service-jwks': './lib/handler/service-jwks/index.ts',
        'handler/federation-initiation':
          './lib/handler/federation-initiation/index.ts',
        'handler/federation-callback':
          './lib/handler/federation-callback/index.ts',
        'handler/standard-introspection':
          './lib/handler/standard-introspection/index.ts',
        'handler/client-registration':
          './lib/handler/client-registration/index.ts',
        extractor: './lib/extractor/index.ts',
        session: './lib/session/index.ts',
      },
      name: 'au3te-ts-server',
      fileName: (format, entry) => {
        const ext = format === 'es' ? 'mjs' : format;
        return `${entry}/index.${ext}`;
      },
    },
    rollupOptions: {
      external: [
        '@vecrea/au3te-ts-common',
        '@vecrea/oid4vc-core',
        'u8a-utils',
        'zod',
        'samlify',
        'samlify-validator-js',
        'ws',
      ],
    },
  },
  plugins: [
    dts({
      rollupTypes: false,
      exclude: ['lib/testing/**'],
    }),
  ],
});
