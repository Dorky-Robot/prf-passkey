// Pure utility functions
const arrayBufferToBase64url = (buffer) => {
  const binary = String.fromCharCode(...new Uint8Array(buffer));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const base64urlToUint8Array = (base64url) => {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    + '=='.slice(0, (4 - base64url.length % 4) % 4);
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
};

const formatKeyAsHex = (arrayBuffer) => 
  Array.from(new Uint8Array(arrayBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

// Pure configuration builders
const createRegistrationConfig = (userId, challenge) => ({
  challenge,
  rp: { name: "Local RP", id: window.location.hostname },
  user: {
    id: userId,
    name: "user@example.com",
    displayName: "Example User"
  },
  pubKeyCredParams: [{ type: "public-key", alg: -7 }],
  authenticatorSelection: {
    userVerification: "required",
    residentKey: "required"
  },
  timeout: 60000,
  attestation: "none",
  extensions: {
    prf: { eval: { first: new TextEncoder().encode("kita-health-root-v1") } }
  }
});

const createAuthenticationConfig = (credentialId, challenge, salt) => ({
  challenge,
  rpId: window.location.hostname,
  allowCredentials: [{
    type: "public-key",
    id: credentialId,
    transports: ["internal"]
  }],
  userVerification: "required",
  extensions: {
    prf: { eval: { first: salt } }
  }
});

// Pure business logic functions
const processRegistrationResult = (credential) => {
  const prfResult = credential.getClientExtensionResults().prf?.results?.first;
  return {
    credentialId: credential.rawId,
    encodedId: arrayBufferToBase64url(credential.rawId),
    derivedKey: prfResult,
    keyHex: prfResult ? formatKeyAsHex(prfResult) : null
  };
};

const processAuthenticationResult = (assertion) => {
  const prfResult = assertion.getClientExtensionResults().prf?.results?.first;
  if (!prfResult) {
    throw new Error("PRF result missing");
  }
  return {
    derivedKey: prfResult,
    keyHex: formatKeyAsHex(prfResult)
  };
};

// Side effect functions (state at edges)
const saveCredentialId = (encodedId) => {
  localStorage.setItem("webauthn_cred_id", encodedId);
};

const loadCredentialId = () => 
  localStorage.getItem("webauthn_cred_id");

const logOutput = (outputElement, ...args) => {
  outputElement.textContent += args
    .map(a => typeof a === 'string' ? a : JSON.stringify(a))
    .join(' ') + "\n";
};

// Main application functions (orchestrating pure functions with side effects)
const registerPasskey = async (outputElement) => {
  const userId = crypto.getRandomValues(new Uint8Array(16));
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  
  const config = createRegistrationConfig(userId, challenge);
  
  try {
    const credential = await navigator.credentials.create({ publicKey: config });
    const result = processRegistrationResult(credential);
    
    saveCredentialId(result.encodedId);
    logOutput(outputElement, "✅ Passkey registered");
    logOutput(outputElement, "Credential ID (Base64URL):", result.encodedId);
    if (result.keyHex) {
      logOutput(outputElement, "✅ Deterministic key derived:");
      logOutput(outputElement, result.keyHex);
    }
  } catch (err) {
    logOutput(outputElement, "❌ Registration failed:", err.message);
  }
};

const deriveKeyWithPRF = async (outputElement) => {
  const encodedId = loadCredentialId();
  if (!encodedId) {
    logOutput(outputElement, "❌ No credential ID found. Register first.");
    return;
  }

  const credentialId = base64urlToUint8Array(encodedId);
  const challenge = crypto.getRandomValues(new Uint8Array(32));
  const salt = new TextEncoder().encode("kita-health-root-v1");
  
  const config = createAuthenticationConfig(credentialId, challenge, salt);
  
  try {
    const assertion = await navigator.credentials.get({ publicKey: config });
    const result = processAuthenticationResult(assertion);
    
    logOutput(outputElement, "✅ Deterministic key derived:");
    logOutput(outputElement, result.keyHex);
  } catch (err) {
    logOutput(outputElement, "❌ Derivation failed:", err.message);
  }
};

// Application initialization (state at edge)
const initializeApp = () => {
  const outputElement = document.getElementById("output");
  const registerButton = document.getElementById("register");
  const deriveButton = document.getElementById("derive");
  
  registerButton.onclick = () => registerPasskey(outputElement);
  deriveButton.onclick = () => deriveKeyWithPRF(outputElement);
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}