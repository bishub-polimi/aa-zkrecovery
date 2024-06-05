declare module 'circomlibjs' {
    export const buildEddsa: any;
    export const buildPedersenHash: any;
    export const buildPoseidon: any;
}

declare module 'circomlibjs/src/mimcsponge.js' {
    const mimcSponge: any;
    export default mimcSponge;
}
