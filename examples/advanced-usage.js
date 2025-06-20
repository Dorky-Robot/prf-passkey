import {
  deriveKeyFromRegistration,
  authenticateAndDeriveKey,
  textToSalt,
  randomUserId
} from '../dist/index.esm.js';

// Advanced usage with monadic composition
async function advancedExample() {
  console.log('🚀 WebAuthn PRF Advanced Example with Monadic Patterns');
  
  const config = {
    rpName: 'Advanced App',
    rpId: 'localhost',
    userVerification: 'required',
    timeout: 120000
  };
  
  // Multiple salt scenarios
  const salts = {
    encryption: textToSalt('encryption-key-v1'),
    signing: textToSalt('signing-key-v1'),
    storage: textToSalt('storage-key-v1')
  };
  
  const userId = randomUserId();
  const userName = 'alice@example.com';
  const userDisplayName = 'Alice Smith';
  
  console.log('🔐 Registering passkey and deriving encryption key...');
  
  // Use the higher-order function for streamlined registration + key derivation
  const encryptionKeyResult = await deriveKeyFromRegistration(
    config,
    userId,
    userName,
    userDisplayName,
    salts.encryption
  )();
  
  if (encryptionKeyResult.isErr()) {
    console.error('❌ Failed to setup encryption key:', encryptionKeyResult.error.message);
    return;
  }
  
  const encryptionSetup = encryptionKeyResult.value;
  console.log('✅ Encryption key registration complete');
  console.log('Credential ID:', encryptionSetup.registration.encodedId);
  
  if (encryptionSetup.derivedKey) {
    console.log('🔑 Encryption Key:', encryptionSetup.derivedKey.keyHex);
  }
  
  // Now derive additional keys for different purposes
  console.log('🔐 Deriving additional keys for signing and storage...');
  
  const credentialId = new Uint8Array(encryptionSetup.registration.credentialId);
  
  // Derive signing key
  const deriveSigningKey = () => authenticateAndDeriveKey(config, {
    credentialId,
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    salt: salts.signing
  })();
  
  // Derive storage key  
  const deriveStorageKey = () => authenticateAndDeriveKey(config, {
    credentialId,
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    salt: salts.storage
  })();
  
  // Use Promise.all to derive keys in parallel
  try {
    const [signingResult, storageResult] = await Promise.all([
      deriveSigningKey(),
      deriveStorageKey()
    ]);
    
    if (signingResult.isErr()) {
      console.error('❌ Signing key derivation failed:', signingResult.error.message);
      return;
    }
    
    if (storageResult.isErr()) {
      console.error('❌ Storage key derivation failed:', storageResult.error.message);
      return;
    }
    
    console.log('✅ Signing Key:', signingResult.value.keyHex);
    console.log('✅ Storage Key:', storageResult.value.keyHex);
    
    console.log('🎉 All keys derived successfully!');
    console.log('You now have three different cryptographic keys:');
    console.log('- Encryption:', encryptionSetup.derivedKey?.keyHex);
    console.log('- Signing:', signingResult.value.keyHex);
    console.log('- Storage:', storageResult.value.keyHex);
    
  } catch (error) {
    console.error('❌ Parallel key derivation failed:', error);
  }
}

// Error handling with monadic composition example
async function errorHandlingExample() {
  console.log('⚠️  WebAuthn PRF Error Handling Example');
  
  const config = {
    rpName: 'Error Demo',
    rpId: 'localhost'
  };
  
  // This will likely fail because we're using a non-existent credential
  const invalidCredentialId = new Uint8Array([1, 2, 3, 4, 5]);
  
  const authResult = await authenticateAndDeriveKey(config, {
    credentialId: invalidCredentialId,
    challenge: crypto.getRandomValues(new Uint8Array(32)),
    salt: textToSalt('test-salt')
  })();
  
  if (authResult.isOk()) {
    console.log('Unexpected success:', authResult.value);
  } else {
    console.log('Expected error handled gracefully:', authResult.error.message);
  }
}

// Export functions for different environments
if (typeof window !== 'undefined') {
  window.runAdvancedExample = advancedExample;
  window.runErrorHandlingExample = errorHandlingExample;
  console.log('Advanced examples loaded. Call runAdvancedExample() or runErrorHandlingExample()');
} else {
  export { advancedExample, errorHandlingExample };
}