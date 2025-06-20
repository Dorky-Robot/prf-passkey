import {
  processRegistrationResult,
  processAuthenticationResult
} from '../src/index';

describe('Result Processors', () => {
  describe('processRegistrationResult', () => {
    it('should process registration result with PRF data', () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: new Uint8Array([255, 254, 253, 252]).buffer
            }
          }
        })
      } as unknown as PublicKeyCredential;

      const result = processRegistrationResult(mockCredential);

      expect(result.credentialId).toBe(mockCredential.rawId);
      expect(result.encodedId).toBe('AQIDBA'); // base64url of [1,2,3,4]
      expect(result.derivedKey).toEqual(new Uint8Array([255, 254, 253, 252]).buffer);
      expect(result.keyHex).toBe('fffefdfc'); // hex of [255,254,253,252]
    });

    it('should process registration result without PRF data', () => {
      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        getClientExtensionResults: () => ({})
      } as unknown as PublicKeyCredential;

      const result = processRegistrationResult(mockCredential);

      expect(result.credentialId).toBe(mockCredential.rawId);
      expect(result.encodedId).toBe('AQIDBA');
      expect(result.derivedKey).toBeNull();
      expect(result.keyHex).toBeNull();
    });

    it('should handle PRF result as ArrayBufferView', () => {
      const arrayBuffer = new ArrayBuffer(4);
      const view = new Uint8Array(arrayBuffer);
      view.set([255, 254, 253, 252]);

      const mockCredential = {
        rawId: new Uint8Array([1, 2, 3, 4]).buffer,
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: view // ArrayBufferView instead of ArrayBuffer
            }
          }
        })
      } as unknown as PublicKeyCredential;

      const result = processRegistrationResult(mockCredential);

      expect(result.derivedKey).toBeInstanceOf(ArrayBuffer);
      expect(result.keyHex).toBe('fffefdfc');
    });
  });

  describe('processAuthenticationResult', () => {
    it('should process authentication result with PRF data', () => {
      const prfBuffer = new Uint8Array([255, 254, 253, 252]).buffer;
      
      const mockAssertion = {
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: prfBuffer
            }
          }
        })
      } as unknown as PublicKeyCredential;

      const result = processAuthenticationResult(mockAssertion);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.derivedKey).toBe(prfBuffer);
        expect(result.value.keyHex).toBe('fffefdfc');
      }
    });

    it('should return error when PRF data is missing', () => {
      const mockAssertion = {
        getClientExtensionResults: () => ({})
      } as unknown as PublicKeyCredential;

      const result = processAuthenticationResult(mockAssertion);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('PRF result missing from authentication assertion');
      }
    });

    it('should handle PRF result as ArrayBufferView', () => {
      const arrayBuffer = new ArrayBuffer(4);
      const view = new Uint8Array(arrayBuffer);
      view.set([255, 254, 253, 252]);

      const mockAssertion = {
        getClientExtensionResults: () => ({
          prf: {
            results: {
              first: view // ArrayBufferView instead of ArrayBuffer
            }
          }
        })
      } as unknown as PublicKeyCredential;

      const result = processAuthenticationResult(mockAssertion);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.derivedKey).toBeInstanceOf(ArrayBuffer);
        expect(result.value.keyHex).toBe('fffefdfc');
      }
    });

    it('should return error when PRF results object is missing', () => {
      const mockAssertion = {
        getClientExtensionResults: () => ({
          prf: {} // Missing results
        })
      } as unknown as PublicKeyCredential;

      const result = processAuthenticationResult(mockAssertion);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe('PRF result missing from authentication assertion');
      }
    });
  });
});