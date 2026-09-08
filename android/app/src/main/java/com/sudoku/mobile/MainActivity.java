package com.sudoku.mobile;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import com.getcapacitor.BridgeActivity;
import com.google.android.gms.ads.MobileAds;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Inicializamos AdMob con retardo para no pisar el arranque de Phaser/WebView
        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            try {
                MobileAds.initialize(getApplicationContext(), initializationStatus -> {});
            } catch (Exception e) {
                e.printStackTrace();
            }
        }, 1000);
    }
}