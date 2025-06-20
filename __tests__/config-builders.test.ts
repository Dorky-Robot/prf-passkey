import {
  createRegistrationConfig,
  createAuthenticationConfig,
  WebAuthnConfig,
  RegistrationOptions,
  AuthenticationOptions,
  textToSalt,
  randomChallenge,
  randomUserId
} from '../src/index';

// Mock window.location for tests
Object.defineProperty(window, 'location', {
  value: {
    hostname: 'test.example.com'
  },
  writable: true
});

describe('Configuration Builders', () => {
  const mockConfig: WebAuthnConfig = {
    rpName: 'Test App',
    rpId: 'test.example.com',
    timeout: 30000,
    userVerification: 'required',
    residentKey: 'required'
  };

  const mockRegistrationOptions: RegistrationOptions = {
    userId: randomUserId(),
    userName: 'test@example.com',
    userDisplayName: 'Test User',
    challenge: randomChallenge(),
    salt: textToSalt('test-salt')
  };

  const mockAuthOptions: AuthenticationOptions = {
    credentialId: new Uint8Array([1, 2, 3, 4]),
    challenge: randomChallenge(),
    salt: textToSalt('test-salt')
  };

  describe('createRegistrationConfig', () => {
    it('should create valid PublicKeyCredentialCreationOptions', () => {
      const result = createRegistrationConfig(mockConfig, mockRegistrationOptions);

      expect(result.challenge).toBe(mockRegistrationOptions.challenge);
      expect(result.rp.name).toBe(mockConfig.rpName);
      expect(result.rp.id).toBe(mockConfig.rpId);
      expect(result.user.id).toBe(mockRegistrationOptions.userId);
      expect(result.user.name).toBe(mockRegistrationOptions.userName);
      expect(result.user.displayName).toBe(mockRegistrationOptions.userDisplayName);
      expect(result.timeout).toBe(mockConfig.timeout);
      expect(result.attestation).toBe('none');
    });

    it('should include PRF extension', () => {
      const result = createRegistrationConfig(mockConfig, mockRegistrationOptions);

      expect(result.extensions).toBeDefined();
      expect(result.extensions?.prf).toBeDefined();
      expect(result.extensions?.prf?.eval?.first).toBe(mockRegistrationOptions.salt);
    });

    it('should use default rpId when not provided', () => {
      const configWithoutRpId: WebAuthnConfig = {
        rpName: 'Test App'
      };

      const result = createRegistrationConfig(configWithoutRpId, mockRegistrationOptions);

      expect(result.rp.id).toBe('test.example.com'); // from mocked window.location
    });

    it('should use default values for optional fields', () => {
      const minimalConfig: WebAuthnConfig = {
        rpName: 'Test App'
      };

      const result = createRegistrationConfig(minimalConfig, mockRegistrationOptions);

      expect(result.authenticatorSelection?.userVerification).toBe('required');
      expect(result.authenticatorSelection?.residentKey).toBe('required');
      expect(result.timeout).toBe(60000);
    });

    it('should include correct pubKeyCredParams', () => {
      const result = createRegistrationConfig(mockConfig, mockRegistrationOptions);

      expect(result.pubKeyCredParams).toEqual([{ type: "public-key", alg: -7 }]);
    });
  });

  describe('createAuthenticationConfig', () => {
    it('should create valid PublicKeyCredentialRequestOptions', () => {
      const result = createAuthenticationConfig(mockConfig, mockAuthOptions);

      expect(result.challenge).toBe(mockAuthOptions.challenge);
      expect(result.rpId).toBe(mockConfig.rpId);
      expect(result.userVerification).toBe(mockConfig.userVerification);
    });

    it('should include PRF extension', () => {
      const result = createAuthenticationConfig(mockConfig, mockAuthOptions);

      expect(result.extensions).toBeDefined();
      expect(result.extensions?.prf).toBeDefined();
      expect(result.extensions?.prf?.eval?.first).toBe(mockAuthOptions.salt);
    });

    it('should include correct allowCredentials', () => {
      const result = createAuthenticationConfig(mockConfig, mockAuthOptions);

      expect(result.allowCredentials).toHaveLength(1);
      expect(result.allowCredentials?.[0]).toEqual({
        type: "public-key",
        id: mockAuthOptions.credentialId,
        transports: ["internal"]
      });
    });

    it('should use default rpId when not provided', () => {
      const configWithoutRpId: WebAuthnConfig = {
        rpName: 'Test App'
      };

      const result = createAuthenticationConfig(configWithoutRpId, mockAuthOptions);

      expect(result.rpId).toBe('test.example.com'); // from mocked window.location
    });

    it('should use default userVerification when not provided', () => {
      const minimalConfig: WebAuthnConfig = {
        rpName: 'Test App'
      };

      const result = createAuthenticationConfig(minimalConfig, mockAuthOptions);

      expect(result.userVerification).toBe('required');
    });
  });
});