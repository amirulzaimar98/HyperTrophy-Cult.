# TwoDay Workout Planner

A minimal, mobile-friendly workout planner for two full-body sessions per week. Includes gym and home exercise alternatives (one 12 kg dumbbell), sets/reps tracking, custom exercises, progress history, a rest timer, and best-effort browser reminders.

## Features

- Full Body A and Full Body B
- Switch between gym and home versions
- Track completed sets, target reps, and optional weight
- Save workout sessions and view recent history
- Add custom exercises to Day A, Day B, or both
- Rest timer with 60, 90, and 120-second presets
- Export saved data as JSON
- Optional browser notifications
- Responsive layout and basic offline caching

## Run locally

You can open `index.html` directly for most features. For service-worker/offline support, run a local static server, for example:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub Pages

1. Create a new repository on GitHub, e.g. `twoday-workout-planner`.
2. Upload `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, and `sw.js` to the repository root.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/ (root)`, then click **Save**.
6. Wait for the published Pages URL to appear. It will usually look like `https://YOUR-USERNAME.github.io/twoday-workout-planner/`.

## Important limitations

- This is a static front-end app; no account, cloud sync, or server database is included.
- Workout data is saved in the browser's local storage on the current device/browser. Use **Export data** for a backup.
- Browser reminders are best-effort and typically require the site to be open. Reliable reminders when the app is closed require platform-specific push notifications and a backend or notification service.
- This starter project does not replace medical advice. Start with a manageable load and use good form.
