# Security Policy

## Supported Versions

We actively support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing [security@your-domain.com](mailto:security@your-domain.com).

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the requested information listed below (as much as you can provide) to help us better understand the nature and scope of the possible issue:

- Type of issue (e.g. buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Security Considerations

This library handles cryptographic material and WebAuthn credentials. Please note:

### What This Library Does
- Extracts pseudorandom values from WebAuthn passkeys using the PRF extension
- Provides type-safe interfaces for WebAuthn PRF operations
- Uses battle-tested libraries (neverthrow, SimpleWebAuthn) for core functionality

### What This Library Does NOT Do
- Store credentials or cryptographic material
- Implement cryptographic algorithms (relies on browser WebCrypto and WebAuthn APIs)
- Provide authentication or authorization mechanisms beyond PRF extraction

### Security Best Practices

When using this library:

1. **Always use HTTPS** in production environments
2. **Never store credential IDs in localStorage** in production - use secure server-side storage
3. **Use unique salts** for different purposes to ensure key separation
4. **Validate all inputs** on the server side
5. **Keep dependencies updated** - run `npm audit` regularly
6. **Use Content Security Policy** to prevent XSS attacks
7. **Consider salt versioning** for key rotation strategies

### Dependencies

This library depends on:
- `neverthrow` - For robust error handling
- `@simplewebauthn/browser` - For WebAuthn utilities
- `tslib` - TypeScript runtime helpers

All dependencies are regularly audited for security vulnerabilities through our CI/CD pipeline.

## Responsible Disclosure

We appreciate the security research community and believe that responsible disclosure of security vulnerabilities helps make the ecosystem safer.

If you believe you have found a security vulnerability, we encourage you to submit a report through our private disclosure process rather than through public channels.

## Security Updates

Security updates will be released as patch versions and will be announced:
- In the project's release notes
- Through GitHub Security Advisories
- Via email to maintainers

## Code Review Process

All code changes go through:
- Automated security scanning via CodeQL
- Dependency vulnerability scanning
- Manual code review by maintainers
- Comprehensive test suite including security-focused tests

## Contact

For security-related questions or concerns, please contact [security@your-domain.com](mailto:security@your-domain.com).