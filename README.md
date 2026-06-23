# Music Player React

A modern, high-performance music player web application featuring a premium "Liquid Glass" UI. Built with React 19, Tailwind CSS 4, and Framer Motion for a seamless, immersive experience.

## ✨ Features

### 🎵 Advanced Playback
- **Web Audio API Engine**: Custom-built audio hook for precise control.
- **Queue Management**: Add to queue, play next, and reorder tracks.
- **Gapless Playback**: Preloading and optimized buffer management.
- **Media Session API**: Control playback from your keyboard or lock screen.
- **Playback Speed**: Adjustable speeds (0.5x, 1x, 1.5x, 2x).

### 🎨 Visual Experience
- **Liquid Glass UI**: Stunning glassmorphism design with vibrant, dynamic gradients.
- **Audio Visualizer**: Real-time frequency analysis with a rainbow spectrum effect (Mobile).
- **Dynamic Themes**: UI colors adapt to the current song's artwork.
- **3D Tilt Effects**: Interactive hover states on album cards.
- **Skeleton Loading**: Polished loading states with shimmer effects.

### 📱 Responsive & Native-Like
- **PWA Ready**: Installable on mobile and desktop as a native app.
- **Mobile Dock**: Apple-style floating navigation bar.
- **Touch Gestures**: Swipe down to close player, drag to seek.

### 🛠️ Utilities
- **Equalizer**: 3-band equalizer with presets (Rock, Pop, Bass Boost, etc.).
- **Real-time Lyrics**: Synced lyrics with auto-scrolling.
- **Keyboard Shortcuts**: Space (Play/Pause), Arrows (Seek/Skip), M (Mute).
- **Search**: Fuzzy search for songs, artists, and albums.
- **Listening History**: Tracks recently played songs.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Context & Reducers
- **Audio**: Web Audio API

## 🚀 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `src/components`: UI building blocks (Player, Visualizer, Equalizer)
- `src/pages`: Main view components (Home, Search, Library)
- `src/context`: Global state (Music, Auth)
- `src/hooks`: Custom hooks (`useAudio`)
- `src/utils`: Helper functions and API proxies

## ⚡ Performance

- **Optimized Rendering**: Decoupled playback time updates to ensure 60fps animations.
- **Lazy Loading**: Route-based code splitting.
- **GPU Acceleration**: Heavy animations use `will-change` and `transform` for smoothness.

## 📜 License

This project is licensed under the MIT License.
