import {
  registerPasskey,
  authenticateAndDeriveKey,
  deriveKeyFromRegistration,
  WebAuthnConfig,
  textToSalt,
  randomChallenge,
  randomUserId
} from '../src/index';

// Mock the global navigator.credentials
const mockCredentialsCreate = jest.fn();
const mockCredentialsGet = jest.fn();

Object.defineProperty(global, 'navigator', {
  value: {
    credentials: {
      create: mockCredentialsCreate,
      get: mockCredentialsGet
    }
  },
  writable: true
});

// Mock window.location for rpId defaults
Object.defineProperty(global, 'window', {
  value: {
    location: {
      hostname: 'test.example.com'
    }
  },
  writable: true
});

describe('Main Functions', () => {
  const mockConfig: WebAuthnConfig = {
    rpName: 'Test App',
    rpId: 'test.example.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerPasskey', () => {
    it('should successfully register passkey with PRF', async () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: new Uint8Array([255, 254, 253, 252]).buffer
            }
          }
        })
      };

      mockCredentialsCreate.mockResolvedValue(mockCredential);

      const options = {
        userId: randomUserId(),
        userName: 'test@example.com',
        userDisplayName: 'Test User',
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const registerFn = registerPasskey(mockConfig, options);
      const result = await registerFn();

      expect(result.isOk()).toBe(true);
      expect(mockCredentialsCreate).toHaveBeenCalledTimes(1);
      
      if (result.isOk()) {
        expect(result.value.credentialId).toBe(mockCredential.rawId);
        expect(result.value.derivedKey).toBeDefined();
        expect(result.value.keyHex).toBe('fffefdfc');
      }
    });

    it('should handle registration failure when credential is null', async () => {
      mockCredentialsCreate.mockResolvedValue(null);

      const options = {
        userId: randomUserId(),
        userName: 'test@example.com',
        userDisplayName: 'Test User',
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const registerFn = registerPasskey(mockConfig, options);
      const result = await registerFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Failed to create credential');
      }
    });

    it('should handle registration exception', async () => {
      mockCredentialsCreate.mockRejectedValue(new Error('User cancelled'));

      const options = {
        userId: randomUserId(),
        userName: 'test@example.com',
        userDisplayName: 'Test User',
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const registerFn = registerPasskey(mockConfig, options);
      const result = await registerFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Registration failed: User cancelled');
      }
    });
  });

  describe('authenticateAndDeriveKey', () => {
    it('should successfully authenticate and derive key', async () => {
      const mockAssertion = {
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: new Uint8Array([255, 254, 253, 252]).buffer
            }
          }
        })
      };

      mockCredentialsGet.mockResolvedValue(mockAssertion);

      const options = {
        credentialId: new Uint8Array([1, 2, 3, 4]),
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const authFn = authenticateAndDeriveKey(mockConfig, options);
      const result = await authFn();

      expect(result.isOk()).toBe(true);
      expect(mockCredentialsGet).toHaveBeenCalledTimes(1);
      
      if (result.isOk()) {
        expect(result.value.keyHex).toBe('fffefdfc');
        expect(result.value.derivedKey).toBeInstanceOf(ArrayBuffer);
      }
    });

    it('should handle authentication failure when assertion is null', async () => {
      mockCredentialsGet.mockResolvedValue(null);

      const options = {
        credentialId: new Uint8Array([1, 2, 3, 4]),
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const authFn = authenticateAndDeriveKey(mockConfig, options);
      const result = await authFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Failed to get assertion');
      }
    });

    it('should handle authentication exception', async () => {
      mockCredentialsGet.mockRejectedValue(new Error('Authentication failed'));

      const options = {
        credentialId: new Uint8Array([1, 2, 3, 4]),
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const authFn = authenticateAndDeriveKey(mockConfig, options);
      const result = await authFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('Authentication failed: Authentication failed');
      }
    });

    it('should handle missing PRF result', async () => {
      const mockAssertion = {
        getClientExtensionResults: () => ({}) // No PRF result
      };

      mockCredentialsGet.mockResolvedValue(mockAssertion);

      const options = {
        credentialId: new Uint8Array([1, 2, 3, 4]),
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      };

      const authFn = authenticateAndDeriveKey(mockConfig, options);
      const result = await authFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('PRF result missing from authentication assertion');
      }
    });
  });

  describe('deriveKeyFromRegistration', () => {
    it('should register and return key when PRF available during registration', async () => {
      const prfBuffer = new Uint8Array([255, 254, 253, 252]).buffer;
      
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: prfBuffer
            }
          }
        })
      };

      mockCredentialsCreate.mockResolvedValue(mockCredential);

      const deriveFn = deriveKeyFromRegistration(
        mockConfig,
        randomUserId(),
        'test@example.com',
        'Test User',
        textToSalt('test-salt')
      );

      const result = await deriveFn();

      expect(result.isOk()).toBe(true);
      expect(mockCredentialsCreate).toHaveBeenCalledTimes(1);
      expect(mockCredentialsGet).not.toHaveBeenCalled(); // No auth needed

      if (result.isOk()) {
        expect(result.value.registration.derivedKey).toBe(prfBuffer);
        expect(result.value.derivedKey).toBeDefined();
        expect(result.value.derivedKey?.keyHex).toBe('fffefdfc');
      }
    });

    it('should register then authenticate when PRF not available during registration', async () => {
      // First call (registration) - no PRF
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        getClientExtensionResults: () => ({}) // No PRF during registration
      };

      // Second call (authentication) - has PRF
      const mockAssertion = {
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: new Uint8Array([255, 254, 253, 252]).buffer
            }
          }
        })
      };

      mockCredentialsCreate.mockResolvedValue(mockCredential);
      mockCredentialsGet.mockResolvedValue(mockAssertion);

      const deriveFn = deriveKeyFromRegistration(
        mockConfig,
        randomUserId(),
        'test@example.com',
        'Test User',
        textToSalt('test-salt')
      );

      const result = await deriveFn();

      expect(result.isOk()).toBe(true);
      expect(mockCredentialsCreate).toHaveBeenCalledTimes(1);
      expect(mockCredentialsGet).toHaveBeenCalledTimes(1);

      if (result.isOk()) {
        expect(result.value.registration.derivedKey).toBeNull();
        expect(result.value.derivedKey).toBeDefined();
        expect(result.value.derivedKey?.keyHex).toBe('fffefdfc');
      }
    });

    it('should handle registration failure', async () => {
      mockCredentialsCreate.mockRejectedValue(new Error('Registration failed'));

      const deriveFn = deriveKeyFromRegistration(
        mockConfig,
        randomUserId(),
        'test@example.com',
        'Test User',
        textToSalt('test-salt')
      );

      const result = await deriveFn();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toContain('Registration failed');
      }
    });
  });
});