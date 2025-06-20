# Contributing to WebAuthn PRF Library

Thank you for your interest in contributing to the WebAuthn PRF library! This document provides guidelines and information for contributors.

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## How to Contribute

### Reporting Bugs

Before submitting a bug report:
- Check the existing issues to avoid duplicates
- Ensure you're using the latest version
- Test with multiple browsers if applicable

When submitting a bug report, include:
- Clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser and environment details
- Code samples or screenshots if helpful

### Suggesting Features

We welcome feature suggestions! Please:
- Check existing issues and discussions
- Clearly describe the use case
- Explain how it fits with the library's focused scope (PRF extraction)
- Consider backward compatibility

### Pull Requests

1. **Fork the repository** and create a feature branch
2. **Follow the development setup** below
3. **Make your changes** following our coding standards
4. **Add or update tests** for your changes
5. **Ensure all tests pass** and coverage remains high
6. **Update documentation** if needed
7. **Submit a pull request** with a clear description

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm 9+
- Modern browser for testing

### Getting Started

```bash
# Clone your fork
git clone https://github.com/your-username/webauthn-prf.git
cd webauthn-prf

# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch

# Build the library
npm run build

# Run linting
npm run lint

# Run type checking
npm run typecheck
```

### Project Structure

```
├── src/
│   └── index.ts           # Main library code
├── __tests__/
│   ├── setup.ts           # Test configuration
│   ├── utility-functions.test.ts
│   ├── config-builders.test.ts
│   ├── result-processors.test.ts
│   ├── main-functions.test.ts
│   └── integration.test.ts
├── examples/              # Usage examples
├── dist/                  # Built library (generated)
└── .github/workflows/     # CI/CD configuration
```

## Coding Standards

### TypeScript Guidelines

- Use strict TypeScript settings
- Prefer `const` over `let`, avoid `var`
- Use explicit return types for public functions
- Avoid `any` types - use proper typing
- Use neverthrow Result types for error handling

### Code Style

- Use 2-space indentation
- No trailing whitespace
- Semicolons required
- Single quotes for strings
- Trailing commas in multiline structures

### Error Handling

- Use neverthrow Result types consistently
- Provide meaningful error messages
- Handle all error cases in tests
- Never throw exceptions - return Result types

### Testing Requirements

All contributions must include appropriate tests:

- **Unit tests** for new functions
- **Integration tests** for complex workflows  
- **Error case coverage** for all failure modes
- **Type safety tests** where applicable
- Maintain **>95% code coverage**

### Documentation

- Add JSDoc comments for public APIs
- Update README if adding new features
- Include usage examples for new functionality
- Update CHANGELOG for notable changes

## Library Scope

This library has a **focused scope**: extracting pseudorandom values from WebAuthn passkeys using the PRF extension.

**In scope:**
- PRF value extraction and formatting
- WebAuthn configuration helpers
- Robust error handling
- Type safety improvements
- Performance optimizations
- Security enhancements

**Out of scope:**
- General WebAuthn authentication flows
- Credential storage mechanisms
- Cryptographic implementations
- UI components
- Server-side integrations

## Security Considerations

When contributing:

- Never log or expose sensitive data
- Use secure coding practices
- Consider timing attack vectors
- Validate all inputs thoroughly
- Follow principle of least privilege
- Report security issues privately (see SECURITY.md)

## Release Process

1. Version bumps follow [Semantic Versioning](https://semver.org/)
2. All tests must pass in CI
3. Code coverage must remain >95%
4. Security audit must pass
5. Documentation must be updated
6. Release notes must be comprehensive

## Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Security Issues**: Email security@your-domain.com privately

## Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes for significant contributions
- Given credit in npm package metadata

## Development Tips

### Running Examples

```bash
# Build the library first
npm run build

# Start a local server
python -m http.server 8000

# Open browser to test examples
open http://localhost:8000/examples/browser-demo.html
```

### Testing WebAuthn

Since WebAuthn requires user interaction, our tests use mocked APIs. For manual testing:

1. Use HTTPS or localhost
2. Ensure you have a compatible authenticator
3. Test across different browsers
4. Verify PRF extension support

### Debugging

- Use browser DevTools for WebAuthn debugging
- Enable WebAuthn debugging in Chrome: `chrome://flags/#enable-webauthn-debugging`
- Check console for detailed error messages
- Use coverage reports to identify untested code paths

## Questions?

Don't hesitate to ask questions in GitHub Discussions or open an issue for clarification. We're here to help make your contribution successful!

Thank you for contributing to make WebAuthn PRF more reliable and secure! 🔐