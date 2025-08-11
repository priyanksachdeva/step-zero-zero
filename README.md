# Nothing Health - Step Zero Zero

A modern, minimalist health tracking application inspired by Nothing's design philosophy. Track your daily steps, monitor health metrics, and stay motivated with a clean, technical interface.

![Nothing Health Banner](docs/images/banner.png)

## 🎯 Features

### Core Functionality

- **Real-time Step Tracking** - Advanced step detection using device sensors
- **Health Connect Integration** - Sync with Google Health Connect for comprehensive data
- **Native Performance** - Capacitor-powered native Android app
- **Offline-first** - Works without internet connection
- **PWA Support** - Install as Progressive Web App

### Health Metrics

- Daily step counting with goal tracking
- Distance and calorie calculation
- Active time monitoring
- Weekly progress visualization
- Heart rate monitoring (device dependent)
- Sleep tracking (beta)
- Hydration and nutrition logging

### Design

- **Nothing-inspired UI** - Minimalist, technical aesthetic
- **Dark theme** - Pure black background with Nothing red accents
- **Responsive design** - Optimized for all Android screen sizes
- **Accessibility** - ARIA labels, screen reader support
- **Battery optimized** - Efficient sensor usage

## 📱 Screenshots

| Home Screen                   | Analytics                               | Health Metrics                    |
| ----------------------------- | --------------------------------------- | --------------------------------- |
| ![Home](docs/images/home.png) | ![Analytics](docs/images/analytics.png) | ![Health](docs/images/health.png) |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Android Studio with SDK 33+
- Java 11+
- Git

### Development Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/priyanksachdeva/step-zero-zero.git
   cd step-zero-zero
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run development server**

   ```bash
   npm run dev
   ```

4. **Build for Android**
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   npx cap open android
   ```

### Quick Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build

# Android
npm run android      # Build and open Android Studio
npm run sync         # Sync web assets to native
```

## 📖 Documentation

- [Installation Guide](docs/INSTALLATION.md) - Detailed setup instructions
- [Android Development](docs/ANDROID.md) - Android-specific development guide
- [API Reference](docs/API.md) - Component and hook documentation
- [Architecture](docs/ARCHITECTURE.md) - Project structure and design decisions
- [Contributing](docs/CONTRIBUTING.md) - How to contribute to the project
- [Deployment](docs/DEPLOYMENT.md) - Play Store release process

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: Tailwind CSS + shadcn/ui components
- **Mobile**: Capacitor 6 + Android native code
- **State**: React hooks + localStorage persistence
- **Health**: Google Health Connect integration
- **Sensors**: Native Android sensor APIs

### Project Structure

```
step-zero-zero/
├── src/                    # React application source
│   ├── components/         # UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── layout/        # Layout components
│   │   └── tabs/          # Tab-specific components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utilities and helpers
│   └── pages/             # Page components
├── android/               # Capacitor Android project
│   └── app/src/main/      # Android native code
│       ├── java/          # Java/Kotlin source
│       └── res/           # Android resources
├── public/                # Static assets
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Style

- TypeScript for type safety
- ESLint + Prettier for code formatting
- Conventional commits for commit messages
- Component-first architecture

## 📋 Requirements

### Minimum Requirements

- Android 8.0 (API level 26) or higher
- 2GB RAM
- 100MB storage space
- Motion sensors (accelerometer/gyroscope)

### Recommended

- Android 12+ for best Health Connect experience
- 4GB+ RAM for smooth performance
- Biometric sensors for heart rate monitoring

## 🔒 Privacy & Security

- **Local Storage**: All data stored locally on device
- **No Tracking**: No analytics or user tracking
- **Health Connect**: Optional integration with user consent
- **Permissions**: Minimal permissions requested
- **Open Source**: Full transparency in code

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nothing](https://nothing.tech) for design inspiration
- [Capacitor](https://capacitorjs.com) for native integration
- [shadcn/ui](https://ui.shadcn.com) for UI components
- [React](https://react.dev) ecosystem for development tools

## 🐛 Support

- **Issues**: [GitHub Issues](https://github.com/priyanksachdeva/step-zero-zero/issues)
- **Discussions**: [GitHub Discussions](https://github.com/priyanksachdeva/step-zero-zero/discussions)
- **Email**: [support@stepzerozero.app](mailto:support@stepzerozero.app)

## 🚀 Roadmap

### Version 1.1

- [ ] Apple Health integration
- [ ] Watch companion app
- [ ] Advanced analytics
- [ ] Social features

### Version 1.2

- [ ] Workout tracking
- [ ] Meditation timer
- [ ] Custom goals
- [ ] Data export/import

---

<div align="center">
  <p>Built with ❤️ using Nothing design principles</p>
  <p>
    <a href="https://github.com/priyanksachdeva/step-zero-zero">⭐ Star on GitHub</a> •
    <a href="https://play.google.com/store/apps/details?id=com.nothing.health">📱 Download on Play Store</a>
  </p>
</div>
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/6ecd6699-2820-4dd3-8e0a-1eeec82ccda3) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
