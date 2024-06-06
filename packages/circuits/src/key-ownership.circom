pragma circom 2.0.0;

include "circomlib/circuits/eddsa.circom";  

template KeyOwnership() {

    signal input newPubKey[2];  // a pair of points (x, y)
    signal input checkSignature[2];  // a pair of points (R, S)
    signal input messageHash[2];  // an array of field elements

    signal output valid;  
    signal output pubKey[2];

    component eddsa = EdDSAVerifier(512); 
    eddsa.A <== newPubKey;
    eddsa.R8 <== checkSignature;
    eddsa.S <== checkSignature; // assuming S is also a part of checkSignature
    for (var i = 0; i < 512; i++) {
        eddsa.msg[i] <== messageHash[i];
    }

    //valid <== eddsa.out;
}

//component main = KeyOwnership();