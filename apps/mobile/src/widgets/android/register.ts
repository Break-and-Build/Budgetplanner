/**
 * Register the Android widget task handler at module import time.
 *
 * Imported from index.js so it runs both in the main app process AND in
 * the headless-JS context Android uses when it needs to update a widget
 * while the app isn't open. Guarded to Android — iOS uses the
 * WidgetBridge Expo module via useWidgetSync instead.
 */

import { Platform } from 'react-native';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import { widgetTaskHandler } from './widgetTaskHandler';

if (Platform.OS === 'android') {
  registerWidgetTaskHandler(widgetTaskHandler);
}
