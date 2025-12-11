import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.fintrack.app",
  appName: "FinTrack",
  webDir: "dist/spa",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#1e293b",
      showSpinner: true,
      spinnerColor: "#3b82f6",
    },
    StatusBar: {
      style: "dark",
      color: "#1e293b",
    },
  },
};

export default config;
