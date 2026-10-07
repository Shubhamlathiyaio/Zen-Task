import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:entrig/entrig.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import '../quests/quests_screen.dart';
import '../focus/focus_screen.dart';
import '../chronicles/chronicles_screen.dart';
import '../store/store_screen.dart';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/providers/app_providers.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    Entrig.foregroundNotifications.listen((event) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Received Push: ${event.title} - ${event.body}'),
            backgroundColor: Colors.green,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    });

    try {
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'RAW PUSH: ${message.notification?.title ?? "No Title"}',
              ),
              backgroundColor: Colors.blue,
              duration: const Duration(seconds: 10),
            ),
          );
        }
      });
    } catch (e) {
      debugPrint('Error attaching raw listener: $e');
    }
  }

  final List<String> _titles = [
    'Quests Dashboard',
    'Focus Timer',
    'Chronicles',
    'Rewards Store',
  ];

  final List<Widget> _screens = [
    const QuestsScreen(),
    const FocusScreen(),
    const ChroniclesScreen(),
    const StoreScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          _titles[_currentIndex],
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          Consumer(
            builder: (context, ref, child) {
              final coinAsyncValue = ref.watch(coinBalanceProvider);

              return coinAsyncValue.when(
                data: (coins) => Container(
                  margin: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 10,
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  decoration: BoxDecoration(
                    color: const Color(0xFF5B2DAE),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.monetization_on,
                        color: Colors.amber,
                        size: 18,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '$coins',
                        style: const TextStyle(
                          color: Colors.amber,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
                loading: () => const Center(child: CircularProgressIndicator()),
                error: (error, stack) =>
                    const Icon(Icons.error, color: Colors.red),
              );
            },
          ),
          const SizedBox(width: 8),
          const CircleAvatar(
            backgroundColor: Color(0xFF5B2DAE),
            child: Icon(Icons.person, color: Colors.white),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: _screens[_currentIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
        },
        type: BottomNavigationBarType.fixed,
        backgroundColor: const Color(0xFF3D255E),
        selectedItemColor: Colors.white,
        unselectedItemColor: Colors.white54,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.assignment),
            label: 'Quests',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.timer), label: 'Focus'),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: 'Chronicles',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.shopping_bag),
            label: 'Store',
          ),
        ],
      ),
      floatingActionButton: _currentIndex == 0
          ? Column(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                FloatingActionButton.extended(
                  heroTag: 'demo-btn',
                  onPressed: () async {
                    final userId = ref.read(userIdProvider);
                    if (userId == null) return;

                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text(
                          'Demo push scheduled! Wait 15 seconds...',
                        ),
                      ),
                    );

                    try {
                      await Supabase.instance.client.functions.invoke(
                        'demo-push',
                        body: {'userId': userId},
                      );
                    } catch (e) {
                      debugPrint('Edge function error: $e');
                    }
                  },
                  icon: const Icon(Icons.notifications_active),
                  label: const Text('15s Push Demo'),
                  backgroundColor: Colors.amber.shade700,
                ),
                const SizedBox(height: 16),
                FloatingActionButton.extended(
                  heroTag: 'add-btn',
                  onPressed: () async {
                    final userId = ref.read(userIdProvider);
                    if (userId == null) return;

                    await Supabase.instance.client.from('tasks').insert({
                      'user_id': userId,
                      'title': 'Demo Task ${DateTime.now().second}',
                      'description': 'Created via physical button',
                    });
                  },
                  icon: const Icon(Icons.add),
                  label: const Text('Add Task'),
                ),
              ],
            )
          : null,
    );
  }
}
