# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [2.0.0] — 2026-11-16

Complete rewrite of the mobile app.

### Added
- Real backend: the app now uses the Kanban NestJS API (shared with the web app) with secure accounts.
- Login, sign-up and automatic session restore; the token is kept in the iOS Keychain / Android Keystore (`expo-secure-store`).
- Boards list, board screen with column tabs and swipe between columns, task details, subtasks.
- Create, edit and delete boards (with their columns) and tasks (with their subtasks).
- Change a task's status and reorder it within its column (Move up / Move down), with optimistic updates.
- English / French interface, light / dark / system theme, branded app icon and splash screen.
- Accessibility: roles, labels and states on every control, 44 pt touch targets, WCAG AA colours.
- 33 tests (React Native Testing Library + Expo Router), GitHub Actions CI, bilingual README.

### Changed
- JavaScript → TypeScript (strict).
- Expo SDK 51 / React Native 0.73 → Expo SDK 58 / React Native 0.88 / React 19.
- React Navigation stacks → Expo Router (file-based routes, protected routes).
- Local `useState` + axios → Redux Toolkit Query (caching, optimistic updates).

### Removed
- Placeholder API URLs (`http://your-backend-url`), the web-only `react-dnd` libraries, the removed `Picker` import, and unused screens and components.

## [1.0.0] — 2024

- First prototype with Expo 51 (login, sign-up and task screens, no working backend).
