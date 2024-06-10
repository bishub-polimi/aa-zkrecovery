# aa-zkrecovery

## Installation

```bash
yarn install

```

For the following instruction you should check the specific commands in circuits/package.json to set your data

## Generate the inputs with

```bash
# CWD = root folder
yarn install
yarn gen-inputs
```

## Compile the circuit(s)

```bash
# CWD = packages/circuits

yarn build
```

## Compile the circuit(s)

```bash
# CWD = packages/circuits

yarn gen-witness
```

## Generate zKey and Verification Key

```bash
# CWD = packages/circuits

npx ts-node scripts/dev-setup.ts
```
## Generate proof and public inputs

```bash
# CWD = packages/circuits
time npx ts-node scripts/gen-proof.ts
```