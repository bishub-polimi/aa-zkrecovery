pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
include "@zk-email/circuits/utils/regex.circom";
include "circomlib/circuits/poseidon.circom";  
//include "./key-ownership.circom";

template RecoverEmail(n, k, max_header_bytes, exposeFrom) {
    assert(exposeFrom < 2);

    signal input pubkey[k];
    signal input signature[k];
    signal input emailHeaderLength;
    signal input emailHeader[max_header_bytes];
    signal input walletAddress;
    signal input salt; 
    signal input emailRecoveryBlinded; // h(email || salt)

    signal input newPubKey[2]; 
    //signal input checkSignature[2];  
    //signal input messageHash[2]; 

    signal output pubkey_hash; // "cross-referenced with the public key in our DKIM registry to authenticate the origins of the email."
    //signal output valid;
    signal output emailHash;

    // EMAIL DKIM VERIFIER
    component email_verifier = EmailVerifier(max_header_bytes, 0, n, k, exposeFrom);
    email_verifier.emailHeader <== emailHeader;
    email_verifier.pubkey <== pubkey;
    email_verifier.signature <== signature;
    email_verifier.emailHeaderLength <== emailHeaderLength;
    pubkey_hash <== email_verifier.pubkeyHash;

    // EXTRACT & HASH FROM EMAIL HEADER 
    // reminder: email address can fit within 255 bits if it is 31 characters or fewer in length
    if (exposeFrom) {

        signal input fromEmailIndex;

        signal (fromEmailFound, fromEmailReveal[max_header_bytes]) <== FromAddrRegex(max_header_bytes)(emailHeader);
        fromEmailFound === 1;

        //  Each field element can hold 31 bytes. 
        // So, the num of field elements for 255 bytes is 255/31 = 9.
        var maxEmailLength = 255;
        signal fromEmailAddrPacks[9] <== PackRegexReveal(max_header_bytes, maxEmailLength)(fromEmailReveal, fromEmailIndex);

        /*// log extracted email reveal
        for (var i = 0; i < 9; i++) {
            log(fromEmailAddrPacks[i]);
        } */

        component chunkHashes[1];
        chunkHashes[0] = Poseidon(9);

        for (var i = 0; i < 9; i++) {
            chunkHashes[0].inputs[i] <== fromEmailAddrPacks[i];
        }

        // taking the outputs of poseidon hashes.. 
        signal chunkHashOutputs[1];
        chunkHashOutputs[0] <== chunkHashes[0].out;
        log(chunkHashOutputs[0]);

        // ...then hashing the hashes together with the salt
        component finalHash = Poseidon(2);
        finalHash.inputs[0] <== chunkHashOutputs[0];
        finalHash.inputs[1] <== salt;
        log(finalHash.out); 

        emailHash <== finalHash.out;
        emailHash === emailRecoveryBlinded;
    }

}

component main { 
    public [emailRecoveryBlinded,
    newPubKey,
    walletAddress]
} = RecoverEmail(121, 17, 1024, 1);
