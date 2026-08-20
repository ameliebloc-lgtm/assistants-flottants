package com.amelie.assistantsflottants

import android.app.*
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.os.Build
import android.os.IBinder
import android.view.*
import android.widget.TextView
import android.widget.Toast
import androidx.core.app.NotificationCompat
import org.json.JSONArray

class OverlayService : Service() {
    private lateinit var windowManager: WindowManager
    private val bubbles = mutableListOf<View>()

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (intent?.action == "STOP") {
            removeAllBubbles()
            stopSelf()
            return START_NOT_STICKY
        }

        startForeground(1, buildNotification())
        windowManager = getSystemService(WINDOW_SERVICE) as WindowManager

        val charactersJson = intent?.getStringExtra("characters") ?: "[]"
        val characters = JSONArray(charactersJson)

        for (i in 0 until characters.length()) {
            val char = characters.getJSONObject(i)
            createBubble(char.getString("emoji"), char.getString("name"), i)
        }

        return START_STICKY
    }

    private fun createBubble(emoji: String, name: String, index: Int) {
        val bubble = TextView(this).apply {
            text = emoji
            textSize = 32f
            setBackgroundColor(Color.parseColor("#3300ff88"))
            setPadding(20, 20, 20, 20)
        }

        val params = WindowManager.LayoutParams(
            150, 150,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY else WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.TOP or Gravity.START
        params.x = (100 * index) % 800
        params.y = 200 + (300 * (index % 3))

        var initialX = 0; var initialY = 0; var touchX = 0f; var touchY = 0f

        bubble.setOnTouchListener { _, event ->
            when (event.action) {
                MotionEvent.ACTION_DOWN -> {
                    initialX = params.x; initialY = params.y
                    touchX = event.rawX; touchY = event.rawY
                    true
                }
                MotionEvent.ACTION_MOVE -> {
                    params.x = initialX + (event.rawX - touchX).toInt()
                    params.y = initialY + (event.rawY - touchY).toInt()
                    windowManager.updateViewLayout(bubble, params)
                    true
                }
                MotionEvent.ACTION_UP -> {
                    if (Math.abs(event.rawX - touchX) < 10 && Math.abs(event.rawY - touchY) < 10) {
                        Toast.makeText(this, "$name: Salut ! 👋", Toast.LENGTH_SHORT).show()
                    }
                    true
                }
                else -> false
            }
        }

        windowManager.addView(bubble, params)
        bubbles.add(bubble)
    }

    private fun removeAllBubbles() {
        bubbles.forEach { windowManager.removeView(it) }
        bubbles.clear()
    }

    private fun buildNotification(): Notification {
        val channelId = "overlay_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(channelId, "Assistants Actifs", NotificationManager.IMPORTANCE_LOW)
            (getSystemService(NOTIFICATION_SERVICE) as NotificationManager).createNotificationChannel(channel)
        }
        return NotificationCompat.Builder(this, channelId)
            .setContentTitle("Assistants Virtuels actifs")
            .setContentText("Vos assistants flottent sur votre écran")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        removeAllBubbles()
    }
}
