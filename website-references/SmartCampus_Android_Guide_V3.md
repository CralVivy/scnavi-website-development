# Smart Campus Navigation & Accessibility System
## Full Android Implementation Guide V3 — Revised & Complete

**Team Leader:** Bonto, James Rod B.
**Package:** `com.cral.scnavi`
**Platform:** Android (Kotlin + Jetpack Compose)
**Backend:** Firebase (Firestore, Auth, Storage, FCM, Cloud Functions, Realtime DB)
**UI Source:** Google Stitch
**Agent:** Google Antigravity
**Version:** 3.0 — All V2 errors corrected; all 19 sections completed

---

## ⚠️ V3 Correction Log — What Was Wrong in V2 (and in Your `build.gradle.kts`)

| # | Location | Error | Fix Applied |
|---|---|---|---|
| 1 | Your `build.gradle.kts` | `compileSdk { version = release(36) { minorApiLevel = 1 } }` — **invalid Kotlin DSL**; `release()` and `minorApiLevel` do not exist in AGP | Changed to `compileSdk = 36` |
| 2 | Your `build.gradle.kts` | Missing `kotlin { jvmToolchain(11) }` block — JVM target not set anywhere | Added top-level `kotlin { jvmToolchain(11) }` |
| 3 | V2 Guide §2 | `composeOptions { kotlinCompilerExtensionVersion = "1.5.8" }` — **causes a build error** when `alias(libs.plugins.kotlin.compose)` (Kotlin 2.0+) is also present | Block removed entirely |
| 4 | V2 Guide §2 | `compileSdk = 35` / `targetSdk = 35` — out of sync with your actual project targeting SDK 36 | Updated to 36 |
| 5 | V2 Guide §2 | `versionCode = 2` / `versionName = "2.0"` — guide version leaked into app version | Aligned to `versionCode = 1`, `versionName = "1.0"` |
| 6 | V2 Guide §2 | Missing `compileOptions` block — Java 11 source/target compatibility not declared | Added `compileOptions` block |
| 7 | Entire V2 doc | Sections 7–19 listed in Table of Contents but **entirely absent** from the file | All 19 sections now written |
| 8 | V2 Guide §1 | `AI Engine` listed as "ML Kit + Gemini API" — Gemini API is not in the dependency list and adds scope creep; on-device OCR + Cloud Functions is self-contained | Corrected to ML Kit (on-device OCR) + Cloud Functions |

---

## What's New in V2 (preserved for reference)

| Area | V1 | V2 / V3 |
|---|---|---|
| Google Maps Role | Navigation + visual display | **Visual-only campus map viewer** — no GPS, no routing |
| Primary Navigation | Google Maps + Floor Plan UI | **Floor Plan UI is the sole primary navigation system** |
| Building Tap Action | Opens BottomSheet with navigation options | **Opens Floor Plan UI directly** |
| Physical Room Indicators | Not documented | **Fully specified** — IoT color lights outside rooms |
| Green Status Color | Free/Available | **Free/Available OR Upcoming class today** |
| Admin Override | Not documented | **Manual room status override** fully implemented |
| Floor Plan UI Contents | Rooms & basic layout | Explicitly includes room IDs, hallways, classrooms, labs, offices, stairways, facilities |

---

## Table of Contents

