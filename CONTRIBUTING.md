# Contributing to Monii

Thank you for your interest in contributing to Monii! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/Monii.git
   cd Monii
   ```

2. **Setup Development Environment**
   ```bash
   bun install
   cp .env.example .env.local
   bun run db:push  # Setup database
   bun run dev      # Start development server
   ```

3. **Run Tests**
   ```bash
   bun run check    # Lint and format
   bun run typecheck # TypeScript validation
   ```

## 📋 Development Workflow

### 1. Choose an Issue
- Check [GitHub Issues](https://github.com/yourusername/Monii/issues) for open tasks
- Look for issues labeled `good first issue` or `help wanted`
- Comment on the issue to indicate you're working on it

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/issue-number-description
```

### 3. Make Changes
- Follow the existing code style and architecture
- Write tests for new functionality
- Update documentation as needed
- Ensure all checks pass: `bun run check && bun run typecheck`

### 4. Commit Changes
Use conventional commit format:
```bash
git commit -m "feat: add new transaction category validation"
git commit -m "fix: resolve budget calculation bug"
git commit -m "docs: update API documentation"
```

### 5. Create Pull Request
- Push your branch: `git push origin feature/your-feature-name`
- Create a PR with a clear description
- Reference any related issues
- Request review from maintainers

## 🏗️ Architecture Guidelines

### Code Organization
```
src/
├── app/           # Next.js App Router (routes and layouts)
├── components/    # React components (UI layer)
├── services/      # Business logic (data operations)
├── lib/          # Utilities and configurations
├── db/           # Database schemas and connections
└── hooks/        # Custom React hooks
```

### Separation of Concerns
- **Components**: Pure UI, use TanStack Query for data
- **Services**: Business logic, database operations
- **Actions**: Thin server actions, input validation
- **Lib**: Reusable utilities, configurations

### Type Safety
- Use TypeScript for all code
- Leverage Zod for runtime validation
- Define proper interfaces for data structures

## 🧪 Testing

### Unit Tests (Services)
```bash
# Add tests in __tests__ directories
src/services/__tests__/transaction.test.ts
```

### Component Tests
```bash
# Use Testing Library for React components
src/components/__tests__/TransactionForm.test.tsx
```

### Running Tests
```bash
bun run test        # Run all tests
bun run test:watch  # Watch mode
bun run test:coverage # With coverage report
```

## 🎨 Code Style

### TypeScript
- Use strict TypeScript settings
- Avoid `any` type, use proper type definitions
- Leverage utility types and generics

### React
- Use functional components with hooks
- Prefer custom hooks for reusable logic
- Use TanStack Query for server state management

### Database
- Use Drizzle ORM for type-safe queries
- Implement atomic transactions for data consistency
- Follow multi-tenant patterns with userId boundaries

### Naming Conventions
```typescript
// Components: PascalCase
export function TransactionForm() {}

// Functions: camelCase
export function createTransaction() {}

// Types: PascalCase with descriptive names
export interface TransactionInput {}
export type TransactionType = 'INCOME' | 'EXPENSE';

// Files: kebab-case for components, camelCase for utilities
TransactionForm.tsx
transactionService.ts
```

## 🔒 Security

### Input Validation
- Validate all user inputs with Zod schemas
- Sanitize data before database operations
- Implement proper error handling without information leakage

### Authentication & Authorization
- Use secure session management
- Implement proper user isolation
- Validate permissions for sensitive operations

### Data Protection
- Never log sensitive information (passwords, tokens)
- Use HTTPS in production
- Implement proper CORS policies

## 📚 Documentation

### Code Comments
```typescript
/**
 * Creates a new transaction and updates account balance atomically
 * @param input - Transaction data
 * @returns Created transaction record
 */
export async function createTransaction(input: TransactionInput) {
  // Implementation...
}
```

### API Documentation
- Document server actions with JSDoc
- Include parameter types and return values
- Explain business logic and edge cases

## 🚦 Pull Request Process

### Before Submitting
- [ ] All tests pass (`bun run check && bun run typecheck`)
- [ ] Code follows established patterns
- [ ] Documentation updated
- [ ] No console.log statements in production code
- [ ] Commit messages follow conventional format

### PR Description Template
```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Manual testing completed
- [ ] No regressions introduced

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process
1. Automated checks must pass (CI/CD)
2. At least one maintainer review required
3. Address review feedback
4. Squash commits before merge
5. Delete branch after merge

## 🎯 Best Practices

### Performance
- Use React.memo for expensive components
- Implement proper loading states
- Optimize database queries
- Use proper caching strategies

### Accessibility
- Semantic HTML elements
- Proper ARIA labels
- Keyboard navigation support
- Color contrast compliance

### Error Handling
- Graceful error boundaries
- User-friendly error messages
- Proper logging for debugging
- Fallback UI states

### Git Hygiene
- Keep commits focused and atomic
- Use descriptive commit messages
- Rebase before merging
- Keep PRs small and focused

## 📞 Getting Help

- **Issues**: For bugs and feature requests
- **Discussions**: For questions and general discussion
- **Discord**: For real-time chat (if available)

## 📋 Checklist for Contributors

- [ ] I have read the CONTRIBUTING guidelines
- [ ] My code follows the project's style guidelines
- [ ] I have added tests for my changes
- [ ] I have updated documentation
- [ ] My commits follow conventional format
- [ ] I have tested my changes thoroughly

Thank you for contributing to Monii! 🎉