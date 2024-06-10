function stringToByteArray(str: string): number[] {
    return Array.from(new TextEncoder().encode(str));
}

function packBytesToBigInt(byteArray: number[]): bigint {
    let packedInt = BigInt(0);
    for (let i = 0; i < byteArray.length; i++) {
        packedInt |= BigInt(byteArray[i]) << (BigInt(8) * BigInt(i));
    }
    return packedInt;
}

export function extractAndPackEmail(email: string, startIndex: number, maxRevealLen: number): bigint[] {
    const byteArray = stringToByteArray(email);
    const extractedBytes = byteArray.slice(startIndex, startIndex + maxRevealLen);
    const packedBigInt = packBytesToBigInt(extractedBytes);
    // Ensure the output is an array of length 9, filled with 0s except the first element
    const result = Array(9).fill(BigInt(0));
    result[0] = packedBigInt;
    return result;
}