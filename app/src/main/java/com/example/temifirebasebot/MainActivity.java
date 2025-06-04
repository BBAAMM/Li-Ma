package com.example.temifirebasebot;

import android.os.Bundle;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.robotemi.sdk.Robot;
import com.robotemi.sdk.listeners.OnRobotReadyListener;

public class MainActivity extends AppCompatActivity implements OnRobotReadyListener {

    private Robot robot;
    private DatabaseReference commandRef;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        robot = Robot.getInstance();

        // Firebase에서 "command" 값 감지
        commandRef = FirebaseDatabase.getInstance().getReference("command");

        commandRef.addValueEventListener(new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                if (!snapshot.exists()) {
                    Log.w("FirebaseCommand", "⚠️ snapshot가 존재하지 않음");
                    return;
                }

                String location = snapshot.getValue(String.class);

                if (location != null && !location.trim().isEmpty()) {
                    Log.d("FirebaseCommand", "📍 받은 명령: " + location);
                    robot.goTo(location);
                } else {
                    Log.w("FirebaseCommand", "⚠️ location 값이 null이거나 비어 있음");
                }
            }

            @Override
            public void onCancelled(@NonNull DatabaseError error) {
                Log.e("FirebaseCommand", "❌ Firebase 데이터 읽기 실패", error.toException());
            }
        }); // ✅ 이 중괄호 안 닫은 게 문제였음
    }

    @Override
    protected void onStart() {
        super.onStart();
        robot.addOnRobotReadyListener(this);
    }

    @Override
    protected void onStop() {
        super.onStop();
        robot.removeOnRobotReadyListener(this);
    }

    @Override
    public void onRobotReady(boolean isReady) {
        if (isReady) {
            Log.d("Temi", "✅ Temi 로봇 준비 완료!");
        }
    }
}
