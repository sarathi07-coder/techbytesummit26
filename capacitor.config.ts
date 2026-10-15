import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'gov.tn.reagentwatch',
  appName: 'ReagentWatch AI',
  webDir: 'public',
  server: {
    androidScheme: 'https',
    cleartext: true,
    url: 'http://10.10.45.28:3000'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
