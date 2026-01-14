FIFA 15 - EAFC 26 Draft Tool

> An Electron desktop application for creating tournaments and 1v1 matches with friends, using an NBA-style Snake Draft and a database with 228k+ players spanning from FIFA 15 to EAFC 26.

Built with **Electron**, **React**, **TypeScript**, and **Vite** for a modern, performant desktop experience.

---

## 🔍 Overview

This project lets you build squads outside the game and then recreate them on console/PC.

- Turn-based Snake Draft system (NBA-style)
- Supports multiple game versions from FIFA 15 through EAFC 26
- Suitable for both quick 1v1 matches and full tournaments

The goal is to bring the excitement of drafting, trying nostalgic squads, or building "god squads" and then playing those teams locally with your friends.

---

## 🚀 Features

- **Complete player pool** with 228,573 players across FIFA 15–EAFC 26
- **NBA-style Snake Draft** with randomized team order to keep teams balanced
- **Interactive team lineup editor** with drag-and-drop player positioning
- **Draft persistence** - save and resume drafts automatically
- **Advanced filters** by name, position, rating, and game version
- **Performance optimized** - handles massive player database smoothly
- **Cross-platform** - works on Windows, macOS, and Linux

---

## 📦 How to Use

1. Download the latest release from the repository **Releases** page.
2. Install or extract the application for your platform:
   - **Windows:** Run the installer or extract and run the `.exe`
   - **macOS:** Open the `.dmg` and drag to Applications
   - **Linux:** Extract and run the AppImage or `.deb` package
3. Launch the application.
4. Configure your draft:
   - Set number of teams
   - Choose game version (FIFA 15 through EAFC 26)
   - Set squad size per team
5. Start drafting! Teams will pick players in a snake-draft order.
6. Use the team viewer to arrange your squad with formations.
7. Recreate your drafted squads in the actual game and play!

---

## 💻 Running from Source (Developers)

If you want to run the project from source code or contribute to development:

### Prerequisites

- Node.js 18+ and npm
- Git

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
cd REPO_NAME/eafc
```

Install dependencies:

```bash
npm install
```

Run the application in development mode:

```bash
npm start
```

### Building

To create a distributable package:

```bash
npm run make
```

The built application will be in the `out/` directory.

---

## 🤝 Contributing

Pull Requests are welcome! We appreciate bug fixes, new features, performance improvements, and UI enhancements.

For detailed contribution instructions (branch naming, coding style, etc.), please see [CONTRIBUTING.md](CONTRIBUTING.md).

If you are adding new libraries, remember to install them via `npm install <package>` so they're automatically added to `package.json`.

---

## 🛠 Tech Stack

- **Framework:** Electron 39.x
- **UI Library:** React 19
- **Language:** TypeScript 4.5+
- **Build Tool:** Vite 5.x
- **Bundler:** Electron Forge 7.x
- **State Management:** React Hooks (useState, useMemo, useCallback)
- **Data Parsing:** PapaParse (CSV handling)
- **Storage:** electron-store (draft persistence)
- **Styling:** CSS Modules
- **Player Database:** [FIFA 15 - EAFC 26 Dataset](https://www.kaggle.com/datasets/bernardolmedeiros/fifa15-eafc26) (228,573 players)
