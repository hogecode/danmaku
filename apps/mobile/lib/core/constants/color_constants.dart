import 'package:flutter/material.dart';

/// カラーパレット定義
class ColorConstants {
  ColorConstants._(); // Private constructor

  // Light Theme
  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightPrimary = Color(0xFF2196F3);
  static const Color lightAccent = Color(0xFFFFC107);
  static const Color lightText = Color(0xFF212121);
  static const Color lightHint = Color(0xFF757575);
  static const Color lightDivider = Color(0xFFBDBDBD);
  static const Color lightControllerBg = Color(0xDD000000);
  static const Color lightError = Color(0xFFD32F2F);

  // Dark Theme
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkPrimary = Color(0xFF90CAF9);
  static const Color darkAccent = Color(0xFFFFB74D);
  static const Color darkText = Color(0xFFEEEEEE);
  static const Color darkHint = Color(0xFFB0B0B0);
  static const Color darkDivider = Color(0xFF424242);
  static const Color darkControllerBg = Color(0xDD1F1F1F);
  static const Color darkError = Color(0xFFEF5350);

  // Danmaku Colors
  static const Color danmakuDefault = Color(0xFFFFEAEA);
  static const Color danmakuRed = Color(0xFFFF0000);
  static const Color danmakuGreen = Color(0xFF00FF00);
  static const Color danmakuBlue = Color(0xFF0000FF);
  static const Color danmakuYellow = Color(0xFFFFFF00);

  // Utility Colors
  static const Color transparent = Color(0x00000000);
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
}
