import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.tn.reagentwatch',
  appName: 'ReagentWatch AI',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'https://09b8b02620a93d.lhr.life'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
