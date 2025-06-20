# WebAuthn PRF Key Derivation Demo

A demonstration of WebAuthn's Pseudo-Random Function (PRF) extension for deterministic key derivation using passkeys.

## What This Demo Does

This demo showcases how to:
- Register a passkey with PRF support
- Derive deterministic cryptographic keys using the PRF extension
- Store and retrieve credential IDs for key derivation

The PRF extension allows generating consistent cryptographic material from a passkey, making it useful for encryption keys, authentication tokens, or other cryptographic applications.

## Requirements

- Modern browser with WebAuthn support (Chrome 108+, Safari 16+, Firefox 113+)
- Device with biometric authentication or security key
- Local development server

## Setup and Usage

1. Install a local HTTP server:
   ```bash
   npm install -g http-server
   ```

2. Start the server in the project directory:
   ```bash
   http-server
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8080/pfr-demo.html
   ```

4. Click "Register Passkey" to create a new passkey with PRF support
5. Click "Derive Key" to generate a deterministic key using the PRF extension

## Security Notes

- Keys are derived using the salt "kita-health-root-v1"
- User verification is required for all operations
- Credential IDs are stored in localStorage for demonstration purposes only