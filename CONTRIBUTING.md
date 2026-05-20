# Contributing to KakshaOne

First off, thanks for taking the time to contribute! :tada:

## Code of Conduct

This project and everyone participating in it is governed by our
[Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to
uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to see if the
problem has already been reported. When you create a bug report, include as
many details as possible:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node version, database)

### Suggesting Features

Feature suggestions are welcome! Provide a clear explanation of why the
feature would be useful and how it should work.

### Pull Requests

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run the tests: `npm test`
5. Run the linter: `npm run lint`
6. Commit your changes using conventional commits
7. Push to your fork and submit a pull request

### Development Setup

1. Clone the repo:
   ```bash
   git clone https://github.com/your-username/kakshaone.git
   cd kakshaone
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see `.env.example`):
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. Set up the database:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   npm run seed
   ```

5. Start the dev server:
   ```bash
   npm run dev
   ```

### Project Structure

```
kakshaone/
  app/              # Next.js App Router pages and API routes
    admin/          # Admin dashboard pages
    api/            # API routes
    components/     # Shared React components
    config/         # App configuration
    lib/            # Utility functions and auth
    platform/       # Super admin platform
    staff/          # Staff pages
    student/        # Student pages
    register-school/# School registration wizard
    payment/        # Razorpay payment pages
  lib/              # Database client
  prisma/           # Schema and migrations
  public/           # Static assets
  types/            # TypeScript type definitions
```

### Commit Guidelines

We use conventional commits:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code changes that neither fix bugs nor add features
- `test:` Adding or updating tests
- `chore:` Build process or tooling changes

### Code Style

- TypeScript strict mode is enabled
- Use named exports for components
- Use `async/await` over raw promises
- Path aliases: use `@/` instead of relative paths
- Components use shadcn/ui conventions
- API routes follow Next.js App Router conventions

## Questions?

Feel free to open a discussion or reach out to the maintainers.
