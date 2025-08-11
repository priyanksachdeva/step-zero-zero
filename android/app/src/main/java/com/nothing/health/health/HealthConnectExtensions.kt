package com.nothing.health.health

import android.content.Context
import kotlinx.coroutines.runBlocking

// Synchronous bridge helpers for Java plugin (blocks a background thread)
fun stepsTodaySync(context: Context): Long = runBlocking { HealthConnectManager.stepsToday(context) }