1. [Technology Stack & Rationale](#1-technology-stack--rationale)
2. [Android Studio Project Setup](#2-android-studio-project-setup)
3. [Converting Google Stitch UI to Android](#3-converting-google-stitch-ui-to-android)
4. [App Architecture](#4-app-architecture)
5. [Firebase Data Architecture](#5-firebase-data-architecture)
6. [Design System & Theme](#6-design-system--theme)
7. [Feature 1 — Schedule Conflict Detection System](#7-feature-1--schedule-conflict-detection-system)
8. [Feature 2 — Smart Room & Building Status Indicator](#8-feature-2--smart-room--building-status-indicator)
9. [Feature 3 — Today's Campus Events Ticker](#9-feature-3--todays-campus-events-ticker)
10. [Feature 4 — Class Schedule Notification System](#10-feature-4--class-schedule-notification-system)
11. [Feature 5 — Building & Floor Selector](#11-feature-5--building--floor-selector)
12. [Feature 6 — Feedback & Rating System](#12-feature-6--feedback--rating-system)
13. [Feature 7 — Floor Plan Builder](#13-feature-7--floor-plan-builder)
14. [Feature 8 — Class Schedule Integration (COR Upload)](#14-feature-8--class-schedule-integration-cor-upload)
15. [Firebase Security Rules](#15-firebase-security-rules)
16. [Role-Based Access Control](#16-role-based-access-control)
17. [Antigravity Prompting Strategy — V3 Professional Prompts](#17-antigravity-prompting-strategy--v3-professional-prompts)
18. [Testing Strategy](#18-testing-strategy)
19. [Final Implementation Order](#19-final-implementation-order)

---

## 1. Technology Stack & Rationale

### Core Stack

| Layer | Technology | Reason |
|---|---|---|
| Language | Kotlin | Google's first-class Android language; null-safe, concise |
| UI Framework | **Jetpack Compose** | Modern declarative UI; maps directly from Stitch exports |
| Architecture | MVVM + Clean Architecture | Scalable, testable, industry standard |
| Async | Kotlin Coroutines + Flow | Firebase real-time streams map perfectly to Flows |
| Dependency Injection | Hilt | Google-recommended DI; minimal boilerplate |
| Navigation | Navigation Component (Compose) | Type-safe, deep-link friendly |
| Database | Cloud Firestore | Real-time, offline-capable, scales with concurrent users |
| Auth | Firebase Authentication | Role-based; supports Google Sign-In + email/password |
| Push Notifications | Firebase Cloud Messaging (FCM) | Schedule change alerts, emergencies |
| File Storage | Firebase Storage | COR image/PDF uploads, floor plan exports |
| AI Engine | Google ML Kit (on-device OCR) + Cloud Functions | COR text extraction and schedule parsing |
| Cloud Logic | Firebase Cloud Functions | Conflict detection, schedule sync, room status updates |
| Maps | Google Maps SDK for Android | **Visual campus map display only — no routing or GPS** |
| IoT Bridge | Firebase Realtime DB | Physical room indicator light sync (low-latency) |

### V3 Maps Policy — CRITICAL

> Google Maps is integrated **as a visual campus map viewer only** with a custom UI overlay.
> The system **DOES NOT** use:
> - Real-time GPS navigation
> - Route calculation or turn-by-turn directions
> - Live location tracking
> - `play-services-location` dependency
>
> The **Floor Plan UI** is the primary navigation and room reference system.

### Why Kotlin 2.0+ Compose Plugin Matters

Starting with Kotlin 2.0, the Compose Compiler moved into the Kotlin repository:
- `alias(libs.plugins.kotlin.compose)` handles the compiler automatically
- The `composeOptions { kotlinCompilerExtensionVersion = "..." }` block **must be deleted**; including it alongside the new plugin causes a BUILD ERROR
- Compose compiler version always matches the Kotlin version

---

## 2. Android Studio Project Setup

### Step 1 — Create the Project

1. Open **Android Studio Narwhal 2025.1.1 or later**
2. Click **New Project → Empty Activity**
3. Configure:
   - **Name:** `SmartCampusNav`
   - **Package:** `com.cral.scnavi`
   - **Language:** Kotlin
   - **Minimum SDK:** API 26 (Android 8.0)
   - **Build Configuration:** Kotlin DSL (`build.gradle.kts`)
4. Click **Finish**

### Step 2 — Corrected `app/build.gradle.kts`

> ✅ This is the fully corrected version. The errors from your submitted file and from V2 have all been fixed.

```kotlin
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)        // Kotlin 2.0+ Compose Compiler Plugin
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.google.services)       // Firebase
    alias(libs.plugins.firebase.crashlytics)
    id("kotlin-kapt")                         // Required for Hilt annotation processing
}

android {
    namespace = "com.cral.scnavi"
    compileSdk = 36                           // ✅ Simple integer — no block/release() syntax

    defaultConfig {
        applicationId = "com.cral.scnavi"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        manifestPlaceholders["MAPS_API_KEY"] = findProperty("MAPS_API_KEY") ?: ""
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {                           // ✅ Required for Java 11 compatibility
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }

    buildFeatures {
        compose = true
    }

    // ❌ DO NOT include composeOptions block.
    // The kotlin.compose plugin (Kotlin 2.0+) manages the Compose compiler automatically.
    // Adding composeOptions { kotlinCompilerExtensionVersion = "..." } here
    // will cause: "error: Incompatible Kotlin plugin configuration"
}

// ✅ Replaces the deprecated kotlinOptions { jvmTarget = "11" } pattern
kotlin {
    jvmToolchain(11)
}

dependencies {
    // ── Jetpack Compose BOM ────────────────────────────────────────
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.activity.compose)
    debugImplementation(libs.androidx.compose.ui.tooling)

    // ── Navigation ────────────────────────────────────────────────
    implementation(libs.androidx.navigation.compose)
    implementation(libs.hilt.navigation.compose)

    // ── ViewModel & Lifecycle ─────────────────────────────────────
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.androidx.lifecycle.runtime.compose)

    // ── Dependency Injection (Hilt) ───────────────────────────────
    implementation(libs.hilt.android)
    kapt(libs.hilt.android.compiler)

    // ── Firebase BOM ──────────────────────────────────────────────
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.auth.ktx)
    implementation(libs.firebase.firestore.ktx)
    implementation(libs.firebase.storage.ktx)
    implementation(libs.firebase.messaging.ktx)
    implementation(libs.firebase.functions.ktx)
    implementation(libs.firebase.crashlytics)
    implementation(libs.firebase.database.ktx)   // Realtime DB for IoT indicator sync

    // ── Google Maps (VISUAL ONLY — no navigation APIs used) ───────
    implementation(libs.maps.compose)
    implementation(libs.play.services.maps)
    // ❌ Do NOT add play-services-location — it is NOT required

    // ── ML Kit (on-device OCR for COR scanning) ───────────────────
    implementation(libs.mlkit.text.recognition)

    // ── Image Loading ─────────────────────────────────────────────
    implementation(libs.coil.compose)

    // ── PDF Handling (COR PDF text extraction) ────────────────────
    // NOTE: iText 7 Core is AGPL-licensed. Acceptable for academic/non-commercial use.
    implementation(libs.itext7.core)

    // ── Persistent Preferences ────────────────────────────────────
    implementation(libs.androidx.datastore.preferences)

    // ── Coroutines ────────────────────────────────────────────────
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.coroutines.play.services)

    // ── Charts (Admin feedback analytics) ─────────────────────────
    implementation(libs.vico.compose)
    implementation(libs.vico.compose.m3)

    // ── Testing ───────────────────────────────────────────────────
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.turbine)
    androidTestImplementation(libs.androidx.test.ext)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
}
```

### Step 3 — Connect Firebase

1. In Android Studio, go to **Tools → Firebase**
2. Use the Firebase Assistant for: Firestore, Authentication, Cloud Messaging, Storage, and Realtime Database
3. Verify `google-services.json` is in your `/app` directory
4. In Firebase Console, enable the **Blaze (pay-as-you-go) plan** — required for Cloud Functions

### Step 4 — Add Maps API Key

In `local.properties` (never commit this file):
```
MAPS_API_KEY=YOUR_MAPS_API_KEY_HERE
```

In `AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="${MAPS_API_KEY}" />
```

> Enable only the **Maps SDK for Android** in Google Cloud Console. Do NOT enable Directions API, Distance Matrix, or Places API.

---

## 3. Converting Google Stitch UI to Android

### Step 3.1 — Export from Google Stitch

1. Design all screens in Google Stitch
2. Click **Export → React** (preferred) or **Export → HTML/CSS**
3. Optionally: **Export → Figma** for exact spacing, colors, and fonts reference

### Step 3.2 — Extract the Design System

| Token | What to Look For | Where It Goes |
|---|---|---|
| Primary color | Background of buttons/headers | `MaterialTheme.colorScheme.primary` |
| Secondary color | Accent chips, icons | `MaterialTheme.colorScheme.secondary` |
| Background | App background | `MaterialTheme.colorScheme.background` |
| Font family | CSS `font-family` value | `FontFamily` in `Type.kt` |
| Font sizes | `font-size` in px/rem | `TextStyle` sizes in `Type.kt` |
| Corner radius | `border-radius` in CSS | `Shape` definitions in `Shape.kt` |
| Spacing | Padding/margin values | `Dp` constants in `Dimensions.kt` |

### Step 3.3 — Compose Equivalents

```
Stitch Component        →    Compose Equivalent
────────────────────────────────────────────────
<div> container         →    Column / Row / Box
<div> card              →    ElevatedCard { }
<img>                   →    AsyncImage (Coil)
<button>                →    Button / FilledTonalButton / OutlinedButton
<input>                 →    OutlinedTextField
<select>                →    ExposedDropdownMenuBox
<nav> bottom bar        →    NavigationBar
Scrollable list         →    LazyColumn / LazyRow
Overlay / modal         →    Dialog / ModalBottomSheet
Color chips             →    FilterChip
Badge dot               →    BadgedBox
Canvas / draw area      →    Canvas composable
Map view                →    GoogleMap composable (display only)
Floor plan viewer       →    BoxWithConstraints + AsyncImage + overlay Boxes
```

### Step 3.4 — Antigravity Conversion Prompt

```
/plan
I have exported my Google Stitch UI as HTML/CSS.
Convert each screen into a Jetpack Compose @Composable function following MVVM.
Use Material Design 3. Extract design tokens (colors, fonts, shapes) into a
centralized Theme.kt. Name screens exactly:
  LoginScreen, RegisterScreen, SplashScreen,
  DashboardScreen, CampusMapScreen, FloorPlanScreen,
  BuildingFloorSelectorScreen, RoomDetailScreen,
  ScheduleScreen, EventsScreen, NotificationCenterScreen,
  FeedbackScreen, CORUploadScreen,
  ConflictDashboardScreen (admin), FloorPlanBuilderScreen (admin).
Do NOT add navigation logic yet. Do NOT generate mock data.
Use parameter placeholders I will connect to ViewModels later.
Follow the Stitch panel layout exactly for each screen.
```

---

## 4. App Architecture

### Project Folder Structure

```
com.cral.scnavi/
│
├── core/
│   ├── common/           ← Shared utilities, extensions, date helpers
│   ├── data/             ← Base repository interfaces
│   ├── network/          ← Firebase service wrappers
│   └── ui/               ← Shared Compose components (buttons, cards, status dots)
│
├── di/                   ← Hilt modules (FirebaseModule, RepositoryModule)
│
├── feature/
│   ├── auth/
│   │   ├── data/         ← AuthRepository implementation
│   │   ├── domain/       ← LoginUseCase, RegisterUseCase, GetCurrentUserUseCase
│   │   └── ui/           ← LoginScreen, RegisterScreen, SplashScreen, ViewModel
│   │
│   ├── schedule/         ← Features 1, 4, 8
│   │   ├── data/         ← ScheduleRepository, ConflictRepository, CORRepository
│   │   ├── domain/       ← DetectConflictsUseCase, SendNotificationUseCase, ParseCORUseCase
│   │   └── ui/           ← ConflictDashboardScreen, NotificationCenterScreen, CORUploadScreen
│   │
│   ├── map/              ← Features 2, 5
│   │   ├── data/         ← BuildingRepository, RoomStatusRepository
│   │   ├── domain/       ← GetBuildingStatusUseCase, GetFloorPlanUseCase
│   │   └── ui/           ← CampusMapScreen, BuildingFloorSelectorScreen, FloorPlanScreen
│   │
│   ├── events/           ← Feature 3
│   │   ├── data/         ← EventRepository
│   │   ├── domain/       ← GetTodayEventsUseCase
│   │   └── ui/           ← EventsScreen, EventsTicker (shared component)
│   │
│   ├── feedback/         ← Feature 6
│   │   ├── data/         ← FeedbackRepository
│   │   ├── domain/       ← SubmitFeedbackUseCase, GetBuildingRatingsUseCase
│   │   └── ui/           ← FeedbackScreen, AdminFeedbackDashboard
│   │
│   └── floorplan/        ← Feature 7 (admin only)
│       ├── data/         ← FloorPlanRepository
│       ├── domain/       ← SaveFloorPlanUseCase, LinkRoomToScheduleUseCase
│       └── ui/           ← FloorPlanBuilderScreen, FloorPlanCanvas, ToolbarPanel
│
└── ui/
    ├── navigation/       ← NavGraph.kt, Screen.kt (sealed class), route definitions
    └── theme/            ← Theme.kt, Color.kt, Type.kt, Shape.kt, Dimensions.kt
```

### MVVM Data Flow

```
UI (Composable Screen)
        ↕  State / Events (collectAsStateWithLifecycle)
ViewModel (StateFlow, event channels)
        ↕  UseCases
Repository (Interface)
        ↕  Implementation
Firebase (Firestore / Realtime DB / Auth / Storage / FCM / Cloud Functions)
```

### Base UI State Pattern

```kotlin
sealed interface UiState<out T> {
    data object Loading : UiState<Nothing>
    data class Success<T>(val data: T) : UiState<T>
    data class Error(val message: String) : UiState<Nothing>
    data object Empty : UiState<Nothing>
}

@HiltViewModel
class ExampleViewModel @Inject constructor(
    private val useCase: ExampleUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow<UiState<List<Example>>>(UiState.Loading)
    val uiState: StateFlow<UiState<List<Example>>> = _uiState.asStateFlow()

    init { loadData() }

    private fun loadData() {
        viewModelScope.launch {
            useCase().collect { result ->
                _uiState.value = if (result.isEmpty()) UiState.Empty else UiState.Success(result)
            }
        }
    }
}
```

---

## 5. Firebase Data Architecture

### Firestore Collections Structure

```
firestore/
│
├── users/{userId}/
│   ├── role: "student" | "faculty" | "admin" | "visitor"
│   ├── displayName: String
│   ├── email: String
│   ├── enrolledSubjects: [subjectId, ...]
│   └── fcmToken: String
│
├── buildings/{buildingId}/
│   ├── name: String
│   ├── code: String                       ← e.g. "ENG", "MAIN", "CAS"
│   ├── coordinates: GeoPoint
│   ├── totalFloors: Int
│   ├── photoUrl: String
│   ├── averageRating: Double
│   ├── ratingTotal: Double
│   ├── ratingCount: Long
│   └── floors/{floorId}/
│       ├── floorNumber: Int
│       ├── floorName: String              ← "Ground Floor", "2nd Floor"
│       ├── floorPlanUrl: String           ← Firebase Storage rendered PNG
│       ├── floorPlanElements: [...]       ← JSON array (Feature 7 output)
│       └── rooms/{roomId}/
│           ├── name: String
│           ├── roomId: String             ← display ID, e.g. "ENG-101"
│           ├── capacity: Int
│           ├── type: "classroom"|"lab"|"office"|"hallway"|"stairway"|"facility"
│           ├── status: "occupied"|"free"|"reserved"|"default"
│           ├── positionX: Double          ← normalized 0.0–1.0
│           ├── positionY: Double
│           ├── width: Double
│           ├── height: Double
│           ├── physicalIndicatorId: String
│           ├── manualOverrideStatus: String | null
│           ├── manualOverrideBy: String | null
│           └── manualOverrideAt: Timestamp | null
│
├── schedules/{scheduleId}/
│   ├── subjectCode: String
│   ├── subjectName: String
│   ├── instructorId: String
│   ├── roomId: String
│   ├── buildingId: String
│   ├── floorId: String
│   ├── dayOfWeek: ["Mon", "Tue", ...]
│   ├── startTime: Timestamp
│   ├── endTime: Timestamp
│   ├── semester: String
│   ├── schoolYear: String
│   ├── cancelled: Boolean
│   ├── cancelledAt: Timestamp | null
│   └── enrolledStudentIds: [userId, ...]
│
├── conflicts/{conflictId}/
│   ├── type: "room_double_booking"|"instructor_overlap"|"wrong_room"
│   ├── scheduleIds: [scheduleId1, scheduleId2]
│   ├── detectedAt: Timestamp
│   ├── resolvedAt: Timestamp | null
│   ├── resolvedBy: String | null
│   └── status: "unresolved"|"resolved"
│
├── events/{eventId}/
│   ├── title: String
│   ├── description: String
│   ├── category: "Social"|"Food"|"Academic"|"Wellness"|"Arts"|"Sports"
│   ├── startTime: Timestamp
│   ├── endTime: Timestamp
│   ├── location: String
│   └── date: String                       ← "YYYY-MM-DD" for fast equality query
│
├── notifications/{notificationId}/
│   ├── type: "cancellation"|"reschedule"|"room_change"|"holiday"|"emergency"
│   ├── affectedScheduleId: String
│   ├── targetUserIds: [userId, ...]
│   ├── title: String
│   ├── body: String
│   ├── createdAt: Timestamp
│   └── read: Boolean
│
├── feedback/{feedbackId}/
│   ├── userId: String
│   ├── buildingId: String
│   ├── rating: Int                        ← 1–5
│   ├── comment: String
│   ├── submittedAt: Timestamp
│   └── category: "cleanliness"|"accessibility"|"lighting"|"comfort"|"general"
│
└── corUploads/{uploadId}/
    ├── userId: String
    ├── fileUrl: String
    ├── status: "pending"|"processing"|"completed"|"failed"
    ├── uploadedAt: Timestamp
    ├── processedAt: Timestamp | null
    └── extractedSchedule: {...}
```

### Realtime Database — IoT Physical Indicator Sync

```
realtime-db/
└── physicalIndicators/{physicalIndicatorId}/
    ├── roomId: String
    ├── status: "occupied"|"free"|"reserved"|"default"
    └── lastUpdated: ServerTimestamp
```

---

## 6. Design System & Theme

### Color Palette (`ui/theme/Color.kt`)

```kotlin
val CampusBlue      = Color(0xFF1A56A0)
val CampusBlueDark  = Color(0xFF0D3B6E)
val CampusBlueLight = Color(0xFFD6E4F7)

// Room & Building Status Colors — shared by physical indicators AND digital overlays
val StatusOccupied = Color(0xFFD32F2F)   // 🟥 Red   — Active class in progress
val StatusFree     = Color(0xFF388E3C)   // 🟩 Green — Free/Available OR Upcoming today
val StatusReserved = Color(0xFFF57C00)   // 🟨 Amber — Reserved (class within 15–30 min)
val StatusDefault  = Color(0xFFBDBDBD)   // ⚪ Grey  — No scheduled classes today

val SurfaceLight       = Color(0xFFF8F9FA)
val SurfaceDark        = Color(0xFF1C1C1E)
val OnSurfaceVariant   = Color(0xFF6C757D)

// Floor Plan Element Colors
val RoomClassroom  = Color(0xFF1565C0)
val RoomLab        = Color(0xFF2E7D32)
val RoomOffice     = Color(0xFFE65100)
val RoomHallway    = Color(0xFF9E9E9E)
val RoomStairway   = Color(0xFF6A1B9A)
val RoomFacility   = Color(0xFF00838F)

// Event Category Colors
val EventSocial    = Color(0xFF7B1FA2)
val EventFood      = Color(0xFFE65100)
val EventAcademic  = Color(0xFF1565C0)
val EventWellness  = Color(0xFF2E7D32)
val EventArts      = Color(0xFFC62828)
val EventSports    = Color(0xFF00695C)
```

### Unified Color Specification

| Color | Physical Light | Digital Building | Digital Room Badge |
|---|---|---|---|
| 🟥 Red | Class in progress | Current active class location | Occupied |
| 🟩 Green | Class ended / free | Free or upcoming class today | Free / upcoming today |
| 🟨 Yellow | Class starts in 15–30 min | Reserved — starting soon | Reserved |
| ⚪ Grey | No classes today | Default — no schedule | No schedule today |

### `Theme.kt`

```kotlin
@Composable
fun SmartCampusTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) darkColorScheme(
        primary = CampusBlueLight,
        onPrimary = CampusBlueDark,
        surface = SurfaceDark,
        background = Color(0xFF121212)
    ) else lightColorScheme(
        primary = CampusBlue,
        onPrimary = Color.White,
        surface = SurfaceLight,
        background = Color.White,
        secondaryContainer = CampusBlueLight
    )
    MaterialTheme(
        colorScheme = colorScheme,
        typography = CampusTypography,
        shapes = CampusShapes,
        content = content
    )
}
```

---

## 7. Feature 1 — Schedule Conflict Detection System

### Overview

Automatically detects three conflict types in the schedules Firestore collection:
- **Room double-booking** — two classes assigned to the same room at the same time
- **Instructor overlap** — the same instructor assigned to two classes at the same time
- **Wrong room** — a class assigned to a room whose type doesn't match (e.g., lecture in a lab)

Detection runs as a **Cloud Function** triggered on schedule writes. Results are stored in the `conflicts` collection and surfaced in the admin `ConflictDashboardScreen`.

### Data Models

```kotlin
// domain/model/Conflict.kt
data class Conflict(
    val id: String = "",
    val type: ConflictType,
    val scheduleIds: List<String>,
    val detectedAt: Long,
    val resolvedAt: Long? = null,
    val resolvedBy: String? = null,
    val status: ConflictStatus = ConflictStatus.UNRESOLVED
)

enum class ConflictType { ROOM_DOUBLE_BOOKING, INSTRUCTOR_OVERLAP, WRONG_ROOM }
enum class ConflictStatus { UNRESOLVED, RESOLVED }
```

### Repository

```kotlin
// feature/schedule/data/ConflictRepository.kt
interface ConflictRepository {
    fun getUnresolvedConflicts(): Flow<List<Conflict>>
    suspend fun resolveConflict(conflictId: String, resolvedBy: String)
}

class ConflictRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore
) : ConflictRepository {

    override fun getUnresolvedConflicts(): Flow<List<Conflict>> = callbackFlow {
        val listener = firestore.collection("conflicts")
            .whereEqualTo("status", "unresolved")
            .orderBy("detectedAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val conflicts = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(Conflict::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(conflicts)
            }
        awaitClose { listener.remove() }
    }

    override suspend fun resolveConflict(conflictId: String, resolvedBy: String) {
        firestore.collection("conflicts").document(conflictId).update(
            mapOf(
                "status" to "resolved",
                "resolvedAt" to FieldValue.serverTimestamp(),
                "resolvedBy" to resolvedBy
            )
        ).await()
    }
}
```

### ViewModel

```kotlin
@HiltViewModel
class ConflictViewModel @Inject constructor(
    private val getConflicts: GetUnresolvedConflictsUseCase,
    private val resolveConflict: ResolveConflictUseCase
) : ViewModel() {

    val conflicts: StateFlow<UiState<List<Conflict>>> = getConflicts()
        .map { list -> if (list.isEmpty()) UiState.Empty else UiState.Success(list) }
        .catch { emit(UiState.Error(it.message ?: "Unknown error")) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), UiState.Loading)

    fun resolve(conflictId: String, adminId: String) {
        viewModelScope.launch { resolveConflict(conflictId, adminId) }
    }
}
```

### ConflictDashboardScreen (Admin)

```kotlin
@Composable
fun ConflictDashboardScreen(
    viewModel: ConflictViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    val state by viewModel.conflicts.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Schedule Conflicts") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        when (val s = state) {
            is UiState.Loading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            is UiState.Empty -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No unresolved conflicts", style = MaterialTheme.typography.bodyLarge)
            }
            is UiState.Error -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Error: ${s.message}", color = MaterialTheme.colorScheme.error)
            }
            is UiState.Success -> LazyColumn(contentPadding = padding) {
                items(s.data, key = { it.id }) { conflict ->
                    ConflictCard(
                        conflict = conflict,
                        onResolve = { viewModel.resolve(conflict.id, "ADMIN_ID") }
                    )
                }
            }
        }
    }
}

@Composable
private fun ConflictCard(conflict: Conflict, onResolve: () -> Unit) {
    ElevatedCard(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Filled.Warning,
                    contentDescription = null,
                    tint = Color(0xFFD32F2F),
                    modifier = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = conflict.type.name.replace("_", " "),
                    style = MaterialTheme.typography.titleMedium
                )
            }
            Text(
                text = "Involves ${conflict.scheduleIds.size} schedule(s)",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Button(onClick = onResolve, modifier = Modifier.align(Alignment.End)) {
                Text("Mark Resolved")
            }
        }
    }
}
```

### Cloud Function — Conflict Detection (`functions/src/index.ts`)

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
admin.initializeApp();

const db = admin.firestore();

export const detectConflictsOnScheduleWrite = functions.firestore
  .document("schedules/{scheduleId}")
  .onWrite(async (change, context) => {
    const newSchedule = change.after.exists ? change.after.data() : null;
    if (!newSchedule || newSchedule.cancelled) return;

    // Fetch all schedules on the same day/time range
    const snapshot = await db.collection("schedules")
      .where("cancelled", "==", false)
      .where("roomId", "==", newSchedule.roomId)
      .get();

    for (const doc of snapshot.docs) {
      if (doc.id === context.params.scheduleId) continue;
      const existing = doc.data();

      // Check time overlap
      const newStart = newSchedule.startTime.toMillis();
      const newEnd   = newSchedule.endTime.toMillis();
      const exStart  = existing.startTime.toMillis();
      const exEnd    = existing.endTime.toMillis();

      const daysOverlap = newSchedule.dayOfWeek.some(
        (d: string) => existing.dayOfWeek.includes(d)
      );
      const timeOverlap = newStart < exEnd && newEnd > exStart;

      if (daysOverlap && timeOverlap) {
        await db.collection("conflicts").add({
          type: "room_double_booking",
          scheduleIds: [context.params.scheduleId, doc.id],
          detectedAt: admin.firestore.FieldValue.serverTimestamp(),
          status: "unresolved",
          resolvedAt: null,
          resolvedBy: null
        });
      }
    }
  });
```

---

## 8. Feature 2 — Smart Room & Building Status Indicator

### Overview

Two synchronized layers:
1. **Physical** — IoT color lights installed outside each room, driven by Firebase Realtime DB
2. **Digital** — Building color overlays on the campus map + room badges in the Floor Plan UI

Both layers use the unified 4-color scheme defined in §6.

### Room Status Update Cloud Function

```typescript
// Runs every minute via Cloud Scheduler
export const updateRoomStatuses = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();
    const scheduleSnap = await db.collection("schedules")
      .where("cancelled", "==", false)
      .get();

    const roomUpdates: Record<string, string> = {};

    for (const doc of scheduleSnap.docs) {
      const s = doc.data();
      const startMs = s.startTime.toMillis();
      const endMs   = s.endTime.toMillis();
      const nowMs   = now.toMillis();
      const fifteenMin = 15 * 60 * 1000;

      const todayDay = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);
      if (!s.dayOfWeek.includes(todayDay)) continue;

      // Check for manual override first
      const roomDoc = await db
        .collection("buildings").doc(s.buildingId)
        .collection("floors").doc(s.floorId)
        .collection("rooms").doc(s.roomId)
        .get();
      if (roomDoc.data()?.manualOverrideStatus) {
        roomUpdates[s.roomId] = roomDoc.data()!.manualOverrideStatus;
        continue;
      }

      if (nowMs >= startMs && nowMs < endMs) {
        roomUpdates[s.roomId] = "occupied";
      } else if (nowMs >= startMs - fifteenMin && nowMs < startMs) {
        roomUpdates[s.roomId] = "reserved";
      } else if (nowMs >= endMs) {
        roomUpdates[s.roomId] = "free";
      } else {
        roomUpdates[s.roomId] = roomUpdates[s.roomId] ?? "free";
      }
    }

    // Write to Realtime DB for IoT lights
    const rtdb = admin.database();
    const updates: Record<string, object> = {};
    for (const [roomId, status] of Object.entries(roomUpdates)) {
      updates[`physicalIndicators/${roomId}`] = {
        roomId,
        status,
        lastUpdated: admin.database.ServerValue.TIMESTAMP
      };
    }
    await rtdb.ref().update(updates);
  });
```

### Admin Manual Override

```kotlin
// feature/map/data/RoomStatusRepository.kt
suspend fun setManualOverride(
    buildingId: String,
    floorId: String,
    roomId: String,
    status: String,
    adminId: String
) {
    firestore
        .collection("buildings").document(buildingId)
        .collection("floors").document(floorId)
        .collection("rooms").document(roomId)
        .update(mapOf(
            "manualOverrideStatus" to status,
            "manualOverrideBy" to adminId,
            "manualOverrideAt" to FieldValue.serverTimestamp()
        )).await()
}

suspend fun clearManualOverride(buildingId: String, floorId: String, roomId: String) {
    firestore
        .collection("buildings").document(buildingId)
        .collection("floors").document(floorId)
        .collection("rooms").document(roomId)
        .update(mapOf(
            "manualOverrideStatus" to null,
            "manualOverrideBy" to null,
            "manualOverrideAt" to null
        )).await()
}
```

### Room Status Badge Component

```kotlin
// core/ui/RoomStatusBadge.kt
@Composable
fun RoomStatusBadge(status: String, modifier: Modifier = Modifier) {
    val (color, label) = when (status) {
        "occupied" -> StatusOccupied to "Occupied"
        "reserved" -> StatusReserved to "Reserved"
        "free"     -> StatusFree     to "Free"
        else       -> StatusDefault  to "No Schedule"
    }
    Row(
        modifier = modifier,
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color, CircleShape)
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = color
        )
    }
}
```

### Campus Map Screen with Building Color Overlay

```kotlin
@Composable
fun CampusMapScreen(
    viewModel: CampusMapViewModel = hiltViewModel(),
    onBuildingSelected: (String) -> Unit
) {
    val buildings by viewModel.buildings.collectAsStateWithLifecycle()
    val cameraPosition = rememberCameraPositionState {
        // Center on Bicol University Polangui campus
        position = CameraPosition.fromLatLngZoom(LatLng(13.2906, 123.4889), 17f)
    }

    Box(modifier = Modifier.fillMaxSize()) {
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPosition,
            // VISUAL ONLY — no location permissions, no navigation
            properties = MapProperties(isMyLocationEnabled = false),
            uiSettings = MapUiSettings(
                myLocationButtonEnabled = false,
                zoomControlsEnabled = false
            )
        ) {
            buildings.forEach { building ->
                val statusColor = when (building.dominantStatus) {
                    "occupied" -> StatusOccupied
                    "reserved" -> StatusReserved
                    "free"     -> StatusFree
                    else       -> StatusDefault
                }
                Marker(
                    state = MarkerState(
                        position = LatLng(
                            building.coordinates.latitude,
                            building.coordinates.longitude
                        )
                    ),
                    title = building.name,
                    icon = BitmapDescriptorFactory.defaultMarker(
                        when (building.dominantStatus) {
                            "occupied" -> BitmapDescriptorFactory.HUE_RED
                            "reserved" -> BitmapDescriptorFactory.HUE_YELLOW
                            "free"     -> BitmapDescriptorFactory.HUE_GREEN
                            else       -> BitmapDescriptorFactory.HUE_AZURE
                        }
                    ),
                    onClick = {
                        onBuildingSelected(building.id)
                        true
                    }
                )
            }
        }
    }
}
```

---

## 9. Feature 3 — Today's Campus Events Ticker

### Overview

A scrolling ticker banner on the Dashboard and a full filterable list on the Events screen. Events are queried from Firestore by today's date string.

### Data Model

```kotlin
data class CampusEvent(
    val id: String = "",
    val title: String = "",
    val description: String = "",
    val category: EventCategory = EventCategory.ACADEMIC,
    val startTime: Long = 0L,
    val endTime: Long = 0L,
    val location: String = "",
    val date: String = ""            // "YYYY-MM-DD"
)

enum class EventCategory { SOCIAL, FOOD, ACADEMIC, WELLNESS, ARTS, SPORTS }
```

### Repository

```kotlin
class EventRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore
) : EventRepository {

    override fun getTodayEvents(): Flow<List<CampusEvent>> = callbackFlow {
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val listener = firestore.collection("events")
            .whereEqualTo("date", today)
            .orderBy("startTime", Query.Direction.ASCENDING)
            .addSnapshotListener { snap, err ->
                if (err != null) { close(err); return@addSnapshotListener }
                val events = snap?.documents?.mapNotNull { doc ->
                    doc.toObject(CampusEvent::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(events)
            }
        awaitClose { listener.remove() }
    }
}
```

### Auto-Scrolling Ticker Composable

```kotlin
@Composable
fun EventsTicker(events: List<CampusEvent>, modifier: Modifier = Modifier) {
    if (events.isEmpty()) return

    val listState = rememberLazyListState()
    var currentIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(events) {
        while (true) {
            delay(3_000L)
            currentIndex = (currentIndex + 1) % events.size
            listState.animateScrollToItem(currentIndex)
        }
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .height(48.dp),
        colors = CardDefaults.cardColors(containerColor = CampusBlue)
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // "TODAY" label
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .background(CampusBlueDark)
                    .padding(horizontal = 12.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("TODAY", style = MaterialTheme.typography.labelSmall, color = Color.White)
            }
            LazyRow(
                state = listState,
                modifier = Modifier.fillMaxSize(),
                verticalAlignment = Alignment.CenterVertically,
                userScrollEnabled = false
            ) {
                items(events, key = { it.id }) { event ->
                    Text(
                        text = "  •  ${formatTime(event.startTime)}  ${event.title}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White,
                        maxLines = 1,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
            }
        }
    }
}

private fun formatTime(epochMillis: Long): String =
    SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date(epochMillis))
```

### Events Screen

```kotlin
@Composable
fun EventsScreen(viewModel: EventsViewModel = hiltViewModel()) {
    val state by viewModel.events.collectAsStateWithLifecycle()
    val selectedCategory by viewModel.selectedCategory.collectAsStateWithLifecycle()

    Scaffold(
        topBar = { CenterAlignedTopAppBar(title = { Text("Today's Events") }) }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // Category filters
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(vertical = 8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedCategory == null,
                        onClick = { viewModel.selectCategory(null) },
                        label = { Text("All") }
                    )
                }
                items(EventCategory.entries) { category ->
                    FilterChip(
                        selected = selectedCategory == category,
                        onClick = { viewModel.selectCategory(category) },
                        label = { Text(category.name.lowercase().replaceFirstChar { it.uppercase() }) }
                    )
                }
            }

            when (val s = state) {
                is UiState.Loading -> Box(Modifier.fillMaxSize(), Alignment.Center) {
                    CircularProgressIndicator()
                }
                is UiState.Empty -> Box(Modifier.fillMaxSize(), Alignment.Center) {
                    Text("No events today")
                }
                is UiState.Success -> LazyColumn {
                    items(s.data.filter {
                        selectedCategory == null || it.category.name == selectedCategory?.name
                    }, key = { it.id }) { event ->
                        EventListItem(event)
                    }
                }
                is UiState.Error -> Text(s.message, color = MaterialTheme.colorScheme.error)
            }
        }
    }
}
```

---

## 10. Feature 4 — Class Schedule Notification System

### Overview

When schedules are cancelled, rescheduled, or moved, a Cloud Function writes to the `notifications` collection and sends an FCM push notification to all affected students/faculty.

### FCM Token Management

```kotlin
// On user login, update FCM token in Firestore
class FCMTokenManager @Inject constructor(
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth
) {
    suspend fun refreshToken() {
        val token = FirebaseMessaging.getInstance().token.await()
        val uid = auth.currentUser?.uid ?: return
        firestore.collection("users").document(uid)
            .update("fcmToken", token)
            .await()
    }
}
```

### Cloud Function — Send Notifications on Schedule Change

```typescript
export const onScheduleChange = functions.firestore
  .document("schedules/{scheduleId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after  = change.after.data();

    // Determine change type
    let notifType = "";
    let title     = "";
    let body      = "";

    if (!before.cancelled && after.cancelled) {
      notifType = "cancellation";
      title     = `Class Cancelled: ${after.subjectCode}`;
      body      = `Your ${after.subjectName} class has been cancelled.`;
    } else if (before.roomId !== after.roomId) {
      notifType = "room_change";
      title     = `Room Change: ${after.subjectCode}`;
      body      = `Moved to ${after.roomId}.`;
    } else if (before.startTime !== after.startTime) {
      notifType = "reschedule";
      title     = `Rescheduled: ${after.subjectCode}`;
      body      = `New time: ${after.startTime.toDate().toLocaleTimeString()}.`;
    } else {
      return; // No relevant change
    }

    // Fetch FCM tokens for all enrolled students
    const enrolled: string[] = after.enrolledStudentIds ?? [];
    const tokenPromises = enrolled.map((uid: string) =>
      db.collection("users").doc(uid).get().then(d => d.data()?.fcmToken)
    );
    const tokens: string[] = (await Promise.all(tokenPromises)).filter(Boolean);

    if (tokens.length === 0) return;

    // Store notification record
    await db.collection("notifications").add({
      type: notifType,
      affectedScheduleId: context.params.scheduleId,
      targetUserIds: enrolled,
      title,
      body,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      read: false
    });

    // Send FCM multicast
    await admin.messaging().sendEachForMulticast({ tokens, notification: { title, body } });
  });
```

### Notification Center Screen

```kotlin
@Composable
fun NotificationCenterScreen(
    viewModel: NotificationViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    val notifications by viewModel.notifications.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(contentPadding = padding) {
            items(notifications, key = { it.id }) { notif ->
                SwipeToDismissBox(
                    state = rememberSwipeToDismissBoxState(
                        confirmValueChange = {
                            if (it == SwipeToDismissBoxValue.EndToStart) {
                                viewModel.markRead(notif.id)
                                true
                            } else false
                        }
                    ),
                    backgroundContent = {
                        Box(
                            Modifier
                                .fillMaxSize()
                                .background(MaterialTheme.colorScheme.errorContainer)
                                .padding(end = 24.dp),
                            contentAlignment = Alignment.CenterEnd
                        ) {
                            Icon(Icons.Filled.Done, contentDescription = "Dismiss")
                        }
                    }
                ) {
                    NotificationItem(notif)
                }
            }
        }
    }
}
```

---

## 11. Feature 5 — Building & Floor Selector

### Overview

Entry point: user taps a building on the campus map → Floor Selector screen opens → user selects a floor → Floor Plan UI loads showing that floor's rooms with status overlays.

> The Floor Plan UI is the **primary navigation system**. Google Maps is only the campus overview.

### BuildingFloorSelectorScreen

```kotlin
@Composable
fun BuildingFloorSelectorScreen(
    buildingId: String,
    viewModel: BuildingFloorViewModel = hiltViewModel(),
    onFloorSelected: (buildingId: String, floorId: String) -> Unit,
    onBack: () -> Unit
) {
    val building by viewModel.building.collectAsStateWithLifecycle()
    val floors by viewModel.floors.collectAsStateWithLifecycle()

    LaunchedEffect(buildingId) { viewModel.load(buildingId) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(building?.name ?: "Select Floor") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            // Building photo header
            building?.photoUrl?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = building?.name,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(180.dp),
                    contentScale = ContentScale.Crop
                )
            }

            Text(
                text = "Select a floor to view the layout",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(16.dp)
            )

            LazyColumn(contentPadding = PaddingValues(horizontal = 16.dp)) {
                items(floors, key = { it.id }) { floor ->
                    ElevatedCard(
                        onClick = { onFloorSelected(buildingId, floor.id) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp)
                    ) {
                        ListItem(
                            headlineContent = { Text(floor.floorName) },
                            supportingContent = { Text("${floor.roomCount} rooms") },
                            trailingContent = {
                                Icon(
                                    Icons.AutoMirrored.Filled.ArrowForward,
                                    contentDescription = null
                                )
                            }
                        )
                    }
                }
            }
        }
    }
}
```

### FloorPlanScreen — Interactive Room Viewer

```kotlin
@Composable
fun FloorPlanScreen(
    buildingId: String,
    floorId: String,
    viewModel: FloorPlanViewModel = hiltViewModel(),
    onRoomSelected: (roomId: String) -> Unit,
    onBack: () -> Unit
) {
    val floorPlan by viewModel.floorPlan.collectAsStateWithLifecycle()
    val rooms by viewModel.rooms.collectAsStateWithLifecycle()

    LaunchedEffect(buildingId, floorId) { viewModel.load(buildingId, floorId) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text(floorPlan?.floorName ?: "Floor Plan") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        BoxWithConstraints(
            modifier = Modifier
                .padding(padding)
                .fillMaxSize()
        ) {
            val containerWidth  = constraints.maxWidth.toFloat()
            val containerHeight = constraints.maxHeight.toFloat()

            // Floor plan image as background
            floorPlan?.floorPlanUrl?.let { url ->
                AsyncImage(
                    model = url,
                    contentDescription = "Floor Plan",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }

            // Room overlays — normalized positions mapped to actual px
            rooms.forEach { room ->
                val x      = (room.positionX * containerWidth).dp
                val y      = (room.positionY * containerHeight).dp
                val width  = (room.width * containerWidth).dp
                val height = (room.height * containerHeight).dp

                val statusColor = when (room.status) {
                    "occupied" -> StatusOccupied.copy(alpha = 0.6f)
                    "reserved" -> StatusReserved.copy(alpha = 0.6f)
                    "free"     -> StatusFree.copy(alpha = 0.5f)
                    else       -> StatusDefault.copy(alpha = 0.3f)
                }

                Box(
                    modifier = Modifier
                        .absoluteOffset(x = x, y = y)
                        .size(width, height)
                        .background(statusColor, RoundedCornerShape(4.dp))
                        .border(1.dp, statusColor.copy(alpha = 1f), RoundedCornerShape(4.dp))
                        .clickable { onRoomSelected(room.roomId) },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = room.roomId,
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.White,
                        maxLines = 1
                    )
                }
            }
        }
    }
}
```

---

## 12. Feature 6 — Feedback & Rating System

### Data Model

```kotlin
data class Feedback(
    val id: String = "",
    val userId: String = "",
    val buildingId: String = "",
    val rating: Int = 0,
    val comment: String = "",
    val submittedAt: Long = 0L,
    val category: FeedbackCategory = FeedbackCategory.GENERAL
)

enum class FeedbackCategory { CLEANLINESS, ACCESSIBILITY, LIGHTING, COMFORT, GENERAL }
```

### Repository

```kotlin
class FeedbackRepositoryImpl @Inject constructor(
    private val firestore: FirebaseFirestore
) : FeedbackRepository {

    override suspend fun submitFeedback(feedback: Feedback) {
        firestore.collection("feedback").add(feedback).await()
        // Update building's averageRating via Cloud Function (see below)
    }

    override fun getBuildingFeedback(buildingId: String): Flow<List<Feedback>> = callbackFlow {
        val listener = firestore.collection("feedback")
            .whereEqualTo("buildingId", buildingId)
            .orderBy("submittedAt", Query.Direction.DESCENDING)
            .limit(50)
            .addSnapshotListener { snap, err ->
                if (err != null) { close(err); return@addSnapshotListener }
                val items = snap?.documents?.mapNotNull { doc ->
                    doc.toObject(Feedback::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(items)
            }
        awaitClose { listener.remove() }
    }
}
```

### Feedback Screen

```kotlin
@Composable
fun FeedbackScreen(
    buildingId: String,
    viewModel: FeedbackViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    var rating by remember { mutableIntStateOf(0) }
    var comment by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(FeedbackCategory.GENERAL) }
    val submitState by viewModel.submitState.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Rate This Building") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text("Your Rating", style = MaterialTheme.typography.titleMedium)

            // Star rating row
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (1..5).forEach { star ->
                    IconButton(onClick = { rating = star }) {
                        Icon(
                            imageVector = if (star <= rating) Icons.Filled.Star else Icons.Outlined.Star,
                            contentDescription = "$star stars",
                            tint = if (star <= rating) Color(0xFFFFC107)
                                   else MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }
            }

            // Category selector
            Text("Category", style = MaterialTheme.typography.titleMedium)
            LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                items(FeedbackCategory.entries) { category ->
                    FilterChip(
                        selected = selectedCategory == category,
                        onClick = { selectedCategory = category },
                        label = {
                            Text(category.name.lowercase().replaceFirstChar { it.uppercase() })
                        }
                    )
                }
            }

            // Comment
            OutlinedTextField(
                value = comment,
                onValueChange = { comment = it },
                label = { Text("Comment or suggestion") },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(120.dp),
                maxLines = 5
            )

            Button(
                onClick = {
                    viewModel.submit(
                        Feedback(
                            buildingId = buildingId,
                            rating = rating,
                            comment = comment,
                            category = selectedCategory
                        )
                    )
                },
                enabled = rating > 0 && submitState !is UiState.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (submitState is UiState.Loading) CircularProgressIndicator(Modifier.size(20.dp))
                else Text("Submit Feedback")
            }
        }
    }
}
```

### Cloud Function — Update Average Rating

```typescript
export const onFeedbackSubmitted = functions.firestore
  .document("feedback/{feedbackId}")
  .onCreate(async (snap) => {
    const { buildingId, rating } = snap.data();
    const buildingRef = db.collection("buildings").doc(buildingId);
    await db.runTransaction(async (tx) => {
      const buildingDoc = await tx.get(buildingRef);
      const data = buildingDoc.data()!;
      const newTotal = (data.ratingTotal ?? 0) + rating;
      const newCount = (data.ratingCount ?? 0) + 1;
      tx.update(buildingRef, {
        ratingTotal: newTotal,
        ratingCount: newCount,
        averageRating: newTotal / newCount
      });
    });
  });
```

---

## 13. Feature 7 — Floor Plan Builder

### Overview

Admin-only canvas editor. Admins draw rooms as rectangles on a canvas, label them, assign types, and save the result. The saved data populates the rooms subcollection in Firestore and renders as overlays in the Floor Plan Viewer (§11).

### Floor Plan Element Model

```kotlin
data class FloorPlanElement(
    val id: String = UUID.randomUUID().toString(),
    val roomId: String = "",
    val label: String = "",
    val type: RoomType = RoomType.CLASSROOM,
    val x: Float = 0f,       // normalized 0.0–1.0
    val y: Float = 0f,
    val width: Float = 0.1f,
    val height: Float = 0.08f
)

enum class RoomType { CLASSROOM, LAB, OFFICE, HALLWAY, STAIRWAY, FACILITY }
```

### FloorPlanBuilderScreen (Admin)

```kotlin
@Composable
fun FloorPlanBuilderScreen(
    buildingId: String,
    floorId: String,
    viewModel: FloorPlanBuilderViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    val elements by viewModel.elements.collectAsStateWithLifecycle()
    val selectedTool by viewModel.selectedTool.collectAsStateWithLifecycle()
    val isSaving by viewModel.isSaving.collectAsStateWithLifecycle()

    LaunchedEffect(buildingId, floorId) { viewModel.load(buildingId, floorId) }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Floor Plan Builder") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    if (isSaving) CircularProgressIndicator(modifier = Modifier.size(24.dp))
                    else IconButton(onClick = { viewModel.save(buildingId, floorId) }) {
                        Icon(Icons.Filled.Save, contentDescription = "Save")
                    }
                }
            )
        }
    ) { padding ->
        Column(Modifier.padding(padding)) {
            // Toolbar
            FloorPlanToolbar(
                selectedTool = selectedTool,
                onToolSelected = viewModel::selectTool
            )

            // Canvas
            FloorPlanCanvas(
                elements = elements,
                selectedTool = selectedTool,
                onElementAdded = viewModel::addElement,
                onElementMoved = viewModel::moveElement,
                onElementSelected = viewModel::selectElement,
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFFF5F5F5))
            )
        }
    }
}

