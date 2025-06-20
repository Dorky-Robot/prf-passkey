import {
  registerPasskey,
  authenticateAndDeriveKey,
  textToSalt,
  randomChallenge,
  randomUserId
} from '../dist/index.esm.js';

// Basic usage example
async function basicExample() {
  console.log('🔐 WebAuthn PRF Basic Example');
  
  // Configuration
  const config = {
    rpName: 'My App',
    rpId: 'localhost',
    userVerification: 'required'
  };
  
  // User data
  const userId = randomUserId();
  const userName = 'john@example.com';
  const userDisplayName = 'John Doe';
  const salt = textToSalt('my-app-encryption-key-v1');
  
  console.log('📝 Registering passkey...');
  
  // Register passkey
  const registrationResult = await registerPasskey(config, {
    userId,
    userName,
    userDisplayName,
    challenge: randomChallenge(),
    salt
  })();
  
  if (registrationResult.isErr()) {
    console.error('❌ Registration failed:', registrationResult.error.message);
    return;
  }
  
  const registration = registrationResult.value;
  console.log('✅ Registration successful');
  console.log('Credential ID:', registration.encodedId);
  console.log('PRF Key available:', registration.derivedKey ? 'Yes' : 'No');
  
  if (registration.derivedKey) {
    console.log('Derived Key:', registration.keyHex);
  }
  
  // If we didn't get a key during registration, authenticate to get it
  if (!registration.derivedKey) {
    console.log('🔑 Authenticating to derive key...');
    
    const authResult = await authenticateAndDeriveKey(config, {
      credentialId: new Uint8Array(registration.credentialId),
      challenge: randomChallenge(),
      salt
    })();
    
    if (authResult.isErr()) {
      console.error('❌ Authentication failed:', authResult.error.message);
      return;
    }
    
    console.log('✅ Authentication successful');
    console.log('Derived Key:', authResult.value.keyHex);
  }
}

// Run the example
if (typeof window !== 'undefined') {
  // Browser environment
  window.runBasicExample = basicExample;
  console.log('Example loaded. Call runBasicExample() to start.');
} else {
  // Node environment - just export the function
  export { basicExample };
}