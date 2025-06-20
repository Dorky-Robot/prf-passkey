import { Result } from 'neverthrow';
export { Result, ok, err } from 'neverthrow';
export declare const arrayBufferToBase64url: (buffer: ArrayBuffer) => string;
export declare const base64urlToUint8Array: (base64url: string) => Result<Uint8Array, Error>;
export declare const formatKeyAsHex: (arrayBuffer: ArrayBuffer) => string;
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
export declare const createRegistrationConfig: (config: WebAuthnConfig, options: RegistrationOptions) => PublicKeyCredentialCreationOptions;
export declare const createAuthenticationConfig: (config: WebAuthnConfig, options: AuthenticationOptions) => PublicKeyCredentialRequestOptions;
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
export declare const processRegistrationResult: (credential: PublicKeyCredential) => RegistrationResult;
export declare const processAuthenticationResult: (assertion: PublicKeyCredential) => Result<AuthenticationResult, Error>;
export declare const registerPasskey: (config: WebAuthnConfig, options: RegistrationOptions) => () => Promise<Result<RegistrationResult, Error>>;
export declare const authenticateAndDeriveKey: (config: WebAuthnConfig, options: AuthenticationOptions) => () => Promise<Result<AuthenticationResult, Error>>;
export declare const textToSalt: (text: string) => Uint8Array;
export declare const randomSalt: (length?: number) => Uint8Array;
export declare const randomChallenge: (length?: number) => Uint8Array;
export declare const randomUserId: (length?: number) => Uint8Array;
export declare const deriveKeyFromRegistration: (config: WebAuthnConfig, userId: Uint8Array, userName: string, userDisplayName: string, salt: Uint8Array) => () => Promise<Result<{
    registration: RegistrationResult;
    derivedKey?: AuthenticationResult;
}, Error>>;
