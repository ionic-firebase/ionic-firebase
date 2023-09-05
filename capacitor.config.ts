import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'standalone-example',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  }
};

export default config;
