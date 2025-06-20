import {
  registerPasskey,
  authenticateAndDeriveKey,
  textToSalt,
  randomChallenge,
  randomUserId,
  base64urlToUint8Array,
  arrayBufferToBase64url,
  formatKeyAsHex
} from '../src/index';

describe('Integration Tests', () => {
  describe('End-to-End Workflow Simulation', () => {
    it('should demonstrate complete PRF workflow with mocked WebAuthn', async () => {
      // Mock WebAuthn API
      const mockPrfValue = new Uint8Array([
        0x8f, 0x98, 0x04, 0xf3, 0x15, 0x05, 0x9c, 0xab,
        0x9b, 0x39, 0x48, 0xe1, 0xb0, 0xd0, 0x18, 0x09,
        0x29, 0xe8, 0xaf, 0xcf, 0x77, 0x10, 0x78, 0xb8,
        0x84, 0xac, 0x31, 0xce, 0x0d, 0x52, 0x0b, 0xcf
      ]).buffer;

      const mockCredentialId = new Uint8Array([
        0xa7, 0xcc, 0x80, 0x87, 0x71, 0x00, 0x1f, 0x37,
        0x0f, 0x8e, 0xdf, 0x74, 0x1a, 0xa6, 0x66, 0x44
      ]).buffer;

      // Mock successful registration
      const mockRegistrationCredential = {
        rawId: mockCredentialId,
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: mockPrfValue
            }
          }
        })
      };

      // Mock successful authentication
      const mockAuthAssertion = {
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: mockPrfValue
            }
          }
        })
      };

      const mockNavigator = {
        credentials: {
          create: jest.fn().mockResolvedValue(mockRegistrationCredential),
          get: jest.fn().mockResolvedValue(mockAuthAssertion)
        }
      };

      // Replace global navigator
      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true
      });

      const config = {
        rpName: 'Test App',
        rpId: 'localhost'
      };

      const salt = textToSalt('test-application-salt-v1');
      const userId = randomUserId();
      const userName = 'test@example.com';
      const userDisplayName = 'Test User';

      // Step 1: Register passkey
      const registrationFn = registerPasskey(config, {
        userId,
        userName,
        userDisplayName,
        challenge: randomChallenge(),
        salt
      });

      const registrationResult = await registrationFn();

      expect(registrationResult.isOk()).toBe(true);
      
      if (registrationResult.isOk()) {
        const registration = registrationResult.value;
        
        // Verify registration result
        expect(registration.credentialId).toBe(mockCredentialId);
        expect(registration.derivedKey).toBe(mockPrfValue);
        expect(registration.keyHex).toBe(formatKeyAsHex(mockPrfValue));
        
        // Step 2: Store credential ID (simulate app storage)
        const encodedCredentialId = registration.encodedId;
        
        // Step 3: Later authentication with same salt should give same PRF value
        const credentialIdResult = base64urlToUint8Array(encodedCredentialId);
        expect(credentialIdResult.isOk()).toBe(true);
        
        if (credentialIdResult.isOk()) {
          const authFn = authenticateAndDeriveKey(config, {
            credentialId: credentialIdResult.value,
            challenge: randomChallenge(),
            salt // Same salt as registration
          });
          
          const authResult = await authFn();
          
          expect(authResult.isOk()).toBe(true);
          
          if (authResult.isOk()) {
            // Should get the same PRF value
            expect(authResult.value.derivedKey).toBe(mockPrfValue);
            expect(authResult.value.keyHex).toBe(registration.keyHex);
          }
        }
      }
    });

    it('should handle different salts producing different PRF values', async () => {
      const prfValue1 = new Uint8Array([1, 2, 3, 4]).buffer;
      const prfValue2 = new Uint8Array([5, 6, 7, 8]).buffer;
      
      let callCount = 0;
      const mockNavigator = {
        credentials: {
          create: jest.fn(),
          get: jest.fn().mockImplementation(() => {
            callCount++;
            return Promise.resolve({
              getClientExtensionResults: () => ({
                prf: {
                  results: {
                    first: callCount === 1 ? prfValue1 : prfValue2
                  }
                }
              })
            });
          })
        }
      };

      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true
      });

      const config = { rpName: 'Test App' };
      const credentialId = new Uint8Array([1, 2, 3, 4]);
      
      // First authentication with salt1
      const auth1Fn = authenticateAndDeriveKey(config, {
        credentialId,
        challenge: randomChallenge(),
        salt: textToSalt('salt-1')
      });
      
      const result1 = await auth1Fn();
      
      // Second authentication with salt2
      const auth2Fn = authenticateAndDeriveKey(config, {
        credentialId,
        challenge: randomChallenge(),
        salt: textToSalt('salt-2')
      });
      
      const result2 = await auth2Fn();
      
      expect(result1.isOk()).toBe(true);
      expect(result2.isOk()).toBe(true);
      
      if (result1.isOk() && result2.isOk()) {
        // Different salts should produce different PRF values
        expect(result1.value.keyHex).not.toBe(result2.value.keyHex);
        expect(result1.value.keyHex).toBe('01020304');
        expect(result2.value.keyHex).toBe('05060708');
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle complete workflow failure gracefully', async () => {
      const mockNavigator = {
        credentials: {
          create: jest.fn().mockRejectedValue(new Error('User cancelled')),
          get: jest.fn().mockRejectedValue(new Error('Authentication failed'))
        }
      };

      Object.defineProperty(global, 'navigator', {
        value: mockNavigator,
        writable: true
      });

      const config = { rpName: 'Test App' };
      
      // Registration should fail gracefully
      const registrationFn = registerPasskey(config, {
        userId: randomUserId(),
        userName: 'test@example.com',
        userDisplayName: 'Test User',
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      });
      
      const registrationResult = await registrationFn();
      
      expect(registrationResult.isErr()).toBe(true);
      if (registrationResult.isErr()) {
        expect(registrationResult.error.message).toContain('User cancelled');
      }
      
      // Authentication should also fail gracefully
      const authFn = authenticateAndDeriveKey(config, {
        credentialId: new Uint8Array([1, 2, 3, 4]),
        challenge: randomChallenge(),
        salt: textToSalt('test-salt')
      });
      
      const authResult = await authFn();
      
      expect(authResult.isErr()).toBe(true);
      if (authResult.isErr()) {
        expect(authResult.error.message).toContain('Authentication failed');
      }
    });
  });

  describe('Utility Function Integration', () => {
    it('should handle round-trip encoding/decoding', () => {
      const originalData = new Uint8Array([255, 254, 253, 252, 1, 2, 3, 4]);
      
      // Convert to base64url and back
      const base64url = arrayBufferToBase64url(originalData.buffer);
      const decodedResult = base64urlToUint8Array(base64url);
      
      expect(decodedResult.isOk()).toBe(true);
      if (decodedResult.isOk()) {
        expect(decodedResult.value).toEqual(originalData);
      }
      
      // Convert to hex
      const hex = formatKeyAsHex(originalData.buffer);
      expect(hex).toBe('fffefdfc01020304');
    });

    it('should handle text-to-salt conversion consistency', () => {
      const text = 'my-application-salt-v1';
      
      const salt1 = textToSalt(text);
      const salt2 = textToSalt(text);
      
      // Same text should produce same salt
      expect(salt1).toEqual(salt2);
      
      // Different text should produce different salt
      const salt3 = textToSalt('different-salt');
      expect(salt1).not.toEqual(salt3);
    });
  });
});