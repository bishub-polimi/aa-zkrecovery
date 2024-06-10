# aa-zkrecovery

## Installation

```bash
yarn install

```

Before following the below instructions, make sure to have copied your raw email into a .eml file inside ./packages/circuits/tests


## Generate the inputs 
Here you should replace the 
`--wallet-address` ,  `--plain-email-address` and `--salt-string` inside package.json scripts. 

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