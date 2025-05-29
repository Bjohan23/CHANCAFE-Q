package com.example.chancafe_q.data.local;

/**
 * Clase preparatoria para futura integración con Room Database
 * Esta clase contendrá la configuración de la base de datos local
 * 
 * TODO: Descomentar cuando se implemente Room
 */

/*
import androidx.room.Database;
import androidx.room.Room;
import androidx.room.RoomDatabase;
import android.content.Context;
import com.example.chancafe_q.data.local.dao.UserDao;
import com.example.chancafe_q.data.local.entity.UserEntity;
import com.example.chancafe_q.utils.Constants;

@Database(
    entities = {UserEntity.class},
    version = Constants.DB_VERSION,
    exportSchema = false
)
public abstract class AppDatabase extends RoomDatabase {
    private static volatile AppDatabase INSTANCE;
    
    public abstract UserDao userDao();
    
    public static AppDatabase getDatabase(Context context) {
        if (INSTANCE == null) {
            synchronized (AppDatabase.class) {
                if (INSTANCE == null) {
                    INSTANCE = Room.databaseBuilder(
                        context.getApplicationContext(),
                        AppDatabase.class,
                        Constants.DB_NAME
                    ).build();
                }
            }
        }
        return INSTANCE;
    }
}
*/

public class AppDatabase {
    // Placeholder class - implementar cuando se añada Room
    private AppDatabase() {
        // Constructor privado para prevenir instanciación
    }
}