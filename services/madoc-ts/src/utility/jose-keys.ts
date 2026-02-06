import { importPKCS8, importSPKI, KeyLike } from 'jose';
import { getPem, getPublicPem } from './get-pem';

let privateKeyPromise: Promise<KeyLike> | null = null;
let publicKeyPromise: Promise<KeyLike> | null = null;

export function getPrivateKey() {
  if (!privateKeyPromise) {
    privateKeyPromise = importPKCS8(getPem().toString(), 'RS256');
  }
  return privateKeyPromise;
}

export function getPublicKey() {
  if (!publicKeyPromise) {
    publicKeyPromise = importSPKI(getPublicPem().toString(), 'RS256');
  }
  return publicKeyPromise;
}
