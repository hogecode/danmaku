import 'package:flutter/material.dart';
import 'package:flutter_app/core/constants/color_constants.dart';

/// アプリテーマ管理
class AppTheme {
  AppTheme._();

  /// ライトテーマ
  static ThemeData lightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: ColorConstants.lightPrimary,
      scaffoldBackgroundColor: ColorConstants.lightBackground,
      appBarTheme: const AppBarTheme(
        backgroundColor: ColorConstants.lightPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      tabBarTheme: const TabBarTheme(
        labelColor: Colors.white,
        unselectedLabelColor: Colors.grey,
        indicator: UnderlineTabIndicator(
          borderSide: BorderSide(
            color: Colors.white,
            width: 3,
          ),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ColorConstants.lightPrimary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: ColorConstants.lightPrimary,
        inactiveTrackColor: Colors.grey[300],
        thumbColor: ColorConstants.lightPrimary,
        overlayColor: ColorConstants.lightPrimary.withOpacity(0.2),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return ColorConstants.lightPrimary;
          }
          return Colors.grey;
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return ColorConstants.lightPrimary.withOpacity(0.5);
          }
          return Colors.grey[300];
        }),
      ),
    );
  }

  /// ダークテーマ
  static ThemeData darkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: ColorConstants.darkPrimary,
      scaffoldBackgroundColor: ColorConstants.darkBackground,
      appBarTheme: const AppBarTheme(
        backgroundColor: ColorConstants.darkControllerBg,
        foregroundColor: ColorConstants.darkText,
        elevation: 0,
      ),
      tabBarTheme: const TabBarTheme(
        labelColor: ColorConstants.darkPrimary,
        unselectedLabelColor: Colors.grey,
        indicator: UnderlineTabIndicator(
          borderSide: BorderSide(
            color: ColorConstants.darkPrimary,
            width: 3,
          ),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: ColorConstants.darkPrimary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
      sliderTheme: SliderThemeData(
        activeTrackColor: ColorConstants.darkPrimary,
        inactiveTrackColor: Colors.grey[700],
        thumbColor: ColorConstants.darkPrimary,
        overlayColor: ColorConstants.darkPrimary.withOpacity(0.2),
      ),
      switchTheme: SwitchThemeData(
        thumbColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return ColorConstants.darkPrimary;
          }
          return Colors.grey[600];
        }),
        trackColor: MaterialStateProperty.resolveWith((states) {
          if (states.contains(MaterialState.selected)) {
            return ColorConstants.darkPrimary.withOpacity(0.5);
          }
          return Colors.grey[700];
        }),
      ),
    );
  }
}
