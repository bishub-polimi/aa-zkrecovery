import { program } from "commander";
import fs from "fs";
import path from "path";
const snarkjs = require("snarkjs");

program

  .option("--silent", "No console logs");

program.parse();
const args = program.opts();

const CIRCUIT_NAME = "recover-email-verifier";
const BUILD_DIR = path.join(__dirname, "../build");
const OUTPUT_DIR = path.join(__dirname, "../proofs");

function log(...message: any) {
  if (!args.silent) {
    console.log(...message);
  }
}
const logger = { log, error: log, warn: log, debug: log };

async function generate() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
  }

  // Generate proof
  const { proof, publicSignals } = await snarkjs.groth16.prove(
    path.join(BUILD_DIR, `${CIRCUIT_NAME}.zkey`),
    path.join(BUILD_DIR, `recover-email-verifier_js/witness.wtns`),
    logger
  );

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "proof.json"),
    JSON.stringify(proof, null, 2)
  );
  log("Proof written to", path.join(OUTPUT_DIR, "proof.json"));

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "public.json"),
    JSON.stringify(publicSignals, null, 2)
  );
  log("Public Inputs written to", path.join(OUTPUT_DIR, "public.json"));

  const vkey = JSON.parse(fs.readFileSync(path.join(BUILD_DIR, `/artifacts/recover-email-verifier.vkey.json`)).toString());
  const proofVerified = await snarkjs.groth16.verify(
    vkey,
    publicSignals,
    proof
  );
  if (proofVerified) {
    console.log("Proof Verified");
  } else {
    throw new Error("Proof Verification Failed");
  }

  process.exit(0);
}

generate().catch((err) => {
  console.error("Error generating proof", err);
  process.exit(1);
});