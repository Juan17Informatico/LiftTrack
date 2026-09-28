# LiftTrack

LiftTrack is a local-first mobile app for tracking gym workouts. The MVP focuses on the core offline workflow: create routines, add exercises, start a workout, log weight and repetitions, complete sets, finish the workout, and review history.

## Features

- Offline exercise catalog seeded into SQLite.
- Routine creation, editing, ordering, and exercise management.
- Active workout recovery from SQLite after app restarts.
- Workout set logging for weight, repetitions, and completion state.
- Simple rest timer powered by Zustand UI state.
- Workout history with completed exercises and sets.
- Previous performance lookup per exercise.
- Local preferences with MMKV.
- Spanish UI by default, while exercise names remain mostly in English.
- SecureStore wrapper ready for future authentication tokens.

## Tech Stack

- React Native, Expo SDK 54, TypeScript.
- Expo Router for file-based navigation.
- Expo SQLite as the local source of truth.
- Zustand for small global UI state.
- React Query provider prepared for future server state.
- React Hook Form and Zod for validated forms.
- react-native-mmkv for preferences.
- expo-secure-store for future sensitive data.
- lucide-react-native for icons.

## Architecture

The project uses a pragmatic feature-first architecture:

```text
src/
  app/                  File-based routes
  components/           Reusable UI primitives
  database/             SQLite initialization, migrations, seed, repositories
  features/             Feature hooks and components
  hooks/                Shared hooks
  schemas/              Zod schemas
  services/             Platform services such as preferences and SecureStore
  store/                Zustand stores
  types/                Domain and SQLite row types
  utils/                Small shared utilities
```

Screens call feature hooks and repositories. SQLite queries stay inside repository classes.

## Local-First Approach

SQLite is the source of truth for training data. Workouts, routines, exercises, and history do not depend on internet access. UUIDs and timestamps are generated on-device so the data model can later synchronize with Supabase without replacing primary keys.

## Database

The initial schema creates:

- `exercises`
- `routines`
- `routine_exercises`
- `workout_sessions`
- `workout_exercises`
- `workout_sets`
- `migrations`

Foreign keys are enabled and indexed. Migrations are tracked in the `migrations` table, and the exercise seed uses stable UUIDs with `INSERT OR IGNORE` to avoid duplicates.

## Installation

```bash
npm install
```

## Development

```bash
npm run start
npm run android
npm run ios
npm run web
```

Expo Go can run the MVP with the in-memory preferences fallback. Because `react-native-mmkv` is a native dependency, use a development build for full native preference persistence.

## Scripts

```bash
npm run typecheck
npm run lint
npm run format
```

## Architecture Decisions

- SQLite: training logs must persist and work offline with relational integrity.
- Local-first: a missing network connection must never block a workout.
- Zustand: used only for small UI/global state such as active workout id and rest timer.
- Repository Pattern: keeps SQLite details outside React screens and feature components.
- Feature-first: keeps routines, workouts, exercises, and history easy to evolve.
- Supabase later: UUIDs, `created_at`, `updated_at`, and soft-delete columns prepare the app for future sync, auth, and cloud storage.

## Roadmap

- Repository tests and migration tests.
- Better exercise search and filters.
- Personal records and progression hints.
- Volume and consistency statistics.
- Deterministic recommendation engine.
- Supabase Auth and sync queue.
- AI-assisted routine adaptation through backend or edge functions only.

## License

Copyright © 2026 Juan Pablo Campuzano Monsalve.
All rights reserved.

This project is proprietary software. See [LICENSE](./LICENSE)
for more information.