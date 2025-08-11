package com.nothing.health.plugin;

import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.nothing.health.StepTrackingService;
import com.nothing.health.health.HealthConnectManager;
import com.nothing.health.health.StepPermissionHelper; // new helper
import com.nothing.health.health.StepPermissionCallback; // callback interface

import android.os.Handler;
import android.os.Looper;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "StepService", permissions = {
        @Permission(strings = { "android.permission.ACTIVITY_RECOGNITION" }, alias = "activity")
})
public class StepServicePlugin extends Plugin {

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private final java.util.concurrent.Executor io = Executors.newSingleThreadExecutor();

    private PluginCall pendingHealthPermCall;

    @Override
    public void load() {
        super.load();
    }

    @PluginMethod
    public void requestHealthPermissions(PluginCall call) {
        if (!HealthConnectManager.INSTANCE.isAvailable(getContext())) {
            JSObject ret = new JSObject();
            ret.put("available", false);
            ret.put("granted", false);
            call.resolve(ret);
            return;
        }
        if (pendingHealthPermCall != null) {
            JSObject ret = new JSObject();
            ret.put("error", "Permission request already in progress");
            call.resolve(ret);
            return;
        }
        pendingHealthPermCall = call;
        mainHandler.post(() -> {
            try {
                StepPermissionHelper.INSTANCE.request(getActivity(), granted -> {
                    if (pendingHealthPermCall != null) {
                        JSObject result = new JSObject();
                        result.put("available", true);
                        result.put("granted", granted);
                        pendingHealthPermCall.resolve(result);
                        pendingHealthPermCall = null;
                    }
                });
            } catch (Exception e) {
                JSObject result = new JSObject();
                result.put("error", e.getMessage());
                call.resolve(result);
                pendingHealthPermCall = null;
            }
        });
    }

    @PluginMethod
    public void startService(PluginCall call) {
        Intent intent = new Intent(getContext(), StepTrackingService.class);
        getContext().startForegroundService(intent);
        JSObject ret = new JSObject();
        ret.put("started", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void stopService(PluginCall call) {
        Intent intent = new Intent(getContext(), StepTrackingService.class);
        getContext().stopService(intent);
        JSObject ret = new JSObject();
        ret.put("stopped", true);
        call.resolve(ret);
    }

    @PluginMethod
    public void getStepCount(PluginCall call) {
        int steps = StepTrackingService.getLatestStepCount();
        JSObject ret = new JSObject();
        ret.put("steps", steps);
        call.resolve(ret);
    }

    @PluginMethod
    public void isHealthConnectAvailable(PluginCall call) {
        boolean avail = HealthConnectManager.INSTANCE.isAvailable(getContext());
        JSObject ret = new JSObject();
        ret.put("available", avail);
        call.resolve(ret);
    }

    @PluginMethod
    public void getHealthStepsToday(PluginCall call) {
        if (!HealthConnectManager.INSTANCE.isAvailable(getContext())) {
            JSObject ret = new JSObject();
            ret.put("steps", 0);
            ret.put("available", false);
            call.resolve(ret);
            return;
        }
        io.execute(() -> {
            try {
                long steps = com.nothing.health.health.HealthConnectExtensionsKt.stepsTodaySync(getContext());
                JSObject ret = new JSObject();
                ret.put("steps", steps);
                ret.put("available", true);
                call.resolve(ret);
            } catch (Exception e) {
                JSObject ret = new JSObject();
                ret.put("steps", 0);
                ret.put("error", e.getMessage());
                call.resolve(ret);
            }
        });
    }
}