@Composable
fun FloorPlanCanvas(
    elements: List<FloorPlanElement>,
    selectedTool: BuilderTool,
    onElementAdded: (FloorPlanElement) -> Unit,
    onElementMoved: (String, Float, Float) -> Unit,
    onElementSelected: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var dragStartOffset by remember { mutableStateOf(Offset.Zero) }
    var isDragging by remember { mutableStateOf(false) }

    BoxWithConstraints(modifier = modifier) {
        val w = constraints.maxWidth.toFloat()
        val h = constraints.maxHeight.toFloat()

        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(selectedTool) {
                    detectTapGestures { offset ->
                        if (selectedTool == BuilderTool.DRAW) {
                            onElementAdded(
                                FloorPlanElement(
                                    x = offset.x / w,
                                    y = offset.y / h
                                )
                            )
                        }
                    }
                }
        ) {
            // Draw grid
            val gridSpacing = 40f
            val gridColor = Color(0xFFE0E0E0)
            var gx = 0f
            while (gx < size.width) {
                drawLine(gridColor, Offset(gx, 0f), Offset(gx, size.height), strokeWidth = 1f)
                gx += gridSpacing
            }
            var gy = 0f
            while (gy < size.height) {
                drawLine(gridColor, Offset(0f, gy), Offset(size.width, gy), strokeWidth = 1f)
                gy += gridSpacing
            }
        }

        // Draw each element as a colored Box overlay
        elements.forEach { elem ->
            val roomColor = when (elem.type) {
                RoomType.CLASSROOM -> RoomClassroom
                RoomType.LAB       -> RoomLab
                RoomType.OFFICE    -> RoomOffice
                RoomType.HALLWAY   -> RoomHallway
                RoomType.STAIRWAY  -> RoomStairway
                RoomType.FACILITY  -> RoomFacility
            }
            Box(
                modifier = Modifier
                    .absoluteOffset(x = (elem.x * maxWidth.value).dp, y = (elem.y * maxHeight.value).dp)
                    .size(
                        width  = (elem.width  * maxWidth.value).dp,
                        height = (elem.height * maxHeight.value).dp
                    )
                    .background(roomColor.copy(alpha = 0.7f), RoundedCornerShape(4.dp))
                    .border(2.dp, roomColor, RoundedCornerShape(4.dp))
                    .clickable { onElementSelected(elem.id) },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = elem.label.ifEmpty { elem.roomId },
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.White,
                    maxLines = 1
                )
            }
        }
    }
}

