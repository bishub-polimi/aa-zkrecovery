pragma circom 2.1.5;

include "@zk-email/circuits/email-verifier.circom";
include "@zk-email/zk-regex-circom/circuits/common/from_addr_regex.circom";
include "circomlib/circuits/poseidon.circom";  
include "./key-ownership.circom";

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

    // EMAIL DKIM VERIFIER
    component email_verifier = EmailVerifier(max_header_bytes, 0, n, k, exposeFrom);
    email_verifier.emailHeader <== emailHeader;
    email_verifier.pubkey <== pubkey;
    email_verifier.signature <== signature;
    email_verifier.emailHeaderLength <== emailHeaderLength;
    pubkey_hash <== email_verifier.pubkeyHash;


    // FROM HEADER REGEX + POSEIDON HASH 
    if (exposeFrom) {
        //signal input fromEmailIndex;

        signal (fromEmailFound, fromEmailReveal[maxHeadersLength]) <== FromAddrRegex(maxHeadersLength)(emailHeader);
        fromEmailFound === 1;

        // email address can fit within 255 bits if it is 31 characters or fewer in length
        //var maxEmailLength = 255; 
        //signal fromEmailAddrPacks[9] <== PackRegexReveal(maxHeadersLength, maxEmailLength)(fromEmailReveal, fromEmailIndex);

        /* component emailHash = Poseidon(10); // Create a Poseidon hash function with enough inputs
        for (var i = 0; i < 9; i++) {
            emailHash.inputs[i] <== fromEmailAddrPacks[i]; // Feed each packed element into the hash function
        }
        emailHash.inputs[9] <== salt;
        emailHash.out === emailRecoveryBlinded; */

        component emailHash = Poseidon(2); 
        emailHash.inputs[0] <== fromEmailReveal;//[fromEmailIndex];
        emailHash.inputs[1] <== salt;


    }


    // NEW KEY OWNERSHIP
    component key_ownership = KeyOwnership();
    key_ownership.newPubKey <== newPubKey;
    key_ownership.checkSignature <== checkSignature;
    key_ownership.messageHash <== messageHash; 

    signal valid;
    valid <== key_ownership.valid;
    valid === 1;


}

component main { 
    public input emailRecoveryBlinded;
    public input newPubKey[2];
    public input walletAddress;
} = RecoverEmail(121, 17, 1024, 1);