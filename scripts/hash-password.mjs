#!/usr/bin/env node
// Creates an admin user entry for ADMIN_USERS (and a session secret if you
// need one). The password is never stored, only its scrypt hash.
//
//   node scripts/hash-password.mjs
//
// Paste the printed entry into the ADMIN_USERS list, e.g.
//   ADMIN_USERS=[{"email":"greg@example.com","name":"Greg","hash":"scrypt:..."}]

import { randomBytes, scrypt } from "node:crypto";
import readline from "node:readline";

function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        // Echo the prompt, hide what's typed.
        if (s.startsWith(question)) rl.output.write(question);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer);
    });
  });
}

const N = 16384, r = 8, p = 1;
function hash(password) {
  const salt = randomBytes(16);
  return new Promise((resolve, reject) =>
    scrypt(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, key) =>
      err ? reject(err) : resolve(`scrypt:${N}:${r}:${p}:${salt.toString("base64")}:${key.toString("base64")}`)
    )
  );
}

const email = (await ask("Email: ")).trim().toLowerCase();
const name = (await ask("Name shown in the admin (e.g. Greg): ")).trim();
const password = await ask("Password (at least 10 characters): ", { hidden: true });
const again = await ask("Password again: ", { hidden: true });

if (!email.includes("@")) throw new Error("That doesn't look like an email address.");
if (password.length < 10) throw new Error("Please use at least 10 characters.");
if (password !== again) throw new Error("The passwords don't match.");

console.log("\nADMIN_USERS entry:\n");
console.log(JSON.stringify({ email, name: name || email, hash: await hash(password) }));
console.log("\nIf you don't have ADMIN_SESSION_SECRET yet, use:\n");
console.log(randomBytes(32).toString("base64url"));
