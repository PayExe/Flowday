# Flowday

Flowday is a personal planning mobile application built with React Native and Expo.

> Portfolio and learning project: this repository shows my journey, experiments, and progress with React Native. It is not a commercial application or a finished product.

This project was created primarily for learning. It helped me practice mobile navigation, state management, reusable components, light and dark themes, and iOS-inspired interface design.

## Status

Flowday is an experimental and incomplete application. It still contains bugs, and some parts may change or not work as expected.

I am sharing it as a record of my learning process, not as a production-ready application.

## Features

- Daily planning with life blocks
- Weekly planning and daily timeline
- Tasks with priorities and progress tracking
- Daily score and streak tracking
- Morning and evening rituals
- Focus mode with a timer
- Light and dark themes
- Local device storage

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (v22+)
- [Expo Go](https://expo.dev/go) installed on your iPhone or Android device
- A free [Expo account](https://expo.dev/signup)

### Setup

```bash
# 1. Clone the project
git clone <repo-url>
cd Flowday

# 2. Install dependencies
npm install

# 3. Start the development server
npx expo start
```

### Opening the app

- **Web**: press `w` in the terminal
- **iOS / Android**: scan the QR code with Expo Go

#### Important — Expo login is required

Expo Go for SDK 57 requires you to be logged in on **both** the terminal and the app with the same free Expo account:

```bash
npx expo login     # log in on your terminal
```

Then open Expo Go on your phone, tap the avatar icon in the top-right corner, and log in with the **same account**. Once both sides are authenticated, scan the QR code and the app will load.

> You don't need the original project owner's account — any free Expo account works for local development.

## Technologies

- React Native
- Expo SDK 57
- Expo Router
- TypeScript
- Zustand
- AsyncStorage
- Reanimated

## Learning Resources

This project was built progressively using tutorials, documentation, and a lot of experimentation:

- [Video tutorial](https://youtu.be/m1-bc53EGh8?si=xLnjeSeY1BLpS7Zs)
- [Expo documentation](https://docs.expo.dev/)

The architecture and design decisions are not all final. Part of the project's purpose is to show how it evolves throughout the learning process.

## License

This project is distributed under the [MIT License](LICENSE).
