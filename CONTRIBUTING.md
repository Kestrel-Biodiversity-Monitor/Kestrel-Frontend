# Contributing to KESTREL Frontend

First off, thank you for considering contributing to KESTREL! It's people like you that make KESTREL such a great platform for biodiversity monitoring and ecological reporting. 

We welcome any contributions, whether it's fixing bugs, improving documentation, designing new features, or optimizing performance.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v20 or higher)
- [Git](https://git-scm.com/)

*Note: You will also likely need the [KESTREL Backend](https://github.com/Kestrel-Biodiversity-Monitor/kestrel-backend) running locally to interact fully with the application.*

### Installation & Local Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/kestrel-frontend.git
   cd kestrel-frontend
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Setup**:
   Copy the example environment file and adjust if necessary:
   ```bash
   cp .env.example .env.local
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Development Workflow

### 1. Create a Branch

Always create a new branch for your work. Keep branch names descriptive.
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-description
```

### 2. Make Your Changes

When making changes, please follow these guidelines:
- **TypeScript**: We heavily leverage TypeScript for type safety. Please ensure any new code introduces appropriate interfaces/types and does not use `any` unless absolutely necessary.
- **Styling**: We use Vanilla CSS and a custom design system based on design tokens (`var(--color-...)`). Please stick to the conventions found in `globals.css` and avoid ad-hoc styling.
- **Components**: UI components should be placed in `src/components/`. Keep them functional and make use of React Hooks.

### 3. Testing Your Changes

Before committing, make sure your code passes all linting and tests, and builds successfully.

- **Run purely type-checking**:
  ```bash
  npx tsc --noEmit
  ```
- **Run the linter**:
  ```bash
  npm run lint
  ```
- **Run the tests**:
  We use `Jest` and `React Testing Library`. Ensure you add or update tests for any modified or new components.
  ```bash
  npm run test
  ```
- **Check the production build**:
  ```bash
  npm run build
  ```

### 4. Commit Your Changes

Write clear, concise commit messages. 
```bash
git commit -m "feat: add new sorting to animal-wise datatable"
```

## Submitting a Pull Request

Once you are happy with your changes, you're ready to open a Pull Request!

1. **Push your changes** to your fork:
   ```bash
   git push origin branch-name
   ```
2. Navigate to the original KESTREL repository and click **New Pull Request**.
3. Clearly describe what changes you're making and why. Link any relevant GitHub issues.
4. An admin will review your code. You may be asked to make some adjustments before it is finally merged.

## Reporting Bugs and Requesting Features

If you found a bug or have a suggestion for a feature, please search the [Issue Tracker](https://github.com/Kestrel-Biodiversity-Monitor/kestrel-frontend/issues) to ensure it hasn't already been reported. If it hasn't, feel free to open a new issue.

- **For bugs**: Provide a clear description, steps to reproduce, and what you expected to happen. 
- **For features**: Explain how the feature would improve the project and any context around the problem it solves.

---

Thank you for contributing! 🦅
