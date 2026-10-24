import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'e-commerce.example.domain.com',
    title: 'E Commerce',
    useDomain: true,
  },
  loading: {
    preAngularBootstrap: {
      background: '#fdebed',
      loader: { name: 'lds-default' },
    },
  },
  config: {
    superUsers: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:a03iBqvkyu5okSa/JRzu0w==:qluvL/3S4Rdaesgv:aQI7Fqhh25B1zWGaOfi8Rmst5CPN95CB/GM/agbEtFvCBQ==$$$TAON_ENCRYPTED_END$$$`,
    googleSecret: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:fpbw1+gPu0nIDo5hM/v4EA==:nZvu33XR7iP9ZRdy:VyY02SFKK2wB1QRSsbZLybtmyhQpvhDklf7KHBSD9XSPpBhdVWo5TAk2dvzUMOv6PITe$$$TAON_ENCRYPTED_END$$$`,
    googleClientId:
      '289576612173-2mh31b67pmq2qdes5jedno9tr1m542es.apps.googleusercontent.com',
    ACCESS_TOKEN_SECRET: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:FTMAaF4dNVjzzoFtbT6JOQ==:l1/4VR4Xy9YUIC+8:XmcTGMVDMQ4UrrXB7ZkZvKQfWd76XJnjaTyyt8xfHa8DuLFSbPHf/LGnsj7Pn53jcyt1/vuy49nD3MmkEtRY/MOzQUytKjq5MHwZyJIPYwsDwHK1Vhz7WqaF+ahahw==$$$TAON_ENCRYPTED_END$$$`,
    REFRESH_TOKEN_SECRET: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:+IkSvKjm10AEy5Dum17Mag==:2ZX8S6So5mxtMGMz:OmzMhviWDO1qLOU6hGGICZYb9rCtZsPyyscqqjuqRLW4Zhzi+TGSypVU1anHPCbBdPx5iXL+pITqBiVIedXQ8j0d6WXH9a6e4Vg9/mOAY6zVUUnjSrBM7reUPiQJGI0=$$$TAON_ENCRYPTED_END$$$`,
    STRIPE_SECRET_KEY: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:DNRbIYZLg5lfAfnIGD1tmQ==:LT+oR52kBGjT1wba:/UFNWIc33Va+8kLn0Mh1Ubrs6zb21W/AOn5Ie3nZ3wSevA/RSuYdU4SYvZHxeL3ZM47UrwSuWHT/lEVjfilweJFF8j2uyNRxuLRGPJUMwcBWhR9i0b+fcjON3wB720qXDy8sPojadURiQ69gQgERwExnTBBuQlLNhy36$$$TAON_ENCRYPTED_END$$$`,
    STRIPE_WEBHOOK_KEY: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:6uCKpONJ+lbAgY9JMkAPNA==:0/rayeSXluaeLMsd:/sV6OC5DK5S/kaXlsQrTHgy+PbjU05Ptui1h00h22gxN7bAe6QgghTXNfc9OYoBG5uaLuNO7$$$TAON_ENCRYPTED_END$$$`,
  },
};
export default env;