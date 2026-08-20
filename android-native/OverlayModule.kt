package com.amelie.assistantsflottants

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class OverlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "OverlayModule"

    @ReactMethod
    fun checkPermission(promise: Promise) {
        val hasPermission = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Settings.canDrawOverlays(reactApplicationContext)
        } else true
        promise.resolve(hasPermission)
    }

    @ReactMethod
    fun requestPermission() {
        val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${reactApplicationContext.packageName}"))
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(intent)
    }

    @ReactMethod
    fun startOverlay(charactersJson: String) {
        val intent = Intent(reactApplicationContext, OverlayService::class.java)
        intent.putExtra("characters", charactersJson)
        intent.action = "START"
        reactApplicationContext.startForegroundService(intent)
    }

    @ReactMethod
    fun stopOverlay() {
        val intent = Intent(reactApplicationContext, OverlayService::class.java)
        intent.action = "STOP"
        reactApplicationContext.startService(intent)
    }
}