enum class BuilderTool { SELECT, DRAW, ERASE }

@Composable
fun FloorPlanToolbar(selectedTool: BuilderTool, onToolSelected: (BuilderTool) -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.surfaceVariant)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        BuilderTool.entries.forEach { tool ->
            FilterChip(
                selected = selectedTool == tool,
                onClick = { onToolSelected(tool) },
                label = { Text(tool.name.lowercase().replaceFirstChar { it.uppercase() }) }
            )
        }
    }
}
```

### Save Floor Plan to Firestore

```kotlin
// FloorPlanBuilderViewModel
fun save(buildingId: String, floorId: String) {
    viewModelScope.launch {
        _isSaving.value = true
        try {
            val batch = firestore.batch()
            elements.value.forEach { elem ->
                val ref = firestore
                    .collection("buildings").document(buildingId)
                    .collection("floors").document(floorId)
                    .collection("rooms").document(elem.id)
                batch.set(ref, mapOf(
                    "roomId"   to elem.roomId,
                    "name"     to elem.label,
                    "type"     to elem.type.name.lowercase(),
                    "positionX" to elem.x,
                    "positionY" to elem.y,
                    "width"    to elem.width,
                    "height"   to elem.height,
                    "status"   to "default"
                ))
            }
            batch.commit().await()
        } finally {
            _isSaving.value = false
        }
    }
}
```

---

## 14. Feature 8 — Class Schedule Integration (COR Upload)

### Overview

Students upload their Certificate of Registration (COR) — as an image or PDF. The app uses ML Kit on-device OCR to extract text, then a Cloud Function parses the schedule and writes it to the student's account, which is then reflected across the Floor Plan, conflict detection, and notification systems.

### COR Upload Screen

```kotlin
@Composable
fun CORUploadScreen(
    viewModel: CORViewModel = hiltViewModel(),
    onBack: () -> Unit
) {
    val uploadState by viewModel.uploadState.collectAsStateWithLifecycle()
    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        uri?.let { viewModel.processAndUpload(it) }
    }

    Scaffold(
        topBar = {
            CenterAlignedTopAppBar(
                title = { Text("Upload COR") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .padding(padding)
                .padding(24.dp)
                .fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Icon(
                imageVector = Icons.Filled.UploadFile,
                contentDescription = null,
                modifier = Modifier.size(80.dp),
                tint = CampusBlue
            )
            Text(
                "Upload your Certificate of Registration",
                style = MaterialTheme.typography.titleMedium,
                textAlign = TextAlign.Center
            )
            Text(
                "Accepted formats: JPG, PNG, PDF\nYour schedule will be extracted automatically.",
                style = MaterialTheme.typography.bodyMedium,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            when (val s = uploadState) {
                is UiState.Loading -> {
                    CircularProgressIndicator()
                    Text("Processing your COR…", style = MaterialTheme.typography.bodySmall)
                }
                is UiState.Success -> {
                    Icon(Icons.Filled.CheckCircle, contentDescription = null, tint = StatusFree)
                    Text("Schedule successfully imported!", color = StatusFree)
                }
                is UiState.Error -> {
                    Text("Error: ${s.message}", color = MaterialTheme.colorScheme.error)
                    OutlinedButton(onClick = { launcher.launch("*/*") }) { Text("Try Again") }
                }
                else -> {
                    Button(onClick = { launcher.launch("image/* application/pdf") }) {
                        Icon(Icons.Filled.Add, contentDescription = null)
                        Spacer(Modifier.width(8.dp))
                        Text("Choose File")
                    }
                }
            }
        }
    }
}
```

### ViewModel — OCR + Upload

```kotlin
@HiltViewModel
class CORViewModel @Inject constructor(
    private val storage: FirebaseStorage,
    private val firestore: FirebaseFirestore,
    private val auth: FirebaseAuth,
    private val context: Application
) : ViewModel() {

    private val _uploadState = MutableStateFlow<UiState<Unit>>(UiState.Empty)
    val uploadState: StateFlow<UiState<Unit>> = _uploadState.asStateFlow()

    fun processAndUpload(uri: Uri) {
        viewModelScope.launch {
            _uploadState.value = UiState.Loading
            try {
                val uid = auth.currentUser?.uid ?: throw Exception("Not logged in")

                // Step 1: Upload file to Firebase Storage
                val storageRef = storage.reference
                    .child("corUploads/$uid/${System.currentTimeMillis()}")
                storageRef.putFile(uri).await()
                val downloadUrl = storageRef.downloadUrl.await().toString()

                // Step 2: Write pending record to Firestore
                val uploadRef = firestore.collection("corUploads").add(mapOf(
                    "userId"    to uid,
                    "fileUrl"   to downloadUrl,
                    "status"    to "pending",
                    "uploadedAt" to FieldValue.serverTimestamp()
                )).await()

                // Step 3: Run on-device OCR for quick preview
                val inputImage = InputImage.fromFilePath(context, uri)
                val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
                val result = recognizer.process(inputImage).await()

                // Step 4: Update with extracted text for Cloud Function to parse
                uploadRef.update(mapOf(
                    "rawOcrText" to result.text,
                    "status"     to "processing"
                )).await()

                _uploadState.value = UiState.Success(Unit)
            } catch (e: Exception) {
                _uploadState.value = UiState.Error(e.message ?: "Upload failed")
            }
        }
    }
}
```

### Cloud Function — Parse COR Text into Schedule

```typescript
export const parseCOR = functions.firestore
  .document("corUploads/{uploadId}")
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    if (after.status !== "processing" || !after.rawOcrText) return;

    const lines: string[] = (after.rawOcrText as string)
      .split("\n")
      .map((l: string) => l.trim())
      .filter(Boolean);

    // Simple pattern matching for BU COR format
    // Expected line format: "CS 101  Data Structures  MWF  7:30-9:00 AM  ENG-201"
    const scheduleRegex =
      /([A-Z]+\s?\d+[A-Z]?)\s+(.+?)\s+((?:MTH|MWF|MW|TTH|WF|Mon|Tue|Wed|Thu|Fri|Sat)+)\s+(\d+:\d+[AP]M?-\d+:\d+[AP]M?)\s+([A-Z]+-\d+)/i;

    const extractedSchedules = [];
    for (const line of lines) {
      const match = line.match(scheduleRegex);
      if (match) {
        extractedSchedules.push({
          subjectCode: match[1].trim(),
          subjectName: match[2].trim(),
          dayOfWeek:   parseDays(match[3]),
          timeRange:   match[4],
          roomId:      match[5]
        });
      }
    }

    await change.after.ref.update({
      status:            "completed",
      processedAt:       admin.firestore.FieldValue.serverTimestamp(),
      extractedSchedule: extractedSchedules
    });
  });

