package com.nothing.health;

import android.app.Service;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.content.Context;
import java.util.LinkedList;

public class StepTrackingService extends Service implements SensorEventListener {
    private static final String CHANNEL_ID = "step_tracking";
    private static final int NOTIFICATION_ID = 1001;
    private SensorManager sensorManager;
    private Sensor accelerometer;
    private Sensor stepCounterSensor;
    private Sensor stepDetectorSensor;
    private boolean usingAccelerometer = false;
    private long lastStepTime = 0;
    private static int stepCount = 0; // static so plugin can query
    private float baselineCounter = -1f;

    // Adaptive detector state (mirrors AdvancedStepDetector core principles)
    private static final int WINDOW_SIZE = 50; // ~1s at 50Hz
    private static final double MIN_PEAK_INTERVAL_MS = 300;
    private static final double MIN_THRESHOLD = 0.8; // g units after gravity removal
    private static final double MAX_THRESHOLD = 3.0;
    private static final double THRESHOLD_SENSITIVITY = 0.5;

    private final LinkedList<Double> recentMagnitudes = new LinkedList<>();
    private double dynamicThreshold = 1.2; // start conservative
    private double avgActivity = 0.0;

    public static int getLatestStepCount() { return stepCount; }

    @Override
    public void onCreate() {
        super.onCreate();
        createChannel();
        startForeground(NOTIFICATION_ID, buildNotification("Initializing sensors"));
        sensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
        if (sensorManager != null) {
            // Prefer hardware step sensors
            stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER);
            stepDetectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR);

            boolean registered = false;
            if (stepCounterSensor != null) {
                registered = sensorManager.registerListener(this, stepCounterSensor, SensorManager.SENSOR_DELAY_NORMAL);
            }
            if (stepDetectorSensor != null) {
                // Register detector too (helps latency if counter updates slowly)
                sensorManager.registerListener(this, stepDetectorSensor, SensorManager.SENSOR_DELAY_NORMAL);
            }
            if (!registered && stepCounterSensor == null && stepDetectorSensor == null) {
                // Fallback to accelerometer algorithm
                accelerometer = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
                if (accelerometer != null) {
                    usingAccelerometer = true;
                    sensorManager.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_GAME);
                    updateNotification("Accel fallback");
                } else {
                    updateNotification("No sensors available");
                }
            } else {
                updateNotification("Hardware steps");
            }
        }
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Step Tracking",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Foreground service for continuous step tracking");
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }
    }

    private Notification buildNotification(String status) {
        Notification.Builder builder = new Notification.Builder(this)
                .setContentTitle("Nothing Health")
                .setContentText(status + " • Steps: " + stepCount)
                .setSmallIcon(android.R.drawable.ic_media_play)
                .setOngoing(true);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) builder.setChannelId(CHANNEL_ID);
        return builder.build();
    }

    private void updateNotification(String status) {
        NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(NOTIFICATION_ID, buildNotification(status));
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (sensorManager != null) sensorManager.unregisterListener(this);
    }

    @Override
    public IBinder onBind(Intent intent) { return null; }

    @Override
    public void onSensorChanged(SensorEvent event) {
        int type = event.sensor.getType();
        long now = System.currentTimeMillis();

        if (type == Sensor.TYPE_STEP_COUNTER) {
            float total = event.values[0];
            if (baselineCounter < 0) baselineCounter = total; // first reading sets baseline
            int newCount = (int) (total - baselineCounter);
            if (newCount > stepCount) {
                stepCount = newCount;
                updateNotification("Hardware");
            }
            return;
        }
        if (type == Sensor.TYPE_STEP_DETECTOR) {
            // Each event usually value[0] == 1.0
            stepCount += (int) event.values[0];
            updateNotification("Detector");
            return;
        }
        if (usingAccelerometer && type == Sensor.TYPE_ACCELEROMETER) {
            float x = event.values[0];
            float y = event.values[1];
            float z = event.values[2];
            double mag = Math.sqrt(x*x + y*y + z*z);
            double linMag = Math.abs(mag - SensorManager.STANDARD_GRAVITY);

            recentMagnitudes.add(linMag);
            if (recentMagnitudes.size() > WINDOW_SIZE) recentMagnitudes.removeFirst();
            double sum = 0.0;
            for (double v : recentMagnitudes) sum += v;
            avgActivity = sum / recentMagnitudes.size();
            double target = avgActivity * (1.5 + THRESHOLD_SENSITIVITY * 0.5);
            target = clamp(target, MIN_THRESHOLD, MAX_THRESHOLD);
            dynamicThreshold = 0.9 * dynamicThreshold + 0.1 * target;

            if (linMag > dynamicThreshold && (now - lastStepTime) > MIN_PEAK_INTERVAL_MS) {
                lastStepTime = now;
                stepCount++;
                updateNotification("Accel");
            }
        }
    }

    private double clamp(double v, double min, double max) { return Math.max(min, Math.min(max, v)); }

    @Override
    public void onAccuracyChanged(Sensor sensor, int accuracy) {}
}
