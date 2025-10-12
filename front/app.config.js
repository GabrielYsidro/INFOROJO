// app.config.js
import 'dotenv/config'; // Necesario si usas un archivo .env local

export default {
  expo: {
    "name": "InfoRojoApp",
    "slug": "InfoRojoApp",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "inforojoapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "package": "com.grupo5.inforojoapp",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "config": {
        "googleMaps": {
          "apiKey": process.env.GOOGLE_MAPS_API_KEY,
        }
      },
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "API_URL_DEV": "http://10.0.2.2:8000",
      "API_URL_PROD": "https://backend-inforojo-ckh4hedjhqdtdfaq.eastus-01.azurewebsites.net",
      "router": {},
      "eas": {
        "projectId": "af721a0f-209b-44b6-a917-c7f28766ffac"
      }
    }
  }
};