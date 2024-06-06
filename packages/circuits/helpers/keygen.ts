import { buildEddsa } from "circomlibjs";
import * as fs from 'fs';
import * as crypto from "crypto";
import { derivePublicKey } from "@zk-kit/eddsa-poseidon"
import * as path from "path";


export async function generateKeys() {

    const eddsa = await buildEddsa();
    
    // 256 bits based on CSPRNG
    const prvKey = crypto.randomBytes(32); 
    const pubKey = derivePublicKey(prvKey)

    const keys = {
        prvKey: prvKey.toString('hex'),
        pubKey: pubKey.map((p: bigint) => p.toString())
    };

    fs.writeFileSync(path.resolve(__dirname,"../output/keys.json"), JSON.stringify(keys, null, 2));
    console.log("Private and public keys generated and saved to keys.json:");
    console.log(keys);
}

