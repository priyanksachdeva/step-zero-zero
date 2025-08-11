package com.nothing.health;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.content.Intent;
import android.os.Build;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import com.nothing.health.plugin.StepServicePlugin; // added import

public class MainActivity extends BridgeActivity {
    private static final String STEP_CHANNEL_ID = "step_tracking";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createStepChannel();
        // register custom plugin
        registerPlugin(StepServicePlugin.class);
        // Optionally auto-start service (commented by default)
        // startForegroundServiceCompat();
    }

    private void createStepChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                STEP_CHANNEL_ID,
                "Step Tracking",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Foreground service for continuous step tracking");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }

    private void startForegroundServiceCompat() {
        Intent svc = new Intent(this, StepTrackingService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(svc);
        } else {
            startService(svc);
        }
    }
}
