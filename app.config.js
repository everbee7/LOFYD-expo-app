import 'dotenv/config';

export default {
  expo: {
    name: "lofyd",
    slug: "lofyd",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "lofyd",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.lofyd.app",
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        NSAppTransportSecurity: {
          NSAllowsArbitraryLoads: true
        },
        "UIBackgroundModes": ["fetch", "remote-notification"]
      }
    },
    android: {
      package: "com.lofyd.app",
      usesCleartextTraffic: true,
      intentFilters: [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "lofyd.onrender.com",
              "pathPrefix": ""
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ],
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff"
        }
      ],
      "expo-localization",
      [
        "expo-build-properties",
        {
          "android": {
            "usesCleartextTraffic": true
          },
          "ios": {
            "NSAppTransportSecurity": {
              "NSAllowsArbitraryLoads": true
            }
          }
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      eas: {
        "projectId": "4378c182-70a8-4632-9c8e-b74c02172842"
      },
      API_URL: process.env.EXPO_PUBLIC_API_URL,
      AWS_REGION: process.env.EXPO_PUBLIC_AWS_REGION,
      MIN_VERIFICATION_COUNT: process.env.EXPO_PUBLIC_MIN_VERIFICATION_COUNT,
      ENVIRONMENT: process.env.EXPO_PUBLIC_ENVIRONMENT,
    },
    owner: "cgastin",
    updates: {
      url: "https://u.expo.dev/4378c182-70a8-4632-9c8e-b74c02172842"
    },
    runtimeVersion: {
      policy: "appVersion"
    }
  }
};
