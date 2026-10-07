import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// Provides the current AuthState stream from Supabase
final authStateProvider = StreamProvider<AuthState>((ref) {
  return Supabase.instance.client.auth.onAuthStateChange;
});

// Provides the current logged-in user ID, or null if not logged in
final userIdProvider = Provider<String?>((ref) {
  final authState = ref.watch(authStateProvider).value;
  return authState?.session?.user.id;
});

// Provides the user's coin balance from Supabase
final coinBalanceProvider = StreamProvider<int>((ref) {
  final userId = ref.watch(userIdProvider);
  if (userId == null) return Stream.value(0);

  return Supabase.instance.client
      .from('profiles')
      .stream(primaryKey: ['id'])
      .eq('id', userId)
      .map((list) => list.isNotEmpty ? (list.first['coin_balance'] as int? ?? 0) : 0);
});
