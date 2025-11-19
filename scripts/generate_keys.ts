import * as jose from 'jose';
import * as fs from 'fs';
import * as path from 'path';

const KEYS_DIR = path.join(__dirname, 'keys');

if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
}

async function generateAndSaveKey(alg: string, filename: string) {
    const { privateKey, publicKey } = await jose.generateKeyPair(alg, { extractable: true });
    const privateJwk = await jose.exportJWK(privateKey);
    const publicJwk = await jose.exportJWK(publicKey);

    const kid = await jose.calculateJwkThumbprint(publicJwk);
    privateJwk.kid = kid;
    publicJwk.kid = kid;

    fs.writeFileSync(path.join(KEYS_DIR, `${filename}.private.json`), JSON.stringify(privateJwk, null, 2));
    fs.writeFileSync(path.join(KEYS_DIR, `${filename}.public.json`), JSON.stringify(publicJwk, null, 2));
    console.log(`Generated ${filename} keys with kid: ${kid}`);
}

async function main() {
    await generateAndSaveKey('ES256', 'issuer');
    await generateAndSaveKey('RS256', 'client');
}

main().catch(console.error);
