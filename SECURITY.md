# Security Policy

## Supported Versions

We take security seriously and actively maintain security updates for the following versions:

| Version | Supported           | End of Support |
| ------- | ------------------- | -------------- |
| 1.x.x   | ✅ Active support   | TBD            |
| < 1.0   | ❌ Development only | N/A            |

## Security Standards

### Data Protection

- **Local Storage**: All health data is stored locally using encrypted IndexedDB
- **Transmission**: API communications use TLS 1.3+ encryption
- **Authentication**: Biometric and PIN-based access control
- **Privacy**: No personal data is transmitted without explicit user consent

### Health Data Compliance

- **GDPR Compliance**: Full compliance with European data protection regulations
- **HIPAA Guidelines**: Following healthcare data best practices
- **Google Play Policy**: Adherence to health data policies for app store distribution
- **Data Minimization**: Only collecting essential health metrics

### Mobile Security

- **App Signing**: Production apps are signed with secure certificates
- **Runtime Protection**: Implemented security checks against tampering
- **Network Security**: Certificate pinning for API communications
- **Storage Encryption**: All sensitive data encrypted at rest

## Reporting a Vulnerability

### How to Report

1. **Email**: Send details to security@stepzerozero.app
2. **GitHub**: Use private security advisories (preferred)
3. **PGP**: Use our public key for sensitive reports

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if available)
- Your contact information

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Weekly updates on progress
- **Resolution**: Target 30 days for critical issues
- **Disclosure**: Coordinated disclosure after fix deployment

## Security Best Practices for Users

### App Security

- Keep the app updated to the latest version
- Use device biometric authentication when available
- Enable app lock with PIN or password
- Review app permissions regularly

### Device Security

- Keep Android OS updated
- Use device encryption
- Install apps only from trusted sources
- Enable Google Play Protect

### Data Privacy

- Review data sharing settings
- Understand what data is collected
- Use data export features to maintain backups
- Report suspicious app behavior immediately

## Security Features

### Built-in Protection

- **Biometric Authentication**: Fingerprint, face, and voice recognition
- **App Lock**: PIN and pattern-based secondary authentication
- **Session Management**: Automatic logout after inactivity
- **Data Encryption**: AES-256 encryption for sensitive health data

### Privacy Controls

- **Data Anonymization**: Personal identifiers removed from analytics
- **Opt-out Options**: Users can disable data collection features
- **Data Portability**: Export all personal data in standard formats
- **Right to Deletion**: Complete data removal on user request

### Network Security

- **Certificate Pinning**: Prevents man-in-the-middle attacks
- **Request Signing**: API requests cryptographically signed
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: All user inputs sanitized and validated

## Vulnerability Disclosure Policy

### Coordinated Disclosure

1. Report received and acknowledged
2. Vulnerability verified and assessed
3. Fix developed and tested
4. Security update released
5. Public disclosure (if appropriate)

### Scope

- **In Scope**: The mobile app, API endpoints, data storage
- **Out of Scope**: Third-party services, social engineering, physical attacks

### Rewards

While we don't currently offer a formal bug bounty program, we:

- Acknowledge security researchers in our release notes
- Provide early access to new features for verified reporters
- Consider small rewards for critical vulnerability discoveries

## Incident Response

### Emergency Contacts

- **Security Team**: security@stepzerozero.app
- **Lead Developer**: @priyanksachdeva on GitHub
- **Emergency**: Use GitHub security advisories for urgent issues

### Response Levels

- **Critical**: Active exploitation, data breach risk
- **High**: Significant security weakness
- **Medium**: Limited impact vulnerability
- **Low**: Minor security improvement opportunity

## Security Updates

### Automatic Updates

- Security patches are delivered through app store updates
- Critical security fixes are prioritized for immediate release
- Users are notified of security-related updates

### Notification Channels

- In-app notifications for security updates
- GitHub security advisories for technical details
- Email notifications for registered users
- Public security blog posts for major issues

## Compliance and Auditing

### Regular Security Reviews

- Monthly security assessments
- Quarterly penetration testing
- Annual third-party security audits
- Continuous dependency vulnerability scanning

### Compliance Monitoring

- GDPR compliance reviews
- Google Play policy adherence checks
- Healthcare data regulation compliance
- Accessibility and security standard alignment

## Contact Information

### Security Team

- **Email**: security@stepzerozero.app
- **PGP Key**: [Download Public Key](https://stepzerozero.app/.well-known/pgp-key.asc)
- **GitHub**: [@priyanksachdeva](https://github.com/priyanksachdeva)

### Business Inquiries

- **General**: hello@stepzerozero.app
- **Legal**: legal@stepzerozero.app
- **Press**: press@stepzerozero.app

---

**Last Updated**: August 2025  
**Next Review**: February 2026

_This security policy is subject to updates. Please check regularly for the latest version._
