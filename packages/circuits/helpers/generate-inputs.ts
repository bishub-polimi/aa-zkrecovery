import { buildEddsa, buildPedersenHash, buildPoseidon } from "circomlibjs"; 
import * as fs from "fs";
import { bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";
//import {signMessage, verifySignature, } from "@zk-kit/eddsa-poseidon"
import { extractAndPackEmail } from "./extractPack"; 


export type IRecoverEmailCircuitInputs = {
    pubkey: string[];
    signature: string[];
    emailHeader: string[];
    emailHeaderLength: string;
    walletAddress: string;
    salt: string;
    emailRecoveryBlinded: any;
    newPubKey: string[];
    fromEmailIndex: string;
    //checkSignature: string[];
    //messageHash: string[];
    //fromEmailIndex: string;
  };

export async function generateRecoverEmailCircuitInputs(
    rawEmail: string | Buffer,
    ethereumAddress: string,
    plainEmailAddress: string,
    saltString: string,
    //selectorString: string
): Promise<IRecoverEmailCircuitInputs> { 

    const poseidon = await buildPoseidon();

    const keys = JSON.parse(fs.readFileSync("./output/keys.json", "utf8"));
        
    const newPubKey = keys.pubKey.map((part: string | number | bigint | boolean) => BigInt(part).toString());

    const emailVerifierInputs = await generateEmailVerifierInputs(rawEmail, 
      {});
    
    const headerString = charArrayToString(emailVerifierInputs.emailHeader);
    console.log("The entire header string: ", headerString);
    const fromEmailIndex = headerString.indexOf("from:Mar <") + "from:Mar <".length;

    console.log("Ethereum Address: ", ethereumAddress);
    console.log("Plain Email Address to be extracted: ", plainEmailAddress);

    const walletAddress = bytesToBigInt(fromHex(ethereumAddress)).toString();

    // extract from email address bigint representation 
    // (with params just like in the circuit; 0 in this case bc it's indexed from start already)
    const fromEmailAddrPacks = extractAndPackEmail(plainEmailAddress, 0, 255);
    console.log("fromEmailAddrPacks: ", fromEmailAddrPacks);
    let hashBytes = poseidon(fromEmailAddrPacks); 
    hashBytes = poseidon([hashBytes, saltString]);
    const emailRecoveryBlinded = poseidon.F.toString(hashBytes);

    return {
        emailHeader: emailVerifierInputs.emailHeader,
        emailHeaderLength: emailVerifierInputs.emailHeaderLength,
        pubkey: emailVerifierInputs.pubkey,
        signature: emailVerifierInputs.signature,
        walletAddress,
        salt: saltString,
        emailRecoveryBlinded,
        newPubKey: [newPubKey[0].toString(), newPubKey[1].toString()],
        fromEmailIndex: fromEmailIndex.toString()
        //checkSignature: [checkSignature.R8[0].toString(), checkSignature.R8[1].toString()],
        //messageHash: [messageHash.toString()]
      };

      function charArrayToString(charArray: string[]): string {
        // from string array to number array
        const numberArray = charArray.map(char => parseInt(char, 10));
        console.log("numberArray: ", numberArray);
        return String.fromCharCode(...numberArray);
    }


}
