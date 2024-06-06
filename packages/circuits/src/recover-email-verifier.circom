pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
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
    signal input checkSignature[2];  
    signal input messageHash[2]; 

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
        signal (fromEmailFound, fromEmailReveal[max_header_bytes]) <== FromAddrRegex(max_header_bytes)(emailHeader);
        fromEmailFound === 1;

        component chunkHashes[2];
        chunkHashes[0] = Poseidon(16);
        chunkHashes[1] = Poseidon(16);

        for (var i = 0; i < 16; i++) {
            chunkHashes[0].inputs[i] <== fromEmailReveal[i];
        }

        for (var i = 0; i < 16; i++) { 
            if (i + 16 < max_header_bytes) {
                chunkHashes[1].inputs[i] <== fromEmailReveal[16 + i];
            } else {
                chunkHashes[1].inputs[i] <== 0; // ... pad with zeroes
            }
        }
        
        // taking the outputs of both poseidon hashes.. 
        signal chunkHashOutputs[2];
        chunkHashOutputs[0] <== chunkHashes[0].out;
        chunkHashOutputs[1] <== chunkHashes[1].out;

        // ...then hashin the hashes together with the salt
        component finalHash = Poseidon(3);
        finalHash.inputs[0] <== chunkHashOutputs[0];
        finalHash.inputs[1] <== chunkHashOutputs[1];
        finalHash.inputs[2] <== salt; 

        emailHash <== finalHash.out;
        emailHash === emailRecoveryBlinded;
    }

/*
    // NEW KEY OWNERSHIP
    component key_ownership = KeyOwnership();
    key_ownership.newPubKey <== newPubKey;
    key_ownership.checkSignature <== checkSignature;
    key_ownership.messageHash <== messageHash; 

    //signal valid;
    valid <== key_ownership.valid;
    valid === 1;
*/

}

component main { 
    public [emailRecoveryBlinded,
    newPubKey,
    walletAddress]
} = RecoverEmail(121, 17, 256, 1);
