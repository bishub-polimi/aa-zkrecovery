import { buildEddsa, buildPedersenHash, buildPoseidon } from "circomlibjs"; 
import * as fs from "fs";
import { bytesToBigInt, fromHex } from "@zk-email/helpers/dist/binary-format";
import { generateEmailVerifierInputs } from "@zk-email/helpers/dist/input-generators";
//import {signMessage, verifySignature, } from "@zk-kit/eddsa-poseidon"
import { hashEmailWithSalt } from "./hashing"; 


export type IRecoverEmailCircuitInputs = {
    pubkey: string[];
    signature: string[];
    emailHeader: string[];
    emailHeaderLength: string;
    walletAddress: string;
    salt: string;
    emailRecoveryBlinded: string;
    newPubKey: string[];
    checkSignature: string[];
    messageHash: string[];
    //fromEmailIndex: string;
  };

export async function generateRecoverEmailCircuitInputs(
    rawEmail: string | Buffer,
    ethereumAddress: string,
    plainEmailAddress: string,
    saltString: string,
): Promise<IRecoverEmailCircuitInputs> { 


    const pedersen = await buildPedersenHash();
    const poseidon = await buildPoseidon();
    const eddsa = await buildEddsa();

    const keys = JSON.parse(fs.readFileSync("keys.json", "utf8"));
    const prvKey = Buffer.from(keys.prvKey, "hex");
    
    // Assuming pubKey is a single hex string
    const newPubKey = [
        keys.pubKey.slice(0, 64),  
        keys.pubKey.slice(64)   
    ].map(part => BigInt(`0x${part}`).toString());

    const checkSignature = eddsa.signPedersen(prvKey, Buffer.from("Hello, New Wallet!"));
    const messageHash = pedersen.hash(Buffer.from("Hello, New Wallet!")).toString();

    const emailVerifierInputs = await generateEmailVerifierInputs(rawEmail, {});

    console.log("Ethereum Address:", ethereumAddress);
    console.log("Plain Email Address:", plainEmailAddress);

    const walletAddress = bytesToBigInt(fromHex(ethereumAddress)).toString();


    // this is for pedersen hashing
    //const saltObj = Buffer.from(saltString, 'utf-8');
    //const emailObj = Buffer.from(plainEmailAddress, 'utf-8');
    //const emailRecoveryBlinded = pedersen.hash(Buffer.concat([emailObj, saltObj])).toString();
    /* leave the poseidon code in case we need to switch back
    const emailHex = Buffer.from(plainEmailAddress, 'utf-8').toString('hex');
    const saltHex = Buffer.from(saltString, 'utf-8').toString('hex');
    const concatenatedInput = BigInt(`0x${emailHex}${saltHex}`);
    const emailRecoveryBlinded = poseidon([concatenatedInput]).toString(); */

    const emailRecoveryBlinded = await hashEmailWithSalt(plainEmailAddress, saltString);


    return {
        ...emailVerifierInputs,
        walletAddress,
        salt: saltString,
        emailRecoveryBlinded,
        newPubKey: [newPubKey[0].toString(), newPubKey[1].toString()],
        checkSignature: [checkSignature.R8[0].toString(), checkSignature.R8[1].toString()],
        messageHash: [messageHash.toString()]
      };


}
