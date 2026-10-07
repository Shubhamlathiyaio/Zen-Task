import 'package:flutter/material.dart';

class FocusScreen extends StatelessWidget {
  const FocusScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.timer, size: 80, color: Color(0xFF925CF3)),
          SizedBox(height: 20),
          Text(
            '25:00',
            style: TextStyle(fontSize: 64, fontWeight: FontWeight.bold),
          ),
          SizedBox(height: 10),
          Text(
            'Ready to focus?',
            style: TextStyle(fontSize: 18, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
