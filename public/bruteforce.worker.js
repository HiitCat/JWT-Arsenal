const ALGORITHM_PARAMS = {
  "HS256": "SHA-256",
  "HS384": "SHA-384",
  "HS512": "SHA-512",
};

const FALLBACK_WORDLIST = [
  "secret", "password", "123456", "12345", "letmein", "admin", "test", "qwerty",
  "abc123", "changeme", "secret123", "password123", "mysecret", "supersecret",
  "jwt_secret", "jwt-secret", "your-secret", "signing_key", "auth_secret",
  "token_secret", "api_secret", "jwtSecret", "privatekey", "private_key",
  "app_secret", "app-secret", "master", "master_key", "masterkey", "key",
  "secure", "security", "passw0rd", "p@ssword", "p@ss", "s3cr3t", "s3cur3",
  "hello", "world", "welcome", "login", "access", "pass", "guest", "root",
  "toor", "1234", "0000", "1111", "9999", "1234567890", "qwerty123", "azerty",
  "azerty123", "football", "baseball", "dragon", "monkey", "shadow", "sunshine",
  "princess", "iloveyou", "trustno1", "letmein123", "admin123", "administrator",
  "superuser", "service", "webmaster", "info", "support", "manager", "operator",
  "user", "test123", "demo", "sample", "example", "default", "config", "setup",
  "install", "deploy", "production", "staging", "development", "dev", "prod",
  "api", "apikey", "api_key", "token", "tokens", "jwt", "jwtsecret", "hs256",
  "hs384", "hs512", "rsa", "symmetric", "asymmetric", "encode", "decode",
  "verify", "validate", "authenticate", "authorization", "oauth", "openid",
];

const ENC = new TextEncoder();
const BATCH_SIZE = 100;
const REPORT_EVERY = 2000;

function base64urlToBytes(s) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

async function hmacDigest(hashAlg, messageBytes, secret) {
  const sk = ENC.encode(secret);
  const key = await crypto.subtle.importKey(
    "raw", sk, { name: "HMAC", hash: hashAlg }, false, ["sign"]
  );
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, messageBytes));
}

async function loadWordlist(wordlistUrl) {
  if (!wordlistUrl) return FALLBACK_WORDLIST;
  self.postMessage({ type: "downloading" });
  try {
    const res = await fetch(wordlistUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (wordlistUrl.startsWith("blob:")) URL.revokeObjectURL(wordlistUrl);
    return text.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
  } catch {
    self.postMessage({ type: "warning", message: "Failed to fetch wordlist - using built-in fallback." });
    return FALLBACK_WORDLIST;
  }
}

async function bruteforceHmac(jwt, algorithm, wordlistUrl) {
  const params = ALGORITHM_PARAMS[algorithm];
  if (!params) { self.postMessage({ type: "error", message: `Unsupported: ${algorithm}` }); return; }

  const wordlist = await loadWordlist(wordlistUrl);
  const total = wordlist.length;
  self.postMessage({ type: "ready", total });

  const parts = jwt.split(".");
  if (parts.length !== 3) { self.postMessage({ type: "error", message: "Invalid JWT" }); return; }

  const messageBytes = ENC.encode(`${parts[0]}.${parts[1]}`);
  const signatureBytes = base64urlToBytes(parts[2]);
  let lastReport = 0;
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = wordlist.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(
      batch.map(secret => hmacDigest(params, messageBytes, secret))
    );

    for (let j = 0; j < results.length; j++) {
      if (bytesEqual(results[j], signatureBytes)) {
        self.postMessage({ type: "found", secret: batch[j], index: i + j, total });
        return;
      }
    }

    const processed = Math.min(i + BATCH_SIZE, total);
    if (processed - lastReport >= REPORT_EVERY || processed === total) {
      self.postMessage({ type: "progress", index: processed, total });
      lastReport = processed;
    }
  }

  self.postMessage({ type: "done", found: false, total });
}

self.addEventListener("message", (event) => {
  const { type, jwt, algorithm, wordlistUrl } = event.data;
  if (type === "start") {
    if (!jwt || !algorithm) { self.postMessage({ type: "error", message: "Missing jwt or algorithm" }); return; }
    bruteforceHmac(jwt, algorithm, wordlistUrl).catch(err => {
      self.postMessage({ type: "error", message: err.message });
    });
  }
});
