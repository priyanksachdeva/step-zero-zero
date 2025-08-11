package com.nothing.health.health

import android.content.Context
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.PermissionController
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.time.TimeRangeFilter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

object HealthConnectManager {
    private val stepPermissions = setOf(
        HealthPermission.getReadPermission(StepsRecord::class)
    )

    // Updated availability check using getSdkStatus (isAvailable not in this version)
    fun isAvailable(context: Context): Boolean =
        HealthConnectClient.getSdkStatus(context) == HealthConnectClient.SDK_AVAILABLE

    suspend fun hasPermissions(context: Context): Boolean {
        if (!isAvailable(context)) return false
        val client = HealthConnectClient.getOrCreate(context)
        val granted = client.permissionController.getGrantedPermissions()
        return granted.containsAll(stepPermissions)
    }

    suspend fun requestPermissions(activity: androidx.activity.ComponentActivity): Boolean {
        if (!isAvailable(activity)) return false
        val request = activity.registerForActivityResult(PermissionController.createRequestPermissionResultContract()) { /* no-op */ }
        request.launch(stepPermissions)
        return true
    }

    suspend fun stepsToday(context: Context): Long = withContext(Dispatchers.IO) {
        if (!isAvailable(context)) return@withContext 0L
        val client = HealthConnectClient.getOrCreate(context)
        val zone = ZoneId.systemDefault()
        val start = ZonedDateTime.now(zone).toLocalDate().atStartOfDay(zone).toInstant()
        val end = Instant.now()
        val response = client.aggregate(
            AggregateRequest(
                metrics = setOf(StepsRecord.COUNT_TOTAL),
                timeRangeFilter = TimeRangeFilter.between(start, end)
            )
        )
        response[StepsRecord.COUNT_TOTAL] ?: 0L
    }
}
