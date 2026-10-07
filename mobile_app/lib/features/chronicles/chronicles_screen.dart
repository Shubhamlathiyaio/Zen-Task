import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ChroniclesScreen extends StatelessWidget {
  const ChroniclesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Map<String, dynamic>>>(
      stream: Supabase.instance.client.from('task_history').stream(primaryKey: ['id']).order('completed_at', ascending: false),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        
        if (snapshot.hasError) {
          return Center(child: Text('Error: ${snapshot.error}'));
        }

        final history = snapshot.data ?? [];

        if (history.isEmpty) {
          return const Center(
            child: Text(
              'No history available.\nComplete quests to fill your chronicle.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 18, color: Colors.grey),
            ),
          );
        }

        return ListView.builder(
          padding: const EdgeInsets.all(16),
          itemCount: history.length,
          itemBuilder: (context, index) {
            final entry = history[index];
            final earned = entry['coins_earned'] ?? 0;
            return ListTile(
              leading: const Icon(Icons.history, color: Color(0xFF925CF3)),
              title: Text('Task ID: ${entry['item_id']}'),
              subtitle: Text('Completed at: ${entry['completed_at']}'),
              trailing: Text('+$earned Coins', style: const TextStyle(color: Colors.amber, fontWeight: FontWeight.bold)),
            );
          },
        );
      },
    );
  }
}
