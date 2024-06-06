# aa-zkrecovery

## Installation

```bash
yarn install

```

## Generate the inputs with

```bash
# CWD = root folder

npx ts-node packages/circuits/scripts/launch.ts --email-file packages/circuits/tests/test-rawemail.eml --wallet-address "0x........." --plain-email-address latuaemail@gmail.com --salt-string "latuastringasegreta"
```

## Compile the circuit(s)

```bash
# CWD = packages/circuits

yarn build
```