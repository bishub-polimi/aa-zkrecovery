pragma circom 2.0.0;

include "circomlib/circuits/eddsac.circom";  // Include the EdDSA circuit library

template KeyOwnership() {

    signal input newPubKey[2];  // a pair of points (x, y)
    signal input checkSignature[2];  // a pair of points (R, S)
    signal input messageHash[2];  // an array of field elements

    signal output valid;  
    signal output pubKey[2];

    component eddsa = EdDSA(1); 
    eddsa.newPubKey <== newPubKey;
    eddsa.checkSignature <== checkSignature;
    eddsa.messageHash <== messageHash;

    valid <== eddsa.out;

}

component main = KeyOwnership();