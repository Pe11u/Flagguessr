# Flagguessr 🌍🚩

Flagguessr is a high-performance, premium flag quiz application designed with a focus on modern aesthetics and powerful learning tools. It offers a comprehensive way to master world flags through detailed statistics, multiple game modes, and targeted practice.

## ✨ Key Features

- 🎮 **Multiple Game Modes**:
  - **Flag → Name**: Identify the country from its flag (Multiple Choice or Typing).
  - **Name → Flag**: Choose the correct flag for a given country name.
- 🏆 **6 Difficulty Tiers**:
  - Ranges from **Common Sense** and **Easy** to **Extreme** and the **Demon** tier, which includes unrecognized states, territories, and special regions.
- 📊 **Advanced Statistics Tracking**:
  - Performance is tracked separately for each game mode (Choice, Typing, Guess by Flag).
  - Data is persisted locally using `localStorage`.
- 🌈 **Accuracy-Based Visual Feedback**:
  - The Country/Region List is dynamically color-coded based on your accuracy (0-100%), ranging from deep crimson to bright blue.
- 🔄 **Retry Quiz Mode**:
  - Automatically filter and practice countries you've missed or have a low accuracy rate for.
- 🇯🇵🇬🇧 **Multilingual Support**:
  - Seamlessly toggle between **Japanese** and **English**.
- 💎 **Premium Design**:
  - A state-of-the-art interface featuring Glassmorphism, smooth micro-animations, and a sleek dark theme.

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Run locally**: `npm run dev`
4. **Build for production**: `npm run build`

## 🛠 Technology Stack

- **Framework**: React + Vite
- **Styling**: Modern Vanilla CSS
- **Data Fetching**: Dynamic Wikimedia API integration for up-to-date flag assets.
- **Persistence**: Browser `localStorage` for offline statistics.

## 📄 License

This project is open-source and available under the MIT License.
