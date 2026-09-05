import { pbkdf2Sync, randomBytes } from 'node:crypto';

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
const randomPassword = Array.from(randomBytes(22), (byte) => alphabet[byte % alphabet.length]).join('');
const salt = randomBytes(16);
const iterations = 600_000;
const hash = pbkdf2Sync(randomPassword, salt, iterations, 32, 'sha256');
const passwordHash = `pbkdf2_sha256$${iterations}$${salt.toString('base64url')}$${hash.toString('base64url')}`;
const sessionSecret = randomBytes(48).toString('base64url');

console.log('Generated secure admin values. Save the password in a password manager; it is shown only now.');
console.log(`ADMIN_USERNAME=amit-admin`);
console.log(`ADMIN_PASSWORD=${randomPassword}`);
console.log(`ADMIN_PASSWORD_HASH=${passwordHash}`);
console.log(`ADMIN_SESSION_SECRET=${sessionSecret}`);
