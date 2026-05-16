import { SignJWT, importPKCS8 } from "jose";

export type JwtExample = {
  label: string;
  alg: string;
  category: "unsigned" | "hmac" | "rsa" | "pss" | "ec" | "okp";
  secret?: string;
  publicKey?: string;
  privateKey?: string;
  jwk?: Record<string, unknown>;
};

const EXAMPLE_PAYLOAD = { sub: "user_42", username: "alice", role: "user" };

function b64url(obj: unknown): string {
  return btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

export async function generateExampleToken(example: JwtExample): Promise<string> {
  const payload = { ...EXAMPLE_PAYLOAD, iat: Math.floor(Date.now() / 1000) - 15 * 60 };

  if (example.category === "unsigned") {
    return `${b64url({ alg: "none", typ: "JWT" })}.${b64url(payload)}.`;
  }

  const jwt = new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: example.alg, typ: "JWT" });

  if (example.category === "hmac") {
    return jwt.sign(new TextEncoder().encode(example.secret!));
  }

  return jwt.sign(await importPKCS8(example.privateKey!, example.alg));
}

export const JWT_EXAMPLE_CONFIGS: JwtExample[] = [
  { "label": "none",  "alg": "none",  "category": "unsigned" },
  { "label": "HS256", "alg": "HS256", "secret": "arsenal-hs256-secret", "category": "hmac" },
  { "label": "HS384", "alg": "HS384", "secret": "arsenal-hs384-secret", "category": "hmac" },
  { "label": "HS512", "alg": "HS512", "secret": "arsenal-hs512-secret", "category": "hmac" },
  {
    "label": "RS256",
    "alg": "RS256",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAlbU8hUjVmD1VkjY9RbZc\nYjMK49FcB6kl8APKHM72IWe1Ay3d0W+yhW3lBOiApWK4UR4veDfHoMza9MvCoIfd\n7EL6Gdg9L1eX/0eGsJ0E9ZrHu6UaELSI3kI/ZsZjeZw56+RQzioUrl3hwV/7r7FU\n0NkAcOCfnEOGC8YZWmFbp88lNfT3QE1bhnIMiIISu4BI979/eCF/1mOKa5K7dg7P\nkIBhObowoaQkbEsTD/fcvI/MMuucpJrlp9iLqwrFnjUqR84UVypmUKuIQkEHwNdg\nrUSTc03PSgW74kXamXnlxa++MTpRNEgdoZmjoJUATgVx8UIceJgkBdhOdz06j0kQ\nJwIDAQAB\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCVtTyFSNWYPVWS\nNj1FtlxiMwrj0VwHqSXwA8oczvYhZ7UDLd3Rb7KFbeUE6IClYrhRHi94N8egzNr0\ny8Kgh93sQvoZ2D0vV5f/R4awnQT1mse7pRoQtIjeQj9mxmN5nDnr5FDOKhSuXeHB\nX/uvsVTQ2QBw4J+cQ4YLxhlaYVunzyU19PdATVuGcgyIghK7gEj3v394IX/WY4pr\nkrt2Ds+QgGE5ujChpCRsSxMP99y8j8wy65ykmuWn2IurCsWeNSpHzhRXKmZQq4hC\nQQfA12CtRJNzTc9KBbviRdqZeeXFr74xOlE0SB2hmaOglQBOBXHxQhx4mCQF2E53\nPTqPSRAnAgMBAAECggEACY8LYLVAUhqkcpP9AIz+xBRfPyGYfzK5JeSQDJvYUlS1\nVZEhpyQ7IVLdex0/TZAKlb9YJ5RkLiu2VUgHUsmqDVJPdsP8UCAHJ/kQrAkyjl4G\nH8CQc/2a+ZoAQ1cqddLYTewDjs5YCLQc3IR85QBtGnKomQx2lHspPWo2JzOtLv8t\nbGtNKiLdJFCd9aJntwnrfgWfaZmBhBqRaxQtbVBY7p/MoDAduH+J+ieaKnfsOVo+\ne3q1DoHiksOtwR461zBMkryi9GuYE9yXuwfMhG4Yc/05fKbkPDhl56spYn9sUkl0\nomsRT31BYdj6q4v7OaL3O1iEGX34KnzJOXDyWIae7QKBgQDK/Qvaopv6yzjSqrbL\nzuws98MAPNtFreI0PUZfnWRd9dfozw2uyrQecb3pVAYd9ir32r0aD4n/NIy/UtNZ\nrWhktab1dZs7p0TUgiEMq2mY8njodGwJyoCaMm0HlEbL4taJYw3IImX11qY48W0T\nzuIaiDnCjCSxOCmFrJfqEQYAbQKBgQC8zhRruSEp90je8LTVeQE3/hUvt4g7ON2A\nDF5/bAb17ylbgsNktjjTra0b51Bv7hm2edFs4aolhBL2asEi3kjyiN8aKrmvg0ba\ncCnMBhDzEbgH/nYLLFcWXWfDiFDvwIqJNVasVejU67CMRPjUoUOHei2NCZkf4Qxv\nZXoqkH6+YwKBgB1B18GNinndbLVAkdRSYMwiceLI4rnqVB4/brM9VkgMtTADF+/H\nm6p/rmXBDJio8IyE5JirALLd+iNhZsEYM2HApO3gI523gD44+1Z+Jlw7Jp4qmZ/X\npi2Tcw+SmZmtekqXEld0TcnfRFoUwioGuaQlWl3mISvB8oon1EWSapEJAoGAOCys\ngLyNNHpBsSs28ojVJv6u+QqHOu+ZX57OguT2UTf+Ox712cIpuDllVvcExLi358Xo\n3Jdr00uvhKeQnTo7xAWbM6LgqmrJqvZSSUTIyDlOYvp/zqU7qAjUdaXaRusnjNlU\n12OcKbWSSrm+uyzb9bQRV3QynfyMgZxUs9NYEncCgYBwITLs8bxe0nu7UJx+3Fho\nxZ54Ocpt2N0IrjMDqMccGIVTDSLbcrQuDYtTN/MdLzPvHynXXALZydx76M5te0BN\nEM+Nljeb3MP6hbagT8uUn2rJF7uvJwgMdqT6aeK8Pa2ROnhwVxhB1QdGjpNYOVtq\nRs9D5F5zn9KFytP6HflQFA==\n-----END PRIVATE KEY-----",
    "category": "rsa"
  },
  {
    "label": "RS384",
    "alg": "RS384",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxvcEK2+h45huC93xrCIR\n4kG43h2GfoIZNrqtbTSNVCxINlUBTzii91IjO+F6zOm3SxnmqTbXbZ8S2Vo8C0Wp\nv8C3VEeaa36X+vDRXNeLnPkhTM26Eum0qm9CvSScXTD1bHFdFjEt+375r5EZm313\nRQas3jRmN6Zm4CCX4r3rOWYpXpHyIMgkY2q2v8wCWtzZsMFkc0Mq10CQ5Y4Ky8hZ\ns5JXebkvaszSDQ+HaYBz5VQuGVJ9VtvPg+uPVfO+Y/UpLrgNUZKEVjeqQTbxSEji\nbPb23J3AsZ6bkVgShJrC5IJeHUCAUFhOeUjKiZwq6qlPTVbnVk3sUIrS6Ce6zJ9v\nrQIDAQAB\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDG9wQrb6HjmG4L\n3fGsIhHiQbjeHYZ+ghk2uq1tNI1ULEg2VQFPOKL3UiM74XrM6bdLGeapNtdtnxLZ\nWjwLRam/wLdUR5prfpf68NFc14uc+SFMzboS6bSqb0K9JJxdMPVscV0WMS37fvmv\nkRmbfXdFBqzeNGY3pmbgIJfives5ZilekfIgyCRjara/zAJa3NmwwWRzQyrXQJDl\njgrLyFmzkld5uS9qzNIND4dpgHPlVC4ZUn1W28+D649V875j9SkuuA1RkoRWN6pB\nNvFISOJs9vbcncCxnpuRWBKEmsLkgl4dQIBQWE55SMqJnCrqqU9NVudWTexQitLo\nJ7rMn2+tAgMBAAECggEAEtH1zS1bjl2c9za7b/wEXgxichwv3H1Dk6I32mRwrpLG\nZ+FFj5qnYPvzhOwGA3u4u1FhY1s30yY2EGTmg23HqfGO8IQaDsCkRqKLOJwo7XnB\nVR8BUrL+7xTkJrkKU2RYqrUpyCTHGTWAZRjgEmMH/6RV1hT1yvN3Yrb34a+eSvOn\nVRMoUunmfpY1YQDOEnRzQe5iJPQoUkxjN58hT70B6dTclHTg0Mnr2+NheHg4aLCK\nyNXmYqKsuwmWhNJDOdcivl/SOQ3XzKUNQHm7RsEuItxWrLXskCW5xcrFL3cCq+PX\nf8cftGOOdhVgT1TBQ7gZPYWUpB296YRRXQCx3azCDwKBgQDv6mm8rBha+0N9E551\nZYtCnsurF4wZTO27zJ3U6ayGowBiSrUW3mKkg6qwDos5w6p4rSsxGs8w1VkKIe3x\nwCVdZg8RGFPUuRLgOAIvi+vpLH9UJPkkOk4WbGuYeXfp3CjTiIVMoQ1TuT6mZBj0\nunlofiqTEObhAEYjgkQzt3McywKBgQDUTcekgR1F1PPcjGuyowyt3tDkU5MBf6rf\n45chk/a2v9GHjriN8+DwT0YaL2IE6WY5tIDN6nlEl9UrZvaX+fz2nvnjAP2DbYIY\nOMCIbLED54tqNXQlZLLlpSOGamlQRYy5qsc2fEZaiXsP8b0VeeDc67rSHLXUI3Im\nZIDCn3tOZwKBgQDhWIfqrKbPxlRUxjm/QRq1/5uD38E6/nQKQp45Hydq6u3wZQWF\nLmru5bFMXszM/AlCAj2giPL1hl900fvCZ91wxez+/J+5HgEp09HRwRZcVOxgJ75Q\nFefEzh+d/vHwGlfKoN+740Y2TrgW58w9Cm4BBQiOTIDf9DbtIW1YOkaIUwKBgGty\nMef/sGD3NbQZHSh7fJ9CdVYZNf08L66/8Gz+BY7X5aNFiAHPu7fjZwc5k9IIjcQG\npmmQkW81qJ0erw6bZnsqWi2ZArTRZ1X64vYojC39sYE/LFkAbcnrmd8dW89UY7RT\nyh65JqILkkyve5Ky7Cri4toTzbJffhYQJ1pYfH9hAoGBAMjJGB0WRC111FXZ8oXP\nK+PLHn5odAV1W1t67L5m46LM6wLMO6pTCtM2Q29IP9KtoTsE97slZpAUq1PQkfTK\nb0H30kSXFshpBer4/Thh2N+ZDnaxERS574iOwCPyPRSJi5eOuxlSYxWBx9/FATtk\ncMtRqNA9rAA3uOZR7IaBp0BN\n-----END PRIVATE KEY-----",
    "category": "rsa"
  },
  {
    "label": "RS512",
    "alg": "RS512",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzb1ucCj7Y+sHaVp4Qpl\nR4EEq9nnTDom879NZucEWsQnUe/CVxb7HnTKSndcOEIqT86P8rZDcegpU8zD/LUU\ngBGScfZXruwySNH5Q1eJ6a40586R85O42JbIVTj6mFE8lB+vy7HUsRR+gs5SX1P+\nllijBMjRGsY60q95hi763cGIvGAaOgV4FncW0xWrPPy9jwK6lGMARew170kgKmmA\n0JtD0WsgeSFEghK6sWMtVTU35ie/eGNg7IEpkhSc7QKpHt3NjGNSFX+VgUkG77MN\nCxrHljbqqrUpETjzKZSkCskns5mi9kB4q3JOaCOxdyMLSIn94QKejs+EvONVmMoY\nbQIDAQAB\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCfNvW5wKPtj6wd\npWnhCmVHgQSr2edMOibzv01m5wRaxCdR78JXFvsedMpKd1w4QipPzo/ytkNx6ClT\nzMP8tRSAEZJx9leu7DJI0flDV4nprjTnzpHzk7jYlshVOPqYUTyUH6/LsdSxFH6C\nzlJfU/6WWKMEyNEaxjrSr3mGLvrdwYi8YBo6BXgWdxbTFas8/L2PArqUYwBF7DXv\nSSAqaYDQm0PRayB5IUSCErqxYy1VNTfmJ794Y2DsgSmSFJztAqke3c2MY1IVf5WB\nSQbvsw0LGseWNuqqtSkROPMplKQKySezmaL2QHirck5oI7F3IwtIif3hAp6Oz4S8\n41WYyhhtAgMBAAECggEABVVugvQIqdcz0WRuuRrDjNMuKGGq5XtXPbgtbCKWG0JR\n/OU20fsTm5AXDMqV3M6eo0DMwrlHZiP8anHEKQ2Z67Zq/QVfJ52DC7x5CMAAf0MW\nQ6PAcPQEb8ERYgWAI6UpDd9H4N+KvAnvOQuXZ9klAL1kbK8bjjWQ1+kH/a5KOi6J\ng7/7Rd9Djjb1urpGJERgxRxT+b2erii4JwrtuHy9zP63mpT0VHVnTJPEhW4Yc74W\nOu7C1ySK3g3Cq1OSONw9gt+XqT+FzlNYISgnO18tN5ys6bJiPkG+JZf+aby15q5e\nUxENs7R1UwAL8Q+5VNP8Z+xIH+CBM7J8SD7+EIN+EQKBgQDdlwEXA0a2YNIW4TMg\nIUusuhtyILDBTltd7xt1CZoWHe85FrfqUAVBA/5T/hooe/ovwfJQfW4u779xC2ii\nAd+GaRuBeJEdo1bcuU592EWgtLdwzHIc5i5uzDBm3WjqUnQofp5sAkI+/4GaumzQ\nHNnZGvV5fUPjrizqRjOa56NzGQKBgQC38FFPI49O2+NjcWOUMsbOxyIKWnDXZE8a\nJFDLFkMcXz25ihH2Ch/U2ph/+t2Gh239eFaTMkyWXtzOB25KvZvGhdLK17D3ifyX\n10djqMhcy7PKpbRA1m0lCbmMntPKlOluRy96uiPEjLS3g4sb0pUTo49Dtxm6j/uh\nqnvr9KgudQKBgDsrg2L9wPgaSn9JizldKrPozkNfb1Nu9P7URmSuN7MIM0TvSBUN\nYRnHUzZid+GvmVL/WxEbLTzjUB+DiGEaVvGxR2L/KuDbKOqvoMIB6jXLi+BW93G4\nFVYIuDP/k3BerB3UEcGNqNrhp14FweCgk5thk4LpbCNz8xJrxIPsrryhAoGANEEH\nOE5H1gVNseByg5VxOSkFGJ/c0rPibPDIKwmmAxdjd6QruhPiOxvmmuTvrdonewyG\nu8ZcT5OfcsBVqtH2wQ0fdxSTZ59BrPkxhLRcR1BvQTCV5p2D4DPFDJfKXxCyx+td\nJ6Zdpua6KDAsgrjuNOgQORJ5MrDYsXK3Ra75YEkCgYBK//F4Fo6nZ1TkebrLHQF6\nVy825sMwJnUSrmhDySz50nnov1T3u0oMdCUwTlLUD9Iw+jijvykZ8qjTEOXvaHXz\ndGD0whMSQEF98MZozKYDSuYtY4YF10zJPKjcNael3rutU5G/m/1HXLj/C+p9+gRB\nNoUE2VzgJrn+uyHDaJacag==\n-----END PRIVATE KEY-----",
    "category": "rsa"
  },
  {
    "label": "PS256",
    "alg": "PS256",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvZ+oYCuLjRUIj+qD1by4\nWAQ0LBHrVrYNuQwwz/Eq866k1BSS/e3pVD2pg6LTCVGGTA3x75Fc8szoXw5uKsI1\n8yOT4dfY1/aG4O3hjthqcR8JbtLoUeV4hg/CKf7oi/6V3+VN9xO8x5MfHb7w9bfr\nMa+asUixabOf/xgqjbKI+XPLmO+3YhTF04gq/FQ32n+K+sGcqUwVsci+zENmie6n\nBXChlWhM5sYyrJlTpi8/GSWumAJVKv4ibAxx0MbhldPI3Ps9UBEg7z61clJ3VXsP\nNVTK02pgmrCAA1BA1xhkLTPBKxrIInKjs9/iSBTXMbXadmF8gSKfZ54IKZm9AtoJ\nFQIDAQAB\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC9n6hgK4uNFQiP\n6oPVvLhYBDQsEetWtg25DDDP8SrzrqTUFJL97elUPamDotMJUYZMDfHvkVzyzOhf\nDm4qwjXzI5Ph19jX9obg7eGO2GpxHwlu0uhR5XiGD8Ip/uiL/pXf5U33E7zHkx8d\nvvD1t+sxr5qxSLFps5//GCqNsoj5c8uY77diFMXTiCr8VDfaf4r6wZypTBWxyL7M\nQ2aJ7qcFcKGVaEzmxjKsmVOmLz8ZJa6YAlUq/iJsDHHQxuGV08jc+z1QESDvPrVy\nUndVew81VMrTamCasIADUEDXGGQtM8ErGsgicqOz3+JIFNcxtdp2YXyBIp9nnggp\nmb0C2gkVAgMBAAECggEACp7DCOPXdIbdjGXnjVR9BJzzqRY11ozqttb6cuMAc1Zw\nL9qZIvSssUWk1VUMucRhn6fWSYMcMBMO3qgJvoZTDDONaEQ1Bl9tzXI1RFFVoNFK\nr3TLgy61cdi3GLAIqTKQhVIr7C8kTw8r2ngjubdbylQZ91zpZtCjIN/jHj2GE2Zy\nrh/dIBB62Xe1+DPTYrA/BFeLMaA8gN4ifU+xPQRVBaJ4yjQkVrlVvESaigkjPevB\nY21P/5FClSk/aoxvrRCxKjXt0G0RyICXWvgF8Ra15HfW9uFWr2vN/NOM+2A1j2hA\nudktv406zk6k0+RAVmBM41YW4QT6oJLWmfx2oKjrbwKBgQDdRKmgmXOimY1S+Zae\nNzEd626gaiKLMAed5n62RUmpjPyqtx+gdhF4URVXUxi1HtNZ/DtIf+7/+vDkkWaG\npOY5FLF4v2v48BxjHNwW8JDtijN9wAWJ8Y7aLKksFUTO8tT/sqCOyHH4qSKeWc/N\nWH4ynaEPS4dHfCYqDhAVyqgLNwKBgQDbY2fLHXecPPmF5Ea2lMpHfvJ9gfusrL4j\nsOxwnGn7n+T0+RIhPPFf0inadBmfj1UiNG+YGOy9Wf+3zm8pErqP0vPf8zz6IlRN\n1MGIhljIoE2p7R4TzySwJtJ526deb1rOS/Ok0B4lO6tL6gJ8SqYCVOZaXt78cflx\nLX4aOIpsEwKBgEHKDp1/wtAP0+Nd7piwVFxPCh+MLyUvbLRYOki7pUFSeDXSKQcu\n09bwVOYYAPqpZbIVuxK9ZzSZSlLLoK5cDU/fhT0fvVzRF7+obxArCwx10QWMuJjh\nR9Y6/TnsQP8/WHGGjRKnKqwCrhZjIdQugadPEvpXPKvWkAplEAdKsFhVAoGBAMgp\nz/8/qWvBLh/9AI+A/XVx26irOYZ4LRq/R1oPO5s6bVkdDm+I/OjiBRGtL9ummJQW\np2JsC0NPo8J99GnTDqg+XgeME6xcOfKxFMqNWN/jcjiBgRmtutmE8jAAOposmvrx\nzSAoSfjKkiU3IoFoUkJ6V5lIScal7mJWkWE3CQRFAoGAbubNrqtM+zOGFhhSrGQu\nbD7meG6IxBCWEkyt4Aw3/4jfhKll26MD5qd7s6lIF1VZF9NEpZTJg3ROdl7rWYop\n82W5jlrVPrZhnZ56vSzEgJIKfG3h06FRpl1suki1u8LO7oBi5h1ctJ4Sjk1BvOaB\nRoBYf+HNrGTbblPn1s0BEwk=\n-----END PRIVATE KEY-----",
    "category": "pss"
  },
  {
    "label": "PS384",
    "alg": "PS384",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqm74x8KfNhQBvw9/e4+x\njiTdke8/RYhYgqnaqUjkbueceooO9Mt/1D/5h/G6+Rm1VRdQglDDoiZIEmU+BcD8\nSj7OxnrWUZ67fJUzRX1ELvJALfZXnTIlT7O3zeU2tXEyt5s6jbJsfqldsFOeP/2X\nidd2qG/fja5nzcv5lENsZ7YYcYQVSCbIwcjdz21LA9Njzw1TfKUjnu2RPA9V9p3p\nwvWU+DIj1GhRTOUrls2IU+PygaA3Ha3xP9sCDWXPEU8AZFYVjRL9E8MHwDhVT5/e\ngE+0xCDiFE32Lpnkkxt50TSqmh5GUYs44a3H9XRoPqX1MNt+hgpbBNYkhmPeUEKY\n3QIDAQAB\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCqbvjHwp82FAG/\nD397j7GOJN2R7z9FiFiCqdqpSORu55x6ig70y3/UP/mH8br5GbVVF1CCUMOiJkgS\nZT4FwPxKPs7GetZRnrt8lTNFfUQu8kAt9ledMiVPs7fN5Ta1cTK3mzqNsmx+qV2w\nU54//ZeJ13aob9+NrmfNy/mUQ2xnthhxhBVIJsjByN3PbUsD02PPDVN8pSOe7ZE8\nD1X2nenC9ZT4MiPUaFFM5SuWzYhT4/KBoDcdrfE/2wINZc8RTwBkVhWNEv0TwwfA\nOFVPn96AT7TEIOIUTfYumeSTG3nRNKqaHkZRizjhrcf1dGg+pfUw236GClsE1iSG\nY95QQpjdAgMBAAECggEAIaw9rlgDNT/ELY++D/dOrQcXGLlkbpQ26o/tAgPDEC9m\nAObseAyJw7FlF2kY2BTuePKbhze2Qz/dfvbuR1w+7FtW5quH0wXxxHZE9D6A3Wai\n7AHPAyGQchwPnVgjVDtaeiCq86p0GZ1UQ51tt3ZevY7qpHJAAKHb4/LgK10b2qxy\ntQUtx6U6AE3OK4rFeY+NNt15L37j9ZWutEbrbyDRJvMNbRjYp6PoGzUc7viORXy/\nNxvU3g3SOo2VOgymSSQXgf819LicI02yZuy8f2lfljLF07Id+VNQZwYW4mSz3GhF\n0aLp6gOqWyj1mCAlEMAprGR0siZi4P0FcnhXCFmTwQKBgQDYvJdqYmEtsWNFmQ0K\nJCQtmJzNItVdKpxe8eGS4KBdLaNrxVriEL7AylYguXlgrPWwiB6pQtpBqbCX+FNr\nvtUDVhzsuT8TqqfjKzJLoVpsNsjznLA8KPNUgu532bY2VYKkJWup89K+MWi1Wam3\nVB4x9dPUIBJK9FZO0Nte1qGiQQKBgQDJTwRd+NYCAE/ga03ccLqegF6Z9FNVGQbT\nt0cW6LrIJywu61p2VKvv5JqTdzyDjACRDTjHCi3/zNEE6A+E/cy46HdZoi+4ox9U\njdgOkja8oTaucQEOoz0POZdPPG+kr2imiJzF0UQKWmXoRa8tCmWM5hTL+Oucg+eb\n8sIipX5XnQKBgGZ8l2T47Fb9AKJSgzX+bRUai1r9U8NgeNz0p+QaT/p/sD0v74/i\ntzDW/O8whVLPtsYpN8Z2FFrkcNsL0/apIHUZbUgLOOaF1im3rWrR+74cEd4Qg82O\n17Fo0Hbf/ienO8V+5HBTGZ5SIt9ObNCB+F1Lj0VJfRzweTd/z5wDBh+BAoGAXz5a\nY5easUGyiQxbv0M6mElF+PMnBikcGMkrAkTEMnSOK/jASSIQYyS2mbSdVePEVNx7\nk3hWgSNHdVnSFer6lDWwWiEpEONkrF2b7nDxItfnhisDBAjpl6140E1YyQMQsVIL\nUnCLD5brhjSKB/ZWS46EImk4GEo0J414mmnQV+UCgYBInC4cdSG6G0E7P+KI139v\nrDujitXKtskUQdIQckKPq5bKO6Ou1QU4Hqu2Hgz+g1ZQBsaVGZNP7K/Psrxe1jW4\nAnatHTrsIJwFblL7FN4e8HOcSuflxSeJ7b6YqshL8h5V7T2c5xIk3mFNaStBlpvH\nFf3l7oaIk5FOEIk9sJXt/w==\n-----END PRIVATE KEY-----",
    "category": "pss"
  },
  {
    "label": "PS512",
    "alg": "PS512",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqzoyXJG7m4TsD043vI+/\nBkH42alqHkukvgYxnZIJ295vWt2mCWfj8I/pbE3Izw9hE5ZEnDPgBGejB3wFg43/\niZCrFNUmvnHURlS/5HcBtGY1HxiJValojvWWY2Ous0nbB1qPS7tt5nP6rb/eCpWr\naJgHUPBdhRjFDIVupzNge1D1URl7hc3QP+zs5QH+mSK1nuAHyN3LzAjjJTyiyu8S\nQ6Eq+H0bL0kDNdh44S5SuHXOFF2O2i70NO8+jM4QE2KIi0mwbPZCprr9mTcP8YVO\n7M/rMQ/CTK2zKtiuVnvw8uJAHSU/xpN+MULPomhMkIPiVBigP9pm0HvrXxr9vlRX\njwIDAQAB\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCrOjJckbubhOwP\nTje8j78GQfjZqWoeS6S+BjGdkgnb3m9a3aYJZ+Pwj+lsTcjPD2ETlkScM+AEZ6MH\nfAWDjf+JkKsU1Sa+cdRGVL/kdwG0ZjUfGIlVqWiO9ZZjY66zSdsHWo9Lu23mc/qt\nv94KlatomAdQ8F2FGMUMhW6nM2B7UPVRGXuFzdA/7OzlAf6ZIrWe4AfI3cvMCOMl\nPKLK7xJDoSr4fRsvSQM12HjhLlK4dc4UXY7aLvQ07z6MzhATYoiLSbBs9kKmuv2Z\nNw/xhU7sz+sxD8JMrbMq2K5We/Dy4kAdJT/Gk34xQs+iaEyQg+JUGKA/2mbQe+tf\nGv2+VFePAgMBAAECggEALt4am9jt+6caACR+QBguhtV2+okTOWCmIrdKTGGFXk/X\ntgz2Xhu4OggCMflmjjqc7UIT3JecaUg+yRUq4zPybqKRGX4wgS9iFbAr6Cqk5k6V\nmsHaEX7x1jOlquXFk2CTWcNxdp7CebJkOrvKWKZYCSSX2BE63+wEP6WkQJLhBU+T\nqM81ArJv7fnBNdDMN6nmoc0EGv08JEXbpzTCDWpir0/5c6TRA6wt6bMn0umWQknw\nQwAdhw/oLsean8SCFsDOAz53WDJwzuNihCGcHcecBScsLIqwb9hbGw8bnH6jqAKt\nDzWzGi/fSHEswRokcox7XHzxsxUICgVoxBRnX4/WqQKBgQDsW6JmocmB+w9z/YMP\nug0L72QViVHVaMmLP9rhPmgJuCR6efDvvkOz28PNg7ZWZrv3M2/eTexdapC4qeaa\nMmqf1hsgRh0W75L8E3P8qXAYfnQoDD4td5+DE+vUB6vIi36wQKbF+3BcjlOocvcy\nTXw2hbfEZFNmj6vxcumFm9exJwKBgQC5dPMiemBqfbmoFxxgkaJif7s5o4RpRq8f\nMk3AZ5+karYkAICddauZ8rGSRMRTZw0UzvS3uxWKB5LI4h/eWlg4VtC5FfKJkFnI\n1K+VstHHKBBg151Xvqyh0sc5koSphLfaPkhBfwB9L/06hL+Bs8sKyYAd4cDak7hs\nz7LkuvDXWQKBgHN51Z9U/hFuKr+dpTHC0Wr6W6iV/ZBJcOaCnRqdFdFh0RixiQBo\nscUm4sP+zM/rw3vj+oze/1MopGpEP/EoHqXWwkwDVWUGSYa0rl9MHQMqjO+gA6TN\nI/azfe2KjegeFxhfjdt+nAfsVX0gJhvCdaRhskXWSlT6bqQ5Y1QurrPTAoGAbc7F\nNyDmfac7ij9E2hjg4RloLdSXzg3AGuSaDNZOO/fDKMXzYUgO9vQwF78Hz6owoKV5\nWGA5fKTHUJIy9GDh41nj8/L+zFzgDH2CCUz70MP0DqMb0pxfcuFufLQ4QHcItPwz\npDQigf0sHr4C9jUSf6yXYxoMKl9Uz3ibH7tgZuECgYAI0eN9FZbHTuO8Hi4FOXkn\nXR///C4jk0XiRH9nCyg+sbsKlHaN9Fwrd9O3DZB8l4wgDcwRr1V2vLDv7hQypMS4\nPEJXY0LO6n0bSdggb1PRuXXIHkYwhc9HUn+qHH8yvmyVlYvsDk/MQoz9iQTl4zdf\nxkmA7vjbyD2EfHP6hYRFLA==\n-----END PRIVATE KEY-----",
    "category": "pss"
  },
  {
    "label": "ES256",
    "alg": "ES256",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE6OwM48FkavB5rSl60dlb8mCEcroQ\ngYNUYSPT0BLJ6qwpmTEZTpMHF0ystsy9bmFxby4R7f3JEQmCDW8pfG5Img==\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgl9ZunnwTgwl2HTze\nwiwth6r9jqN7X/wUWjq8zRTSqHKhRANCAATo7AzjwWRq8HmtKXrR2VvyYIRyuhCB\ng1RhI9PQEsnqrCmZMRlOkwcXTKy2zL1uYXFvLhHt/ckRCYINbyl8bkia\n-----END PRIVATE KEY-----",
    "category": "ec"
  },
  {
    "label": "ES384",
    "alg": "ES384",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE2foAwmNh+pQioOhbA0LWWXGZnxsAG+tQ\nJr6HdJbH3iR2ya6PomFkPGYqXoaxF6ONqztdUT80uYjF5emA2K82XI3ic0didMEX\n20WD/2OMYqpQMTxTInIItNF1lCfgq83x\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIG2AgEAMBAGByqGSM49AgEGBSuBBAAiBIGeMIGbAgEBBDDpZMt9gCjX/OXV73Kd\nJ4OBXN02SVAvfs9Ov+8+pJ2/SQuDwUthhIIbO+4ZXGd6R0ihZANiAATZ+gDCY2H6\nlCKg6FsDQtZZcZmfGwAb61Amvod0lsfeJHbJro+iYWQ8ZipehrEXo42rO11RPzS5\niMXl6YDYrzZcjeJzR2J0wRfbRYP/Y4xiqlAxPFMicgi00XWUJ+CrzfE=\n-----END PRIVATE KEY-----",
    "category": "ec"
  },
  {
    "label": "ES512",
    "alg": "ES512",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMIGbMBAGByqGSM49AgEGBSuBBAAjA4GGAAQB3BYa5mOC/Guu+Gb/YR8/VlrCtWsY\nQfVK8RcNDzzgw5/B07Esq2n50Q+Sx8DZxyA2K73Kp1TwerQJSP97VZS9qPwA1rOf\nnJPaW3lMXRAyyXFKCP9fN+6GB/1CjMotJAWk9CnnPGVeNlMJDyg+1inPOFMWeQZ+\ne7GWn7YXh07VkFkcDGw=\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMIHuAgEAMBAGByqGSM49AgEGBSuBBAAjBIHWMIHTAgEBBEIA+ieKTddjdhaCX0DD\nWkHaxzkQqiKhNQCPKQlpkkD4NShT/nDPg92hup8LnnoUyY3KQmWTg/0/6nzpzNs7\nWuKxdxOhgYkDgYYABAHcFhrmY4L8a674Zv9hHz9WWsK1axhB9UrxFw0PPODDn8HT\nsSyrafnRD5LHwNnHIDYrvcqnVPB6tAlI/3tVlL2o/ADWs5+ck9pbeUxdEDLJcUoI\n/1837oYH/UKMyi0kBaT0Kec8ZV42UwkPKD7WKc84UxZ5Bn57sZaftheHTtWQWRwM\nbA==\n-----END PRIVATE KEY-----",
    "category": "ec"
  },
  {
    "label": "EdDSA",
    "alg": "EdDSA",
    "publicKey": "-----BEGIN PUBLIC KEY-----\nMCowBQYDK2VwAyEAcYR+hIwnJUFU05zVjtxFz/ZP0/+K3kUE5ySTaNfk90o=\n-----END PUBLIC KEY-----",
    "privateKey": "-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIJ2XPUlo9m3yNQ24gDT2SlGiOGb/2lXdIhO7ZJh7FLmu\n-----END PRIVATE KEY-----",
    "category": "okp"
  }
];
