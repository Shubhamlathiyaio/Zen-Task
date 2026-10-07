import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get darkTheme {
    const primary = Color(0xFF925CF3);
    const primaryHover = Color(0xFFA77AF7);
    const primaryLight = Color(0xFFBDA8FF);
    const secondary = Color(0xFF5B2DAE);
    const surface = Color(0xFF3D255E);
    const surfaceElevated = Color(0xFF4B2D73);
    const border = Color(0xFF374151);

    return ThemeData(
      brightness: Brightness.dark,
      primaryColor: primary,
      scaffoldBackgroundColor: const Color(0xFF121212),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: Color(0xFF3D255E),
        elevation: 0,
      ),
      colorScheme: const ColorScheme.dark(
        primary: primary,
        onPrimary: Colors.white,
        secondary: secondary,
        onSecondary: Colors.white,
        surface: surface,
        onSurface: Colors.white,
        error: Color(0xFFE35D6A),
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(
          fontFamily: 'Varela Round',
          fontSize: 56,
          height: 1.14,
        ),
        headlineLarge: TextStyle(
          fontFamily: 'Varela Round',
          fontSize: 48,
          height: 1.33,
        ),
        headlineMedium: TextStyle(
          fontFamily: 'Varela Round',
          fontSize: 32,
          height: 1.71,
        ),
        headlineSmall: TextStyle(
          fontFamily: 'Varela Round',
          fontSize: 24,
          height: 1.33,
        ),
        bodyLarge: TextStyle(fontSize: 18, height: 1.45),
        bodyMedium: TextStyle(fontSize: 16, height: 1.5),
        bodySmall: TextStyle(fontSize: 14, height: 1.43),
        labelLarge: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        labelMedium: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
        labelSmall: TextStyle(fontSize: 14),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: surface,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16),
        constraints: const BoxConstraints(minHeight: 48),
        labelStyle: const TextStyle(color: primaryLight),
        hintStyle: const TextStyle(color: Color(0xFFC9B8FF)),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(2)),
          borderSide: BorderSide(color: border),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.all(Radius.circular(2)),
          borderSide: BorderSide(color: primaryLight, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ButtonStyle(
          minimumSize: const WidgetStatePropertyAll(Size(0, 48)),
          padding: const WidgetStatePropertyAll(
            EdgeInsets.symmetric(horizontal: 17, vertical: 16),
          ),
          shape: const WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(4)),
            ),
          ),
          backgroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return surfaceElevated.withValues(alpha: 0.45);
            }
            if (states.contains(WidgetState.hovered) ||
                states.contains(WidgetState.focused)) {
              return primaryHover;
            }
            return primary;
          }),
          foregroundColor: WidgetStateProperty.resolveWith((states) {
            if (states.contains(WidgetState.disabled)) {
              return Colors.white.withValues(alpha: 0.55);
            }
            return Colors.white;
          }),
          overlayColor: const WidgetStatePropertyAll(Color(0x1FFFFFFF)),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: ButtonStyle(
          minimumSize: const WidgetStatePropertyAll(Size(0, 48)),
          foregroundColor: const WidgetStatePropertyAll(primaryLight),
          overlayColor: const WidgetStatePropertyAll(Color(0x1FFFFFFF)),
          shape: const WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(2)),
            ),
          ),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: ButtonStyle(
          minimumSize: const WidgetStatePropertyAll(Size(0, 48)),
          foregroundColor: const WidgetStatePropertyAll(primaryLight),
          side: const WidgetStatePropertyAll(BorderSide(color: primaryLight)),
          shape: const WidgetStatePropertyAll(
            RoundedRectangleBorder(
              borderRadius: BorderRadius.all(Radius.circular(2)),
            ),
          ),
        ),
      ),
      snackBarTheme: const SnackBarThemeData(
        backgroundColor: Color(0xFF5B2DAE),
        contentTextStyle: TextStyle(color: Colors.white),
      ),
      floatingActionButtonTheme: const FloatingActionButtonThemeData(
        backgroundColor: Color(0xFF925CF3),
        foregroundColor: Colors.white,
      ),
    );
  }
}