function parseDays(raw: string): string[] {
  const map: Record<string, string> = {
    M: "Mon", T: "Tue", W: "Wed", H: "Thu", F: "Fri", S: "Sat",
    MTH: ["Mon","Thu"], MWF: ["Mon","Wed","Fri"], MW: ["Mon","Wed"],
    TTH: ["Tue","Thu"], WF: ["Wed","Fri"]
  } as any;
  return (map[raw.toUpperCase()] as string[] | string) instanceof Array
    ? map[raw.toUpperCase()] as string[]
    : [map[raw.toUpperCase()] ?? raw];
}
```

---

## 15. Firebase Security Rules

### Firestore Rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helper functions ──────────────────────────────────────
    function isAuthenticated()  { return request.auth != null; }
    function isAdmin()          { return isAuthenticated() &&
                                   get(/databases/$(database)/documents/users/$(request.auth.uid))
                                     .data.role == 'admin'; }
    function isFaculty()        { return isAuthenticated() &&
                                   get(/databases/$(database)/documents/users/$(request.auth.uid))
                                     .data.role in ['admin', 'faculty']; }
    function isOwner(uid)       { return isAuthenticated() && request.auth.uid == uid; }

    // ── Users ─────────────────────────────────────────────────
    match /users/{userId} {
      allow read:   if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();
    }

    // ── Buildings & Rooms ─────────────────────────────────────
    match /buildings/{buildingId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();

      match /floors/{floorId} {
        allow read: if isAuthenticated();
        allow write: if isAdmin();

        match /rooms/{roomId} {
          allow read: if isAuthenticated();
          // Admin can write all fields; status-only update allowed for Cloud Functions
          allow write: if isAdmin();
        }
      }
    }

    // ── Schedules ─────────────────────────────────────────────
    match /schedules/{scheduleId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if isFaculty();
    }

    // ── Conflicts ─────────────────────────────────────────────
    match /conflicts/{conflictId} {
      allow read: if isAdmin();
      allow update: if isAdmin();    // Resolve
      allow create: if false;        // Written only by Cloud Functions
    }

    // ── Events ────────────────────────────────────────────────
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // ── Notifications ─────────────────────────────────────────
    match /notifications/{notificationId} {
      // Users may only read their own notifications
      allow read: if isAuthenticated() &&
                     request.auth.uid in resource.data.targetUserIds;
      allow update: if isAuthenticated() &&
                       request.auth.uid in resource.data.targetUserIds &&
                       request.resource.data.diff(resource.data).affectedKeys()
                         .hasOnly(['read']);
      allow create, delete: if false;  // Cloud Functions only
    }

    // ── Feedback ──────────────────────────────────────────────
    match /feedback/{feedbackId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // ── COR Uploads ───────────────────────────────────────────
    match /corUploads/{uploadId} {
      allow read:   if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow update: if false;  // Only Cloud Functions update status
      allow delete: if isAdmin();
    }
  }
}
```

