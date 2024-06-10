import * as fs from "fs";
import * as path from "path";
import { program } from "commander";
import { generateRecoverEmailCircuitInputs } from "../helpers/inputsHandler";
import { generateKeys } from "../helpers/keyGen"; 
import { log } from "console";

const OUTPUT_DIR = "./output";

program
  .requiredOption("--email-file <string>", "Path to email file")
  .requiredOption("--wallet-address <string>", "Smart Wallet address to request key rotation for, in hex format")
  .requiredOption("--plain-email-address <string>", "Plain email address")
  .requiredOption("--salt-string <string>", "Salt string")
  .option("--silent", "No console logs");

program.parse(process.argv);

const options = program.opts();

async function generate() {
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR);
    }

    if (!fs.existsSync(options.emailFile) || !options.emailFile.endsWith(".eml")) {
        throw new Error("--email-file path arg must end with .eml");
    }

    if (!options.plainEmailAddress) {
        throw new Error("--plain-email-address is required");
    }

    if (!options.saltString) {
        throw new Error("--salt-string is required");
    }

    if (!fs.existsSync("../output/keys.json")) {
        if (!options.silent) {
            log("keys.json not found, generating keys...");
        }
        await generateKeys();
    }

    if (!options.silent) {
        log("Generating input based on:", options.emailFile);
    }

    const rawEmail = Buffer.from(fs.readFileSync(options.emailFile, "utf8"));
    const circuitInputs = await generateRecoverEmailCircuitInputs(
        rawEmail,
        options.walletAddress,
        options.plainEmailAddress,
        options.saltString
    );

    if (!options.silent) {
        log("\n\nGenerated Circuit Inputs:", circuitInputs, "\n\n");
    }

    fs.writeFileSync(
        path.join(OUTPUT_DIR, "input.json"),
        JSON.stringify(circuitInputs, null, 2)
    );
    if (!options.silent) {
        log("Inputs written to", path.join(OUTPUT_DIR, "input.json"));
    }
}

generate().catch(console.error);
