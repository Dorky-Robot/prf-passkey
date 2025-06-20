import { Result, ok, err } from 'neverthrow';
import { 
  base64URLStringToBuffer, 
  bufferToBase64URLString
} from '@simplewebauthn/browser';

// Re-export neverthrow Result types and utilities for convenience
export { Result, ok, err } from 'neverthrow';

// Utility functions using SimpleWebAuthn
export const arrayBufferToBase64url = (buffer: ArrayBuffer): string =>
  bufferToBase64URLString(buffer);

export const base64urlToUint8Array = (base64url: string): Result<Uint8Array, Error> => {
  try {
    const buffer = base64URLStringToBuffer(base64url);
    return ok(new Uint8Array(buffer));
  } catch (error) {
    return err(new Error(`Invalid base64url: ${error instanceof Error ? error.message : String(error)}`));
  }
};

export const formatKeyAsHex = (arrayBuffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(arrayBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

// Configuration types and builders
export interface WebAuthnConfig {
  rpName: string;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
  residentKey?: ResidentKeyRequirement;
}

export interface RegistrationOptions {
  userId: Uint8Array;
  userName: string;
  userDisplayName: string;
  challenge: Uint8Array;
  salt: Uint8Array;
}

export interface AuthenticationOptions {
  credentialId: Uint8Array;
  challenge: Uint8Array;
  salt: Uint8Array;
}

export const createRegistrationConfig = (
  config: WebAuthnConfig,
  options: RegistrationOptions
): PublicKeyCredentialCreationOptions => ({
  challenge: options.challenge,
  rp: { 
    name: config.rpName, 
    id: config.rpId || window?.location?.hostname || 'localhost' 
  },
  user: {
    id: options.userId,
    name: options.userName,
    displayName: options.userDisplayName
  },
  pubKeyCredParams: [{ type: "public-key", alg: -7 }],
  authenticatorSelection: {
    userVerification: config.userVerification || "required",
    residentKey: config.residentKey || "required"
  },
  timeout: config.timeout || 60000,
  attestation: "none",
  extensions: {
    prf: { eval: { first: options.salt } }
  }
});

export const createAuthenticationConfig = (
  config: WebAuthnConfig,
  options: AuthenticationOptions
): PublicKeyCredentialRequestOptions => ({
  challenge: options.challenge,
  rpId: config.rpId || window?.location?.hostname || 'localhost',
  allowCredentials: [{
    type: "public-key",
    id: options.credentialId,
    transports: ["internal"]
  }],
  userVerification: config.userVerification || "required",
  extensions: {
    prf: { eval: { first: options.salt } }
  }
});

// Result types
export interface RegistrationResult {
  credentialId: ArrayBuffer;
  encodedId: string;
  derivedKey: ArrayBuffer | null;
  keyHex: string | null;
}

export interface AuthenticationResult {
  derivedKey: ArrayBuffer;
  keyHex: string;
}

// Core library functions
export const processRegistrationResult = (credential: PublicKeyCredential): RegistrationResult => {
  const prfResult = credential.getClientExtensionResults().prf?.results?.first;
  return {
    credentialId: credential.rawId,
    encodedId: arrayBufferToBase64url(credential.rawId),
    derivedKey: prfResult ? (prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength)) : null,
    keyHex: prfResult ? formatKeyAsHex(prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength)) : null
  };
};

export const processAuthenticationResult = (assertion: PublicKeyCredential): Result<AuthenticationResult, Error> => {
  const prfResult = assertion.getClientExtensionResults().prf?.results?.first;
  if (!prfResult) {
    return err(new Error("PRF result missing from authentication assertion"));
  }
  const derivedKey = prfResult instanceof ArrayBuffer ? prfResult : prfResult.buffer.slice(prfResult.byteOffset, prfResult.byteOffset + prfResult.byteLength);
  return ok({
    derivedKey,
    keyHex: formatKeyAsHex(derivedKey)
  });
};

// Main monadic functions
export const registerPasskey = (
  config: WebAuthnConfig,
  options: RegistrationOptions
) => async (): Promise<Result<RegistrationResult, Error>> => {
  try {
    const creationOptions = createRegistrationConfig(config, options);
    const credential = await navigator.credentials.create({ 
      publicKey: creationOptions 
    }) as PublicKeyCredential | null;
    
    if (!credential) {
      return err(new Error("Failed to create credential"));
    }
    
    return ok(processRegistrationResult(credential));
  } catch (error) {
    return err(new Error(`Registration failed: ${error instanceof Error ? error.message : String(error)}`));
  }
};

export const authenticateAndDeriveKey = (
  config: WebAuthnConfig,
  options: AuthenticationOptions
) => async (): Promise<Result<AuthenticationResult, Error>> => {
  try {
    const requestOptions = createAuthenticationConfig(config, options);
    const assertion = await navigator.credentials.get({ 
      publicKey: requestOptions 
    }) as PublicKeyCredential | null;
    
    if (!assertion) {
      return err(new Error("Failed to get assertion"));
    }
    
    return processAuthenticationResult(assertion);
  } catch (error) {
    return err(new Error(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`));
  }
};

// Utility functions for salt creation
export const textToSalt = (text: string): Uint8Array =>
  new TextEncoder().encode(text);

export const randomSalt = (length: number = 32): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(length));

export const randomChallenge = (length: number = 32): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(length));

export const randomUserId = (length: number = 16): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(length));

// Higher-order function for combining operations
export const deriveKeyFromRegistration = (
  config: WebAuthnConfig,
  userId: Uint8Array,
  userName: string,
  userDisplayName: string,
  salt: Uint8Array
) => async (): Promise<Result<{ registration: RegistrationResult; derivedKey?: AuthenticationResult }, Error>> => {
  const challenge = randomChallenge();
  
  const registrationResult = await registerPasskey(config, {
    userId,
    userName, 
    userDisplayName,
    challenge,
    salt
  })();
  
  if (registrationResult.isErr()) {
    return err(registrationResult.error);
  }
  
  const registration = registrationResult.value;
  
  // If PRF was supported during registration, we already have the key
  if (registration.derivedKey) {
    return ok({ 
      registration,
      derivedKey: {
        derivedKey: registration.derivedKey,
        keyHex: registration.keyHex || ''
      }
    });
  }
  
  // Otherwise, authenticate to derive the key
  const credentialIdResult = base64urlToUint8Array(registration.encodedId);
  if (credentialIdResult.isErr()) {
    return err(new Error(`Failed to decode credential ID: ${credentialIdResult.error.message}`));
  }
  
  const credentialId = credentialIdResult.value;
  
  const authResult = await authenticateAndDeriveKey(config, {
    credentialId,
    challenge: randomChallenge(),
    salt
  })();
  
  if (authResult.isErr()) {
    return err(authResult.error);
  }
  
  return ok({ 
    registration, 
    derivedKey: authResult.value 
  });
};