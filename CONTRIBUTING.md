# Contributing to FIFA 15 - EAFC 26 Draft Tool

Thank you for considering contributing to this project! Any help is appreciated — from small fixes to new features and improvements.

---

## 📚 Ways You Can Help

- **Bug fixes:** Find and fix issues in the app, UI, or performance.
- **New features:** Propose and implement improvements to the draft flow, filters, team viewer, etc.
- **Performance optimizations:** Help optimize rendering, data handling, or memory usage.
- **UI/UX improvements:** Enhance the interface, add animations, or improve usability.
- **Documentation:** Improve this README, add examples, or clarify setup steps.
- **Testing:** Test the app on different platforms and report issues.

If you are not sure where to start, feel free to open an issue and ask.

---

## 🧩 Development Setup

1. **Fork** this repository to your GitHub account.
2. **Clone** your fork:

   ```bash
   git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
   cd REPO_NAME/eafc
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Run the application in development mode:

   ```bash
   npm start
   ```

   This will start the Electron app with hot-reloading enabled.

5. Make your changes and test them. The app will automatically reload when you save files.

---

## 🌿 Git Workflow

We recommend the following basic workflow:

1. **Create a branch** from `main` 

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. Make your changes and test them locally.

3. **Commit** with a clear and concise message:

   ```bash
   git commit -m "Add my new feature"
   ```

4. **Push** your branch to your fork:

   ```bash
   git push origin feature/my-new-feature
   ```

5. Open a **Pull Request** from your branch to this repository.

Please describe **what** you changed and **why** in the PR description. Screenshots or GIFs are very helpful for UI changes.

---

## 🧪 Testing

If there are tests available in the project, please run them before opening a Pull Request. If not, at least make sure the application runs correctly for the main flows you touched.

---

## 📦 Dependencies

- Try to avoid adding heavy or unnecessary dependencies.
- If you add a new library, install it via npm:
  ```bash
  npm install <package-name>
  npm install --save-dev <dev-package-name>  # for dev dependencies
  ```
  This automatically updates `package.json`.
- Prefer well-maintained, widely used packages when possible.
- Check bundle size impact for client-side dependencies

1. **Run the app** and test your changes thoroughly:
   ```bash
   npm start
   ```

2. **Build the app** to ensure it packages correctly:
   ```bash
   npm run make
   ```

3. **Test key flows:**
   - Starting a new draft
   - Drafting players
   - Using filters and search
   - Arranging teams in the team viewer
   - Saving and restoring drafts

4. *� Code Style

This project uses TypeScript and follows these conventions:

- **TypeScript:** Use proper type annotations. Avoid `any` when possible.
- **React:** Use functional components with hooks.
- **CSS Modules:** Component styles are in `.module.css` files.
- **Naming:**
  - Components: PascalCase (`PlayerList.tsx`)
  - Files: PascalCase for components, camelCase for utilities
  - CSS classes: camelCase
- **Performance:** Use `React.memo`, `useMemo`, and `useCallback` appropriately for expensive operations.

## 🏗 Project Structure

```
eafc/
├── src/
│   ├── components/      # React components
│   │   ├── draft/       # Draft-related components
│   │   ├── modals/      # Modal dialogs
│   │   └── common/      # Reusable UI components
│   ├── hooks/           # Custom React hooks
│   ├── services/        # Business logic (draft engine, lineup service)
│   ├── constants/       # Constants (formations, versions)
│   └── types.ts         # TypeScript type definitions
├── public/              # Static assets (player database CSV)
└── forge.config.ts      # Electron Forge configuration
```slations:

- Identify where strings are defined (e.g., in the GUI code or a dedicated i18n module, if any).
- Propose a structure for handling multiple languages (e.g., dictionaries, JSON, gettext, etc.) if one does not already exist.
- Start by translating the most visible user-facing texts (menus, buttons, main messages).

You can also open an issue to discuss the best approach before starting.

---

## 💬 Questions & Support

If you have any questions about the contribution process or are unsure how to implement something, feel free to:

- Open an **issue** describing your question, or
- Comment on an existing issue/PR related to the topic.

Thank you again for helping improve this project! 🙌
