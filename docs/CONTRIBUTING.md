# Contributing to Nothing Health - Step Zero Zero

Thank you for your interest in contributing to Nothing Health! We welcome contributions from the community and are excited to see what you'll bring to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Contribution Guidelines](#contribution-guidelines)
- [Code Style](#code-style)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Enforcement

Project maintainers have the right and responsibility to remove, edit, or reject comments, commits, code, issues, and other contributions that don't align with this Code of Conduct.

## Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- Android Studio with SDK 33+
- Git configured with your GitHub account
- Familiarity with React, TypeScript, and Android development

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/step-zero-zero.git
   cd step-zero-zero
   ```
3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/priyanksachdeva/step-zero-zero.git
   ```

### Development Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up development environment:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Development Process

### Branching Strategy

We use **Git Flow** with the following branches:

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `release/*`: Release preparation
- `hotfix/*`: Critical fixes

### Workflow

1. **Sync with upstream**:

   ```bash
   git checkout develop
   git pull upstream develop
   ```

2. **Create feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make changes and commit**:

   ```bash
   git add .
   git commit -m "feat: add new step detection algorithm"
   ```

4. **Push and create PR**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Contribution Guidelines

### Types of Contributions

#### 🐛 Bug Reports

- Use the bug report template
- Include steps to reproduce
- Provide device/OS information
- Include screenshots if relevant

#### ✨ Feature Requests

- Use the feature request template
- Describe the problem you're solving
- Explain your proposed solution
- Consider alternative solutions

#### 📝 Documentation

- Fix typos and improve clarity
- Add examples and tutorials
- Translate documentation
- Update outdated information

#### 💻 Code Contributions

- Bug fixes
- New features
- Performance improvements
- Refactoring and cleanup

### Areas We Need Help

- **Accessibility improvements**: ARIA labels, screen reader support
- **Internationalization**: Multi-language support
- **Testing**: Unit tests, integration tests, E2E tests
- **Performance optimization**: Battery usage, memory efficiency
- **Design system**: Component consistency, design tokens
- **Documentation**: API docs, tutorials, examples

## Code Style

### TypeScript/JavaScript

We use ESLint and Prettier for code formatting:

```typescript
// ✅ Good: Use descriptive names
const calculateDailyStepGoal = (userProfile: UserProfile): number => {
  return userProfile.activityLevel === "high" ? 12000 : 8000;
};

// ❌ Bad: Unclear naming
const calc = (u: any) => (u.al === "h" ? 12000 : 8000);
```

### React Components

Follow these conventions:

```typescript
// ✅ Good: Proper component structure
interface StepCounterProps {
  steps: number;
  goal: number;
  onReset: () => void;
}

export const StepCounter: React.FC<StepCounterProps> = ({
  steps,
  goal,
  onReset,
}) => {
  return <div className="step-counter">{/* Component content */}</div>;
};
```

### Android/Java

Follow Android coding standards:

```java
// ✅ Good: Clear method names and documentation
/**
 * Detects steps using accelerometer data with adaptive threshold
 * @param acceleration Raw accelerometer values
 * @return Number of steps detected
 */
public int detectSteps(float[] acceleration) {
    // Implementation
}
```

### CSS/Styling

Use Tailwind utilities with Nothing design principles:

```css
/* ✅ Good: Semantic class names with Nothing design */
.step-display {
  @apply font-display text-6xl text-foreground tabular-nums;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.03em;
}

/* ❌ Bad: Arbitrary values without semantic meaning */
.numbers {
  font-size: 72px;
  color: #ffffff;
}
```

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Types: feat, fix, docs, style, refactor, test, chore
feat: add Health Connect integration
fix: resolve step counting accuracy issue
docs: update installation guide
style: apply Nothing design system
refactor: extract step detection logic
test: add unit tests for pedometer hook
chore: update dependencies
```

## Testing Requirements

### Unit Tests

Write tests for all new functions and components:

```typescript
// Example: Testing step detection
describe("StepDetection", () => {
  it("should detect steps accurately", () => {
    const detector = new StepDetector();
    const testData = generateMockAccelerometerData();

    const result = detector.processData(testData);

    expect(result.stepCount).toBe(10);
    expect(result.confidence).toBeGreaterThan(0.8);
  });
});
```

### Integration Tests

Test component interactions:

```typescript
describe("StepCounter Integration", () => {
  it("should update display when steps change", async () => {
    render(<StepCounter steps={100} />);

    // Simulate step increase
    await userEvent.click(screen.getByText("Start Tracking"));

    await waitFor(() => {
      expect(screen.getByText("101")).toBeInTheDocument();
    });
  });
});
```

### Android Tests

Include Android instrumentation tests:

```java
@Test
public void testStepServiceIntegration() {
    // Test native step detection service
    StepTrackingService service = new StepTrackingService();
    service.startTracking();

    // Simulate sensor events
    SensorEvent mockEvent = createMockSensorEvent();
    service.onSensorChanged(mockEvent);

    assertEquals(1, service.getStepCount());
}
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run Android tests
cd android && ./gradlew test
```

## Pull Request Process

### Before Submitting

1. **Sync with latest develop**:

   ```bash
   git checkout develop
   git pull upstream develop
   git checkout your-branch
   git rebase develop
   ```

2. **Run tests and linting**:

   ```bash
   npm run test
   npm run lint
   npm run type-check
   ```

3. **Test on Android device**:
   ```bash
   npm run build
   npx cap sync
   npx cap run android
   ```

### PR Template

Use our PR template:

```markdown
## Description

Brief description of changes and motivation.

## Type of Change

- [ ] Bug fix (non-breaking change that fixes an issue)
- [ ] New feature (non-breaking change that adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Android build successful

## Screenshots (if applicable)

Before/after screenshots for UI changes.

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] Android compatibility verified
```

### Review Process

1. **Automated checks**: All CI checks must pass
2. **Code review**: At least one maintainer approval required
3. **Testing**: Verify functionality on real devices
4. **Documentation**: Ensure docs are updated if needed

### Merge Requirements

- ✅ All CI checks passing
- ✅ At least 1 approving review
- ✅ No merge conflicts
- ✅ Branch up to date with develop
- ✅ All conversations resolved

## Issue Reporting

### Bug Reports

Use the bug report template with:

- **Device information**: Model, Android version, Nothing Health version
- **Steps to reproduce**: Clear, numbered steps
- **Expected behavior**: What should happen
- **Actual behavior**: What actually happens
- **Screenshots/logs**: Visual evidence and error logs

### Feature Requests

Use the feature request template with:

- **Problem description**: What problem does this solve?
- **Proposed solution**: Detailed feature description
- **Alternatives considered**: Other possible solutions
- **Additional context**: Mockups, references, etc.

### Security Issues

For security vulnerabilities:

1. **DO NOT** create a public issue
2. Email security@stepzerozero.app
3. Include detailed reproduction steps
4. We'll respond within 48 hours

## Recognition

### Contributors

All contributors are recognized in:

- README contributors section
- Release notes for significant contributions
- Special mentions in documentation

### Contribution Types

We recognize various contribution types:

- 💻 Code
- 📖 Documentation
- 🐛 Bug reports
- 💡 Ideas & feedback
- 🎨 Design
- 🌍 Translation
- ❓ Answering questions

## Getting Help

### Communication Channels

- **GitHub Discussions**: General questions and ideas
- **Discord**: Real-time chat (link in README)
- **Email**: contribute@stepzerozero.app
- **Issues**: Bug reports and feature requests

### Mentorship

New contributors can request mentorship:

1. Comment on a "good first issue"
2. Tag @maintainers for guidance
3. Join our contributor onboarding sessions

### Resources

- [React Documentation](https://react.dev)
- [Android Developer Guide](https://developer.android.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)

---

Thank you for contributing to Nothing Health! Your efforts help create a better health tracking experience for everyone. 🚀
