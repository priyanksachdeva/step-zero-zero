package com.nothing.health.health

import androidx.activity.ComponentActivity
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord

interface StepPermissionCallback {
    fun onResult(granted: Boolean)
}

object StepPermissionHelper {
    private val stepPermissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class)
    )

    fun request(activity: ComponentActivity, callback: StepPermissionCallback) {
        // Unique key each time to avoid Already registered exception
        val key = "hc-perm-" + System.currentTimeMillis()
        val launcher = activity.activityResultRegistry.register(
            key,
            PermissionController.createRequestPermissionResultContract()
        ) { granted ->
            val ok = granted.containsAll(stepPermissions)
            callback.onResult(ok)
        }
        launcher.launch(stepPermissions)
    }
}
