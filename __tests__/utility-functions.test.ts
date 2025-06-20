import {
  arrayBufferToBase64url,
  base64urlToUint8Array,
  formatKeyAsHex,
  textToSalt,
  randomSalt,
  randomChallenge,
  randomUserId
} from '../src/index';

describe('Utility Functions', () => {
  describe('arrayBufferToBase64url', () => {
    it('should convert ArrayBuffer to base64url string', () => {
      const buffer = new Uint8Array([1, 2, 3, 4, 5]).buffer;
      const result = arrayBufferToBase64url(buffer);
      
      expect(typeof result).toBe('string');
      expect(result).toBe('AQIDBAU');
    });

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = arrayBufferToBase64url(buffer);
      
      expect(result).toBe('');
    });
  });

  describe('base64urlToUint8Array', () => {
    it('should convert base64url string to Uint8Array', () => {
      const base64url = 'AQIDBAU';
      const result = base64urlToUint8Array(base64url);
      
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
      }
    });

    it('should handle empty string', () => {
      const result = base64urlToUint8Array('');
      
      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(new Uint8Array([]));
      }
    });

    it('should handle edge cases gracefully', () => {
      // Test with valid but unusual input
      const result = base64urlToUint8Array('');
      expect(result.isOk()).toBe(true);
      
      // Note: Invalid base64url handling is tested in integration tests
      // as it depends on the underlying SimpleWebAuthn implementation
    });
  });

  describe('formatKeyAsHex', () => {
    it('should convert ArrayBuffer to hex string', () => {
      const buffer = new Uint8Array([255, 0, 15, 16]).buffer;
      const result = formatKeyAsHex(buffer);
      
      expect(result).toBe('ff000f10');
    });

    it('should handle empty ArrayBuffer', () => {
      const buffer = new ArrayBuffer(0);
      const result = formatKeyAsHex(buffer);
      
      expect(result).toBe('');
    });

    it('should pad single digit hex values with zero', () => {
      const buffer = new Uint8Array([1, 2, 3]).buffer;
      const result = formatKeyAsHex(buffer);
      
      expect(result).toBe('010203');
    });
  });

  describe('textToSalt', () => {
    it('should convert text to Uint8Array', () => {
      const text = 'test-salt';
      const result = textToSalt(text);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(9); // 'test-salt' is 9 characters
    });

    it('should handle empty string', () => {
      const result = textToSalt('');
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(0);
    });

    it('should handle unicode characters', () => {
      const text = '🔐test';
      const result = textToSalt(text);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBeGreaterThan(4); // emoji takes more than 1 byte
    });
  });

  describe('randomSalt', () => {
    it('should generate random salt with default length', () => {
      const result = randomSalt();
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32);
    });

    it('should generate random salt with custom length', () => {
      const length = 16;
      const result = randomSalt(length);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(length);
    });

    it('should generate different values on each call', () => {
      const salt1 = randomSalt(8);
      const salt2 = randomSalt(8);
      
      expect(salt1).not.toEqual(salt2);
    });
  });

  describe('randomChallenge', () => {
    it('should generate random challenge with default length', () => {
      const result = randomChallenge();
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32);
    });

    it('should generate random challenge with custom length', () => {
      const length = 64;
      const result = randomChallenge(length);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(length);
    });

    it('should generate different values on each call', () => {
      const challenge1 = randomChallenge(16);
      const challenge2 = randomChallenge(16);
      
      expect(challenge1).not.toEqual(challenge2);
    });
  });

  describe('randomUserId', () => {
    it('should generate random user ID with default length', () => {
      const result = randomUserId();
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(16);
    });

    it('should generate random user ID with custom length', () => {
      const length = 32;
      const result = randomUserId(length);
      
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(length);
    });

    it('should generate different values on each call', () => {
      const userId1 = randomUserId(8);
      const userId2 = randomUserId(8);
      
      expect(userId1).not.toEqual(userId2);
    });
  });
});