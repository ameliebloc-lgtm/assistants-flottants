const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withOverlayService(config) {
  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];
    app.service = app.service || [];
    app.service.push({
      $: {
        'android:name': '.OverlayService',
        'android:foregroundServiceType': 'specialUse',
        'android:exported': 'false',
      },
    });
    return config;
  });

  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const srcDir = path.join(config.modRequest.projectRoot, 'android-native');
      const destDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/java/com/amelie/assistantsflottants');
      fs.mkdirSync(destDir, { recursive: true });
      ['OverlayService.kt', 'OverlayModule.kt', 'OverlayPackage.kt'].forEach((file) => {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      });
      return config;
    },
  ]);

  return config;
}

module.exports = withOverlayService;
