import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:entrig/entrig.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:firebase_core/firebase_core.dart';
import 'core/theme/app_theme.dart';
import 'core/providers/app_providers.dart';
import 'features/dashboard/dashboard_screen.dart';
import 'features/auth/auth_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  const entrigApiKey = String.fromEnvironment(
    'ENTRIG_API_KEY',
    defaultValue:
        'sk-proj-5907acf6-cdf8c5fe46a1f7d9ffca2fc338b190f4f330f339eadc28ecce6c37e895391578',
  );

  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint('Firebase init error (or already initialized): $e');
  }

  await Entrig.init(apiKey: entrigApiKey, showForegroundNotification: true);

  const supabaseUrl = String.fromEnvironment(
    'PUBLIC_SUPABASE_URL',
    defaultValue: 'https://lmcyihmgmybebkpwcyvb.supabase.co',
  );
  const supabaseAnonKey = String.fromEnvironment(
    'PUBLIC_SUPABASE_ANON_KEY',
    defaultValue:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtY3lpaG1nbXliZWJrcHdjeXZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYwODQwMjUsImV4cCI6MjEwMTY2MDAyNX0.1Xqe3LqxoL_ixOgLyKQRUT6gAHiZbvzFl830CWKqkio',
  );

  bool hasSupabase = supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;

  if (hasSupabase) {
    await Supabase.initialize(url: supabaseUrl, anonKey: supabaseAnonKey);
  } else {
    debugPrint('Supabase credentials missing. App will run in degraded mode.');
  }

  runApp(ProviderScope(child: ChronosFocusApp(hasSupabase: hasSupabase)));
}

class ChronosFocusApp extends ConsumerWidget {
  final bool hasSupabase;
  const ChronosFocusApp({super.key, this.hasSupabase = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Listen to the auth state
    final authStateAsync = ref.watch(authStateProvider);

    // Register user with Entrig when they log in
    ref.listen<AsyncValue<AuthState>>(authStateProvider, (previous, next) {
      final userId = next.value?.session?.user.id;
      if (userId != null) {
        Entrig.register(userId: userId);
      }
    });

    return MaterialApp(
      title: 'Chronos Focus',
      theme: AppTheme.darkTheme,
      home: authStateAsync.when(
        data: (authState) {
          if (authState.session != null) {
            return const DashboardScreen();
          }
          return const AuthScreen();
        },
        loading: () =>
            const Scaffold(body: Center(child: CircularProgressIndicator())),
        error: (error, stack) => Scaffold(
          body: Center(child: Text('Error loading auth state: $error')),
        ),
      ),
    );
  }
}
