import { buildEddsa, buildPedersenHash, buildPoseidon } from "circomlibjs"; 
import * as fs from "fs";
import { bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";
//import {signMessage, verifySignature, } from "@zk-kit/eddsa-poseidon"
import { hashEmailWithSalt } from "./hashing"; 
import * as path from "path";


export type IRecoverEmailCircuitInputs = {
    pubkey: string[];
    signature: string[];
    emailHeader: string[];
    emailHeaderLength: string;
    walletAddress: string;
    salt: string;
    emailRecoveryBlinded: any;
    newPubKey: string[];
    //checkSignature: string[];
    //messageHash: string[];
    //fromEmailIndex: string;
  };

export async function generateRecoverEmailCircuitInputs(
    rawEmail: string | Buffer,
    ethereumAddress: string,
    plainEmailAddress: string,
    saltString: string,
): Promise<IRecoverEmailCircuitInputs> { 

    //const pedersen = await buildPedersenHash();
    //const poseidon = await buildPoseidon();
    //const eddsa = await buildEddsa();

    const keys = JSON.parse(fs.readFileSync("./output/keys.json", "utf8"));
    //const keys = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../output/keys.json"), "utf8"));
        
    const newPubKey = keys.pubKey.map((part: string | number | bigint | boolean) => BigInt(part).toString());

    const emailVerifierInputs = await generateEmailVerifierInputs(rawEmail, {});

    console.log("Ethereum Address:", ethereumAddress);
    console.log("Plain Email Address:", plainEmailAddress);

    const walletAddress = bytesToBigInt(fromHex(ethereumAddress)).toString();


    // Different hashing methods:
    //const saltObj = Buffer.from(saltString, 'utf-8');
    //const emailObj = Buffer.from(plainEmailAddress, 'utf-8');
    //const emailRecoveryBlinded = pedersen.hash(Buffer.concat([emailObj, saltObj])).toString();
    /* leave the poseidon code in case we need to switch back
    const emailHex = Buffer.from(plainEmailAddress, 'utf-8').toString('hex');
    const saltHex = Buffer.from(saltString, 'utf-8').toString('hex');
    const concatenatedInput = BigInt(`0x${emailHex}${saltHex}`);
    const emailRecoveryBlinded = poseidon([concatenatedInput]).toString(); */

    let emailRecoveryBlinded = await hashEmailWithSalt(plainEmailAddress, saltString);
    emailRecoveryBlinded = BigInt(emailRecoveryBlinded.replace(/,/g, '')).toString();


    return {
        emailHeader: emailVerifierInputs.emailHeader,
        emailHeaderLength: emailVerifierInputs.emailHeaderLength,
        pubkey: emailVerifierInputs.pubkey,
        signature: emailVerifierInputs.signature,
        walletAddress,
        salt: saltString,
        emailRecoveryBlinded,
        newPubKey: [newPubKey[0].toString(), newPubKey[1].toString()]
        //checkSignature: [checkSignature.R8[0].toString(), checkSignature.R8[1].toString()],
        //messageHash: [messageHash.toString()]
      };


}
