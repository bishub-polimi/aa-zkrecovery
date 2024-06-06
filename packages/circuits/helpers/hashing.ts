import { buildPoseidon } from "circomlibjs";

export async function hashEmailWithSalt(email: string, salt: string): Promise<string> {
    const poseidon = await buildPoseidon();


    function stringToHex(str: string): string {
        return Buffer.from(str, 'utf-8').toString('hex');
    }

    function chunkArray(array: BigInt[], chunkSize: number): BigInt[][] {
        const chunks = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    function hexToBigIntArray(hexStr: string): BigInt[] {
        const byteArray = Buffer.from(hexStr, 'hex');
        return Array.from(byteArray).map(byte => BigInt(byte));
    }

    // we need to operate on bigInt arrays ...
    const emailHex = stringToHex(email);
    const saltHex = stringToHex(salt);
    const emailBigIntArray = hexToBigIntArray(emailHex);
    const saltBigIntArray = hexToBigIntArray(saltHex);

    // Ensure the emailBigIntArray fits within the max length of 31
    const maxHeaderBytes = 31;
    const paddedEmailArray = new Array(maxHeaderBytes).fill(0n);
    for (let i = 0; i < emailBigIntArray.length; i++) {
        paddedEmailArray[i] = emailBigIntArray[i];
    }

    // gettin the chunks
    const chunks = chunkArray(paddedEmailArray, 16);

    // ..hashing each chunk like in the circuit
    const chunkHashes = chunks.map(chunk => {
        if (chunk.length < 16) {
            const paddedChunk = new Array(16).fill(0n);
            for (let i = 0; i < chunk.length; i++) {
                paddedChunk[i] = chunk[i];
            }
            return poseidon(paddedChunk);
        } else {
            return poseidon(chunk);
        }
    });
    const finalHash = poseidon([...chunkHashes, ...saltBigIntArray]);
    console.log("hashing with poseidon done");

    return finalHash.toString();
}
