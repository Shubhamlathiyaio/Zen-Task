import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class StoreScreen extends StatelessWidget {
  const StoreScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: Supabase.instance.client.from('rewards').stream(primaryKey: ['id']).order('cost', ascending: true),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }

        final rewards = snapshot.data ?? [];

        if (rewards.isEmpty) {
          return const Center(
            child: Text(
              'No rewards in the store right now.',
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          );
        }

        return GridView.builder(
          padding: const EdgeInsets.all(16),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            childAspectRatio: 0.85,
          ),
          itemCount: rewards.length,
          itemBuilder: (context, index) {
            final reward = rewards[index];
            return Card(
              color: const Color(0xFF3D255E),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(reward['icon'] ?? '🎁', style: const TextStyle(fontSize: 48)),
                  const SizedBox(height: 10),
                  Text(
                    reward['title'] ?? 'Mystery Reward',
                    style: const TextStyle(fontWeight: FontWeight.bold),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 10),
                  ElevatedButton.icon(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                         SnackBar(content: Text('Bought ${reward['title']}!')),
                      );
                    },
                    icon: const Icon(Icons.monetization_on, size: 16, color: Colors.amber),
                    label: Text('${reward['cost'] ?? 0}'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF5B2DAE),
                      foregroundColor: Colors.white,
                    ),
                  )
                ],
              ),
            );
          },
        );
      },
    );
  }
}