### Realtime Database Rules

```json
{
  "rules": {
    "physicalIndicators": {
      ".read":  "auth != null",
      ".write": false
    }
  }
}
```

> Physical indicators are written exclusively by Cloud Functions using the Admin SDK (which bypasses rules). No client may write to the IoT node.

### Firebase Storage Rules

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /corUploads/{userId}/{filename} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /floorPlans/{buildingId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    match /buildings/{buildingId}/{filename} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 16. Role-Based Access Control

### Role Definitions

| Role | Description | Permissions |
|---|---|---|
| `admin` | Facility managers, registrar staff | Full access: schedule CRUD, floor plan builder, conflict resolution, admin override, analytics |
| `faculty` | Instructors | View all schedules; create/update own assigned schedules; receive notifications |
| `student` | Enrolled students | View schedules, events, room statuses; upload COR; submit feedback; receive notifications |
| `visitor` | Unauthenticated or guest | Read-only: campus map, building info, events |

### Role Guard Composable

```kotlin
// core/ui/RoleGuard.kt
@Composable
fun AdminOnly(
    viewModel: AuthViewModel = hiltViewModel(),
    content: @Composable () -> Unit
) {
    val user by viewModel.currentUser.collectAsStateWithLifecycle()
    if (user?.role == "admin") {
        content()
    } else {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                "Admin access required",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}
```

### Navigation Graph with Role Protection

```kotlin
// ui/navigation/NavGraph.kt
@Composable
fun SmartCampusNavGraph(navController: NavHostController) {
    NavHost(navController = navController, startDestination = Screen.Splash.route) {

        composable(Screen.Splash.route) {
            SplashScreen(
                onNavigateToLogin    = { navController.navigate(Screen.Login.route) },
                onNavigateToDashboard = { navController.navigate(Screen.Dashboard.route) }
            )
        }

        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = { navController.navigate(Screen.Dashboard.route) },
                onRegister     = { navController.navigate(Screen.Register.route) }
            )
        }

        composable(Screen.Dashboard.route) {
            DashboardScreen(
                onNavigateToMap    = { navController.navigate(Screen.CampusMap.route) },
                onNavigateToEvents = { navController.navigate(Screen.Events.route) },
                onNavigateToSchedule = { navController.navigate(Screen.Schedule.route) }
            )
        }

        composable(
            Screen.Building.route,
            arguments = listOf(navArgument("buildingId") { type = NavType.StringType })
        ) { backStack ->
            val buildingId = backStack.arguments!!.getString("buildingId")!!
            BuildingFloorSelectorScreen(
                buildingId  = buildingId,
                onFloorSelected = { bId, fId ->
                    navController.navigate(Screen.FloorPlan.createRoute(bId, fId))
                },
                onBack = { navController.popBackStack() }
            )
        }

        composable(
            Screen.FloorPlan.route,
            arguments = listOf(
                navArgument("buildingId") { type = NavType.StringType },
                navArgument("floorId")    { type = NavType.StringType }
            )
        ) { backStack ->
            val buildingId = backStack.arguments!!.getString("buildingId")!!
            val floorId    = backStack.arguments!!.getString("floorId")!!
            FloorPlanScreen(
                buildingId = buildingId,
                floorId    = floorId,
                onRoomSelected = { roomId ->
                    navController.navigate(Screen.RoomDetail.createRoute(roomId))
                },
                onBack = { navController.popBackStack() }
            )
        }

        // Admin-only routes
        composable(Screen.ConflictDashboard.route) {
            AdminOnly {
                ConflictDashboardScreen(onBack = { navController.popBackStack() })
            }
        }

        composable(
            Screen.FloorPlanBuilder.route,
            arguments = listOf(
                navArgument("buildingId") { type = NavType.StringType },
                navArgument("floorId")    { type = NavType.StringType }
            )
        ) { backStack ->
            AdminOnly {
                FloorPlanBuilderScreen(
                    buildingId = backStack.arguments!!.getString("buildingId")!!,
                    floorId    = backStack.arguments!!.getString("floorId")!!,
                    onBack     = { navController.popBackStack() }
                )
            }
        }
    }
}

// Sealed class for type-safe routes
sealed class Screen(val route: String) {
    data object Splash           : Screen("splash")
    data object Login            : Screen("login")
    data object Register         : Screen("register")
    data object Dashboard        : Screen("dashboard")
    data object CampusMap        : Screen("campus_map")
    data object Events           : Screen("events")
    data object Schedule         : Screen("schedule")
    data object Notifications    : Screen("notifications")
    data object Feedback         : Screen("feedback/{buildingId}") {
        fun createRoute(buildingId: String) = "feedback/$buildingId"
    }
    data object CORUpload        : Screen("cor_upload")
    data object Building         : Screen("building/{buildingId}") {
        fun createRoute(buildingId: String) = "building/$buildingId"
    }
    data object FloorPlan        : Screen("floor_plan/{buildingId}/{floorId}") {
        fun createRoute(b: String, f: String) = "floor_plan/$b/$f"
    }
    data object RoomDetail       : Screen("room/{roomId}") {
        fun createRoute(roomId: String) = "room/$roomId"
    }
    data object ConflictDashboard : Screen("admin/conflicts")
    data object FloorPlanBuilder  : Screen("admin/floor_plan_builder/{buildingId}/{floorId}") {
        fun createRoute(b: String, f: String) = "admin/floor_plan_builder/$b/$f"
    }
}
```

---

## 17. Antigravity Prompting Strategy — V3 Professional Prompts

### Architecture-First Approach

Always establish the full architecture context before requesting any code generation. This prevents Antigravity from generating conflicting patterns.

### Prompt 1 — Project Initialization

```
/plan
Initialize a production-grade Android project for a Smart Campus app.

Constraints:
- Package: com.cral.scnavi
- Language: Kotlin 2.0+
- UI: Jetpack Compose + Material 3
- Architecture: MVVM + Clean Architecture + Hilt
- Backend: Firebase (Firestore, Auth, Storage, FCM, Cloud Functions, Realtime DB)
- Maps: Google Maps SDK — VISUAL ONLY. No GPS, no routing, no play-services-location.
- Minimum SDK: 26

Generate:
1. app/build.gradle.kts (compileSdk = 36, NO composeOptions block, kotlin { jvmToolchain(11) })
2. Full folder structure under com.cral.scnavi/
3. Theme.kt, Color.kt, Type.kt, Shape.kt with Bicol University blue (#1A56A0) as primary
4. NavGraph.kt with all 15 screens as composable destinations
5. Base UiState sealed interface
6. Hilt application class

Do NOT generate any feature logic yet. Foundation only.
```

### Prompt 2 — Feature 1: Conflict Detection

```
/code
Implement the Schedule Conflict Detection System for com.cral.scnavi.

Requirements:
- Conflict types: room_double_booking, instructor_overlap, wrong_room
- Detection runs in a Firebase Cloud Function (TypeScript) triggered on schedule write
- Android side: ConflictRepository (Flow), ConflictViewModel (StateFlow), ConflictDashboardScreen
- Admin can mark conflicts as resolved
- Use callbackFlow for Firestore snapshots
- Use UiState<List<Conflict>> with Loading, Success, Empty, Error states
- Admin-only screen; guard with role check from users/{uid}.role

Do NOT use LiveData. Use StateFlow + collectAsStateWithLifecycle only.
```

### Prompt 3 — Feature 2: Room Status Indicator

```
/code
Implement the Smart Room & Building Status Indicator for com.cral.scnavi.

Physical layer:
- Firebase Realtime DB node: physicalIndicators/{id}/status
- Status values: "occupied" | "free" | "reserved" | "default"
- Driven by Cloud Function on schedule (every 1 minute via Cloud Scheduler)

Digital layer:
- Building color markers on Google Maps (visual only — no navigation)
- Room overlay badges in FloorPlanScreen using normalized positions (positionX/Y 0.0–1.0)
- Unified color scheme: Red=occupied, Green=free/upcoming, Yellow=reserved, Grey=default
- Admin manual override: manualOverrideStatus field in rooms subcollection

Android:
- RoomStatusRepository listens to Realtime DB with callbackFlow
- RoomStatusBadge shared composable
- Manual override UI in RoomDetailScreen (admin only)

Do NOT use LiveData. Do NOT use Google Maps routing APIs.
```

### Prompt 4 — Feature 3: Events Ticker

```
/code
Implement the Campus Events Ticker for com.cral.scnavi.

Requirements:
- Firestore collection: events/{id} with fields: title, category, startTime, date ("YYYY-MM-DD")
- Query today's events using whereEqualTo("date", today) — NOT a range query
- Auto-scrolling ticker: LazyRow + animateScrollToItem + 3-second delay in LaunchedEffect
- Category filter chips: Social, Food, Academic, Wellness, Arts, Sports
- Full events list on EventsScreen, ticker banner on DashboardScreen
- Ticker must not block scroll when user interacts with Dashboard

Use callbackFlow for Firestore. Format time with SimpleDateFormat("h:mm a").
```

### Prompt 5 — Feature 7: Floor Plan Builder

```
/code
Implement the Floor Plan Builder for com.cral.scnavi — admin only.

Canvas requirements:
- BoxWithConstraints + Canvas composable for the drawing surface
- Grid overlay drawn with drawLine in Canvas
- Room elements as Box overlays with normalized positions (0.0–1.0)
- Toolbar: SELECT, DRAW, ERASE tools as FilterChip
- Element colors per type: classroom=#1565C0, lab=#2E7D32, office=#E65100,
  hallway=#9E9E9E, stairway=#6A1B9A, facility=#00838F

Save behavior:
- Firestore batch write to buildings/{id}/floors/{id}/rooms/{id}
- Each room has: roomId, name, type, positionX, positionY, width, height, status="default"
- Show save progress via isSaving: StateFlow<Boolean>

Do NOT use external drawing libraries. Canvas composable only.
```

### Prompt 6 — Feature 8: COR Upload

```
/code
Implement COR Upload & Schedule Integration for com.cral.scnavi.

Android (on-device):
- File picker: ActivityResultContracts.GetContent() for "image/* application/pdf"
- Upload to Firebase Storage: corUploads/{uid}/{timestamp}
- Write to corUploads Firestore collection with status="pending"
- ML Kit TextRecognition for on-device OCR (TextRecognizerOptions.DEFAULT_OPTIONS)
- Update Firestore record with rawOcrText and status="processing"

Cloud Function (TypeScript):
- Trigger: onUpdate of corUploads/{uploadId}
- Parse rawOcrText using regex for BU COR format:
  subjectCode, subjectName, dayOfWeek, timeRange, roomId
- Write extractedSchedule array to the upload doc
- Set status="completed"

Do NOT use Gemini API. On-device ML Kit + Cloud Functions only.
```

### Prompt 7 — Security Rules

```
/plan
Write complete Firebase Security Rules for com.cral.scnavi.

Roles stored in users/{uid}.role: "admin" | "faculty" | "student" | "visitor"

Rules required for:
- Firestore: users, buildings (+ floors/rooms subcollections), schedules, conflicts,
  events, notifications, feedback, corUploads
- Realtime DB: physicalIndicators (read: authenticated users, write: false — Cloud Functions only)
- Storage: corUploads/{uid}/* (owner only), floorPlans/* (admin write, all read),
  buildings/* (admin write, all read)

Critical rules:
- Conflicts can only be created by Cloud Functions (allow create: if false)
- Notifications targetUserIds check for read access
- corUploads status can only be updated by Cloud Functions (allow update: if false)
- Physical indicator write must be blocked for all clients
```

---

## 18. Testing Strategy

### Unit Tests — ViewModels

```kotlin
// ConflictViewModelTest.kt
@ExperimentalCoroutinesApi
class ConflictViewModelTest {

    @get:Rule val mainDispatcherRule = MainDispatcherRule()

    private val fakeRepository = FakeConflictRepository()
    private lateinit var viewModel: ConflictViewModel

    @Before
    fun setup() {
        viewModel = ConflictViewModel(
            getConflicts  = GetUnresolvedConflictsUseCase(fakeRepository),
            resolveConflict = ResolveConflictUseCase(fakeRepository)
        )
    }

    @Test
    fun `emits Success when conflicts exist`() = runTest {
        fakeRepository.setConflicts(listOf(TestData.conflict1, TestData.conflict2))
        viewModel.conflicts.test {
            skipItems(1) // Loading
            val state = awaitItem()
            assertIs<UiState.Success<List<Conflict>>>(state)
            assertEquals(2, state.data.size)
        }
    }

    @Test
    fun `emits Empty when no conflicts`() = runTest {
        fakeRepository.setConflicts(emptyList())
        viewModel.conflicts.test {
            skipItems(1)
            assertIs<UiState.Empty>(awaitItem())
        }
    }
}
```

### Integration Tests — Firestore (Firebase Emulator)

```kotlin
// ConflictRepositoryIntegrationTest.kt
@RunWith(AndroidJUnit4::class)
class ConflictRepositoryIntegrationTest {

    private lateinit var firestore: FirebaseFirestore

    @Before
    fun setup() {
        firestore = Firebase.firestore
        firestore.useEmulator("10.0.2.2", 8080)   // Android emulator localhost
    }

    @Test
    fun `getUnresolvedConflicts returns only unresolved`() = runTest {
        // Seed emulator
        firestore.collection("conflicts").add(mapOf(
            "status" to "unresolved",
            "type" to "room_double_booking",
            "scheduleIds" to listOf("s1", "s2"),
            "detectedAt" to System.currentTimeMillis()
        )).await()

        val repo = ConflictRepositoryImpl(firestore)
        repo.getUnresolvedConflicts().first().let { conflicts ->
            assertTrue(conflicts.isNotEmpty())
            assertTrue(conflicts.all { it.status == ConflictStatus.UNRESOLVED })
        }
    }
}
```

### UI Tests — Compose

```kotlin
@RunWith(AndroidJUnit4::class)
class ConflictDashboardTest {

    @get:Rule val composeTestRule = createComposeRule()

    @Test
    fun `shows conflict cards when data loaded`() {
        composeTestRule.setContent {
            SmartCampusTheme {
                ConflictDashboardScreen(
                    viewModel = ConflictViewModel(
                        getConflicts    = { flowOf(listOf(TestData.conflict1)) },
                        resolveConflict = { _, _ -> }
                    ),
                    onBack = {}
                )
            }
        }
        composeTestRule.onNodeWithText("ROOM DOUBLE BOOKING").assertIsDisplayed()
        composeTestRule.onNodeWithText("Mark Resolved").assertIsDisplayed()
    }
}
```

### Test Coverage Targets

| Layer | Target | Tool |
|---|---|---|
| ViewModels | 90% | JUnit 5 + Turbine + MockK |
| UseCases | 95% | JUnit 5 |
| Repositories | 80% | Firebase Emulator Suite |
| Compose UI | Key flows | Compose Testing APIs |
| Cloud Functions | Critical paths | Jest (Node.js) |

### Running Tests

```bash
# Unit tests
./gradlew test

# Instrumented tests (requires device/emulator)
./gradlew connectedAndroidTest

# Firebase Emulator Suite (for integration tests)
firebase emulators:start --only firestore,auth,functions,database,storage

# Cloud Function tests
cd functions && npm test
```

---

## 19. Final Implementation Order

Follow this order strictly. Each phase builds on the previous one.

### Phase 1 — Foundation (Week 1–2)

| Step | Task | Deliverable |
|---|---|---|
| 1.1 | Create Android Studio project with corrected `build.gradle.kts` | Project builds with no errors |
| 1.2 | Connect Firebase (Firestore, Auth, FCM, Storage, Realtime DB) | `google-services.json` in place, Blaze plan active |
| 1.3 | Build Theme, Color, Type, Shape from Stitch exports | `SmartCampusTheme` compiles and previews |
| 1.4 | Create all Composable screen shells (no logic) | All 15 screens exist and compile |
| 1.5 | Set up NavGraph with all routes | Navigation between empty screens works |
| 1.6 | Set up Hilt + AppModule | Hilt compiles, @HiltViewModel works |
| 1.7 | Write `UiState` sealed interface | Shared across all ViewModels |
| 1.8 | Seed Firestore with test buildings, floors, rooms | Data visible in Firebase Console |

### Phase 2 — Core Features (Week 3–5)

| Step | Task | Depends On |
|---|---|---|
| 2.1 | Feature 2: Room status Cloud Function (Scheduler) | Phase 1 complete |
| 2.2 | Feature 2: Campus Map with building status markers | 2.1 |
| 2.3 | Feature 5: Building & Floor Selector screen | 2.2 |
| 2.4 | Feature 5: Floor Plan Viewer with room overlays | 2.3, Firestore room data |
| 2.5 | Feature 3: Events Ticker + EventsScreen | Phase 1 complete |
| 2.6 | Feature 4: FCM token management + notification Cloud Function | Phase 1 complete |
| 2.7 | Feature 4: Notification Center screen | 2.6 |

### Phase 3 — User Features (Week 6–7)

| Step | Task | Depends On |
|---|---|---|
| 3.1 | Feature 6: Feedback & Rating screen + submit Cloud Function | Phase 2 complete |
| 3.2 | Feature 8: COR Upload screen + ML Kit OCR | Phase 1 complete |
| 3.3 | Feature 8: COR parsing Cloud Function | 3.2 |
| 3.4 | Feature 8: Extracted schedule sync to student account | 3.3 |

### Phase 4 — Admin Features (Week 8–9)

| Step | Task | Depends On |
|---|---|---|
| 4.1 | Feature 1: Conflict detection Cloud Function | Schedules in Firestore |
| 4.2 | Feature 1: Conflict Dashboard screen | 4.1 |
| 4.3 | Feature 7: Floor Plan Builder canvas | Phase 2 complete |
| 4.4 | Feature 7: Save floor plan to Firestore | 4.3 |
| 4.5 | Feature 2: Admin manual room override UI | 4.3 |

### Phase 5 — Security, Testing & Hardening (Week 10–11)

| Step | Task | Depends On |
|---|---|---|
| 5.1 | Write all Firebase Security Rules | All features complete |
| 5.2 | Test rules against Firebase Emulator | 5.1 |
| 5.3 | Unit tests for all ViewModels | Phase 2–4 complete |
| 5.4 | Compose UI tests for critical flows | 5.3 |
| 5.5 | End-to-end test: COR upload → schedule conflict → notification | 5.4 |
| 5.6 | Performance: Firestore composite index review | 5.5 |
| 5.7 | ProGuard / R8 rules for release build | 5.6 |

### Phase 6 — Final (Week 12)

| Step | Task |
|---|---|
| 6.1 | Final Stitch UI polish — pixel-perfect alignment check |
| 6.2 | Dark mode testing |
| 6.3 | Accessibility audit (TalkBack, contrast ratios) |
| 6.4 | APK build and install test on physical device |
| 6.5 | Firebase Crashlytics integration check |
| 6.6 | Demo preparation |

### Firestore Composite Indexes Required

Create these in Firebase Console → Firestore → Indexes:

| Collection | Fields | Order |
|---|---|---|
| `schedules` | `cancelled ASC`, `roomId ASC`, `startTime ASC` | For conflict detection queries |
| `schedules` | `enrolledStudentIds ARRAY`, `cancelled ASC` | For student schedule queries |
| `events` | `date ASC`, `startTime ASC` | For today's events query |
| `conflicts` | `status ASC`, `detectedAt DESC` | For unresolved conflicts list |
| `feedback` | `buildingId ASC`, `submittedAt DESC` | For building feedback query |
| `notifications` | `targetUserIds ARRAY`, `createdAt DESC` | For user notifications query |

---

*End of Smart Campus Android Implementation Guide V3*
*Package: `com.cral.scnavi` | Platform: Android (Kotlin + Jetpack Compose) | Backend: Firebase*
