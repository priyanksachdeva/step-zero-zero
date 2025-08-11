# Architecture Documentation

This document provides a comprehensive overview of the Nothing Health Step Zero Zero application architecture, including design decisions, data flow, and technical implementation details.

## Table of Contents

- [High-Level Architecture](#high-level-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Native Android Layer](#native-android-layer)
- [Data Flow](#data-flow)
- [Design Patterns](#design-patterns)
- [Performance Considerations](#performance-considerations)
- [Security Architecture](#security-architecture)
- [Scalability](#scalability)

## High-Level Architecture

### System Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Layer     │    │  Native Bridge  │    │  Android Layer  │
│                 │    │                 │    │                 │
│ React/TypeScript│◄──►│   Capacitor     │◄──►│  Java/Kotlin    │
│ Tailwind CSS    │    │   Plugins       │    │  Android APIs   │
│ PWA Features    │    │                 │    │  Health Connect │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Local Storage  │    │  Plugin Bridge  │    │  Device Sensors │
│  IndexedDB      │    │  Message Bus    │    │  Background     │
│  PWA Cache      │    │                 │    │  Services       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS with custom Nothing design system
- **UI Components**: shadcn/ui for consistent component library
- **State Management**: React hooks with custom persistence layer
- **PWA**: Service Worker for offline functionality

#### Native Bridge

- **Framework**: Capacitor 6 for web-to-native communication
- **Plugins**: Custom plugins for step tracking and Health Connect
- **Build System**: Gradle for Android builds

#### Backend/Native

- **Language**: Java with Kotlin for Health Connect integration
- **Services**: Android foreground services for background tracking
- **Storage**: SQLite and SharedPreferences for native data
- **APIs**: Android Sensor APIs, Health Connect SDK

## Frontend Architecture

### Component Hierarchy

```
App (Root)
├── Providers (Tooltip, Query)
├── Router (React Router)
├── Pages
│   ├── EnhancedIndex (Main App)
│   └── NotFound
└── Global Components
    ├── PWAInstallButton
    ├── Toaster
    └── Sonner
```

### Component Organization

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── layout/                # Layout components
│   │   ├── AppHeader.tsx
│   │   ├── BottomNav.tsx
│   │   └── SettingsOverlay.tsx
│   ├── tabs/                  # Tab-specific components
│   │   ├── HomeTab.tsx
│   │   └── ...
│   └── ...                    # Feature components
├── hooks/                     # Custom React hooks
├── lib/                       # Utilities and helpers
└── pages/                     # Page components
```

### State Management Strategy

#### Local State Pattern

```typescript
// Custom hook for state + persistence
export const usePedometer = () => {
  const [state, setState] = useState<PedometerState>(
    () => loadFromStorage("pedometer") || initialState
  );

  const updateState = useCallback((updates: Partial<PedometerState>) => {
    setState((prev) => {
      const newState = { ...prev, ...updates };
      saveToStorage("pedometer", newState);
      return newState;
    });
  }, []);

  return { state, updateState, ...derivedValues };
};
```

#### Data Persistence

- **LocalStorage**: User preferences and settings
- **IndexedDB**: Large datasets (step history, analytics)
- **SessionStorage**: Temporary UI state
- **PWA Cache**: Static assets and API responses

### UI Architecture

#### Nothing Design System

```typescript
// Design tokens
const tokens = {
  colors: {
    background: "hsl(0 0% 0%)", // Pure black
    foreground: "hsl(0 0% 100%)", // Pure white
    accent: "hsl(0 100% 50%)", // Nothing red
  },
  typography: {
    display: "Ndot47, monospace", // Nothing-inspired font
    mono: "SF Mono, monospace", // Technical text
  },
  spacing: {
    grid: "8px", // 8px grid system
  },
};
```

#### Responsive Design

```css
/* Mobile-first approach */
.container {
  /* Base: Mobile */
  width: 100%;
  max-width: 320px;

  /* Small tablets */
  @media (min-width: 480px) {
    max-width: 400px;
  }

  /* Large tablets */
  @media (min-width: 768px) {
    max-width: 480px;
  }
}
```

## Native Android Layer

### Service Architecture

```
StepTrackingService (Foreground Service)
├── SensorManager Integration
│   ├── TYPE_STEP_COUNTER (preferred)
│   ├── TYPE_STEP_DETECTOR (fallback)
│   └── Accelerometer (last resort)
├── Background Processing
│   ├── Step Detection Algorithm
│   ├── Data Aggregation
│   └── Battery Optimization
└── Notification Management
    ├── Persistent Notification
    ├── Progress Updates
    └── Goal Achievements
```

### Plugin Architecture

```java
// Capacitor Plugin Pattern
@CapacitorPlugin(name = "StepService")
public class StepServicePlugin extends Plugin {

    @PluginMethod
    public void startService(PluginCall call) {
        // Bridge web request to native service
    }

    @PluginMethod
    public void getStepCount(PluginCall call) {
        // Return current step count to web layer
    }
}
```

### Health Connect Integration

```kotlin
// Health Connect Manager
object HealthConnectManager {
    suspend fun isAvailable(context: Context): Boolean =
        HealthConnectClient.getSdkStatus(context) == SDK_AVAILABLE

    suspend fun requestPermissions(activity: ComponentActivity) {
        // Handle Health Connect permissions
    }

    suspend fun aggregateStepsToday(context: Context): Long {
        // Fetch aggregated step data
    }
}
```

## Data Flow

### Step Tracking Flow

```
1. Sensor Event
   ↓
2. Native Processing (StepTrackingService)
   ↓
3. Store in Native Database
   ↓
4. Notify Web Layer (via Plugin)
   ↓
5. Update React State
   ↓
6. Re-render UI Components
   ↓
7. Persist to Local Storage
```

### Health Connect Integration Flow

```
1. User Grants Permission
   ↓
2. Web Layer Requests Data
   ↓
3. Plugin Calls Native Manager
   ↓
4. Native Queries Health Connect
   ↓
5. Aggregate with Local Data
   ↓
6. Return Unified Result
   ↓
7. Update UI with Combined Data
```

### Settings Synchronization

```
Web Settings Change
   ↓
Local Storage Update
   ↓
Plugin Bridge Call
   ↓
Native Service Configuration
   ↓
Sensor Reconfiguration
   ↓
Confirmation to Web Layer
```

## Design Patterns

### Frontend Patterns

#### Composition Pattern

```typescript
// Composable component structure
const MetricCard = ({ icon, label, value, trend }) => (
  <Card>
    <CardHeader>
      <Icon>{icon}</Icon>
      <Label>{label}</Label>
    </CardHeader>
    <CardContent>
      <Value>{value}</Value>
      <Trend direction={trend} />
    </CardContent>
  </Card>
);
```

#### Custom Hooks Pattern

```typescript
// Encapsulate complex logic
export const useStepDetection = () => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(async () => {
    const result = await StepService.startService();
    setIsTracking(result.started);
  }, []);

  return { steps, isTracking, startTracking };
};
```

#### Provider Pattern

```typescript
// Context for global state
const PedometerContext = createContext<PedometerState | null>(null);

export const PedometerProvider = ({ children }) => {
  const pedometerState = usePedometer();
  return (
    <PedometerContext.Provider value={pedometerState}>
      {children}
    </PedometerContext.Provider>
  );
};
```

### Android Patterns

#### Service Pattern

```java
// Foreground service for background processing
public class StepTrackingService extends Service {
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        startForeground(NOTIFICATION_ID, createNotification());
        initializeSensors();
        return START_STICKY; // Restart if killed
    }
}
```

#### Observer Pattern

```java
// Sensor event handling
public class StepDetector implements SensorEventListener {
    private List<StepListener> listeners = new ArrayList<>();

    @Override
    public void onSensorChanged(SensorEvent event) {
        int steps = processEvent(event);
        notifyListeners(steps);
    }

    private void notifyListeners(int steps) {
        listeners.forEach(listener -> listener.onStepDetected(steps));
    }
}
```

#### Factory Pattern

```java
// Sensor factory for different detection methods
public class SensorFactory {
    public static StepDetector createDetector(SensorManager manager) {
        if (hasStepCounter(manager)) {
            return new HardwareStepDetector(manager);
        } else {
            return new AccelerometerStepDetector(manager);
        }
    }
}
```

## Performance Considerations

### Frontend Optimization

#### Component Memoization

```typescript
// Prevent unnecessary re-renders
const StepCounter = memo(({ steps, goal }) => {
  return (
    <div>
      {steps} / {goal}
    </div>
  );
});

// Memoize expensive calculations
const progress = useMemo(() => calculateProgress(steps, goal), [steps, goal]);
```

#### Lazy Loading

```typescript
// Code splitting for better initial load
const AnalyticsDashboard = lazy(
  () => import("./components/AnalyticsDashboard")
);

// Image lazy loading
const ProgressRing = ({ size = 200 }) => (
  <div className="w-[clamp(200px,70vw,320px)]">{/* Responsive sizing */}</div>
);
```

#### Virtual Scrolling

```typescript
// For large datasets (step history)
const VirtualizedStepHistory = ({ data }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <StepEntry data={data[index]} />
    </div>
  );

  return (
    <FixedSizeList height={400} itemCount={data.length} itemSize={60}>
      {Row}
    </FixedSizeList>
  );
};
```

### Android Optimization

#### Battery Optimization

```java
public class StepTrackingService extends Service {
    // Use efficient sensor sampling rates
    private static final int SENSOR_DELAY = SensorManager.SENSOR_DELAY_NORMAL;

    // Batch sensor data processing
    private void processSensorData(SensorEvent event) {
        sensorBuffer.add(event);
        if (sensorBuffer.size() >= BATCH_SIZE) {
            processBatch(sensorBuffer);
            sensorBuffer.clear();
        }
    }
}
```

#### Memory Management

```java
// Proper resource cleanup
@Override
public void onDestroy() {
    if (sensorManager != null) {
        sensorManager.unregisterListener(this);
    }
    if (wakeLock != null && wakeLock.isHeld()) {
        wakeLock.release();
    }
    super.onDestroy();
}
```

### Database Optimization

#### Efficient Queries

```typescript
// Indexed queries for better performance
const getStepsByDateRange = async (startDate: Date, endDate: Date) => {
  return db.steps
    .where("date")
    .between(startDate, endDate)
    .reverse()
    .sortBy("date");
};
```

#### Data Compression

```typescript
// Compress step data for storage
const compressStepData = (data: StepData[]) => {
  return data.map((entry) => ({
    d: entry.date.getTime(), // timestamp
    s: entry.steps, // steps
    c: entry.calories, // calories
  }));
};
```

## Security Architecture

### Data Protection

#### Local Storage Security

```typescript
// Encrypt sensitive data
const encryptData = (data: any): string => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    getEncryptionKey()
  ).toString();
};

const decryptData = (encryptedData: string): any => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, getEncryptionKey());
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};
```

#### Permission Management

```java
// Runtime permission handling
private void requestActivityPermission() {
    if (ContextCompat.checkSelfPermission(this,
            Manifest.permission.ACTIVITY_RECOGNITION)
            != PackageManager.PERMISSION_GRANTED) {

        ActivityCompat.requestPermissions(this,
            new String[]{Manifest.permission.ACTIVITY_RECOGNITION},
            REQUEST_ACTIVITY_PERMISSION);
    }
}
```

### Health Data Privacy

```java
// Health Connect permission scoping
private static final Set<HealthPermission> PERMISSIONS = Set.of(
    HealthPermission.getReadPermission(StepsRecord.class)
    // Only request necessary permissions
);
```

### Network Security

```typescript
// HTTPS enforcement for API calls
const apiClient = axios.create({
  baseURL: "https://api.stepzerozero.app",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Scalability

### Horizontal Scaling

#### Modular Architecture

```
src/
├── features/           # Feature-based modules
│   ├── step-tracking/
│   ├── health-connect/
│   ├── analytics/
│   └── settings/
└── shared/            # Shared utilities
    ├── components/
    ├── hooks/
    └── utils/
```

#### Plugin Architecture

```typescript
// Extensible plugin system
interface HealthPlugin {
  initialize(): Promise<void>;
  getData(): Promise<HealthData>;
  isAvailable(): boolean;
}

class HealthConnectPlugin implements HealthPlugin {
  // Implementation
}

class AppleHealthPlugin implements HealthPlugin {
  // Implementation for future iOS support
}
```

### Vertical Scaling

#### Performance Monitoring

```typescript
// Performance tracking
const performanceMonitor = {
  trackStepDetection: (duration: number) => {
    analytics.track("step_detection_duration", { duration });
  },

  trackBatteryUsage: (percentage: number) => {
    analytics.track("battery_usage", { percentage });
  },
};
```

#### Resource Optimization

```java
// Adaptive resource usage
public class AdaptiveStepDetector {
    private void adjustSamplingRate() {
        int batteryLevel = getBatteryLevel();
        int samplingRate = batteryLevel > 50 ?
            SENSOR_DELAY_NORMAL : SENSOR_DELAY_UI;

        sensorManager.registerListener(this, sensor, samplingRate);
    }
}
```

This architecture provides a solid foundation for the Nothing Health application while maintaining flexibility for future enhancements and scalability requirements.
