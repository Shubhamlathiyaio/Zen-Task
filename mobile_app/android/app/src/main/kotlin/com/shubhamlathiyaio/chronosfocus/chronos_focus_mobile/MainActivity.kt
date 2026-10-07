package com.shubhamlathiyaio.chronosfocus.chronos_focus_mobile

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.os.Bundle
import io.flutter.embedding.android.FlutterActivity

class MainActivity : FlutterActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // Create both possible Entrig channel IDs with HIGH importance.
            val channels = listOf(
                NotificationChannel(
                    "entrig_channel",
                    "Entrig Notifications",
                    NotificationManager.IMPORTANCE_HIGH,
                ).apply {
                    description = "Push notifications from Entrig"
                    enableVibration(true)
                    enableLights(true)
                },
                NotificationChannel(
                    "entrig_default",
                    "Entrig Default",
                    NotificationManager.IMPORTANCE_HIGH,
                ).apply {
                    description = "Default Entrig notifications"
                    enableVibration(true)
                    enableLights(true)
                },
            )

            channels.forEach { manager.createNotificationChannel(it) }
        }
    }
}
