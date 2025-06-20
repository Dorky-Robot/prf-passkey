# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2024-12-XX

### Added
- Initial release of WebAuthn PRF library
- Core functions for PRF extraction from WebAuthn passkeys
- `registerPasskey()` function for passkey registration with PRF support
- `authenticateAndDeriveKey()` function for authentication and key derivation
- `deriveKeyFromRegistration()` higher-order function for streamlined workflows
- Comprehensive utility functions for encoding, decoding, and random generation
- Full TypeScript support with complete type definitions
- Robust error handling using neverthrow Result types
- Battle-tested dependencies: neverthrow and SimpleWebAuthn
- ESM and CommonJS build targets
- Comprehensive test suite with 96%+ coverage
- Browser demo and usage examples
- Complete CI/CD pipeline with security scanning
- Security policy and contributing guidelines
- Automated dependency management via Dependabot

### Features
- 🔐 Deterministic pseudorandom value extraction from passkeys
- 🛡️ Type-safe operations with comprehensive TypeScript definitions
- 🧩 Robust error handling with neverthrow monadic patterns
- 📦 Multiple module formats (ESM/CommonJS) for universal compatibility
- 🔧 Built on battle-tested SimpleWebAuthn utilities
- 🌐 Modern WebAuthn PRF extension support

### Security
- CodeQL static analysis integration
- ESLint security rules enforcement
- Regular dependency vulnerability auditing
- Responsible disclosure security policy
- No storage or logging of sensitive cryptographic material

### Documentation
- Comprehensive README with usage examples
- API reference documentation
- Browser demo with interactive examples
- Security considerations and best practices
- Contributing guidelines and development setup

### Testing
- 52 comprehensive test cases
- Unit tests for all utility functions
- Integration tests for end-to-end workflows
- Error handling and edge case coverage
- Cross-platform CI testing (Ubuntu, Windows, macOS)
- Multi-Node.js version support (18, 20, 22)

[Unreleased]: https://github.com/your-username/webauthn-prf/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/your-username/webauthn-prf/releases/tag/v1.0.0