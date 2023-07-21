# ConColors - on-chain NFT Mint DApp - by Ni0c

## Project Info

ConColors is a simple single Color on-chain NFT Mint with royalties interface embedded and also supports multiple NFT minting at once.

This is one of the end products created in Conflux Developer Workshop Summer 2023.

## Features

- NFTs produced by this project are free to mint with limited supply of only 100!

- Contract includes royalties handler for future NFT marketplaces. It is compatible for.ex. Opensea and the like.

- Uses following technologies:
  - OpenZeppelin contracts
  - Hardhat for compiling, testing and deploying the smart contract
  - JQuery with Ethers for minting DApp

- Uses following Solidity tech in smart contract: 
  - ERC721
  - ERC2981
  - Ownable
  - Claimable
  - ReEntracyGuard

- Multiple NFT mints possible in one transaction

- NFT mint limiter guard, only one transaction is possible per wallet. Other attempts will fail.

- Airdrop possibility for Owner, multiple NFT airdrops possible at once. I tested it to have maximum airdrop of 30 in Conflux Espace testnet.

- Color of the NFT is random, which randomness depends on multiple factors; like blocktime, blockcount, nft ID and nft name combined, which makes it have pretty decent randomness as a whole.

- On-Chain NFTs are created dynamically inside the contract. Only color attribute is saved in an array that is fetched whenever NFT's tokenURI gets called and the onchain NFT json and SVG image is generated in the contract on-the-fly. SVG image and JSON metadata is stored in the contract code and are constructed dynamically whenever tokenURI gets called.

- ConColors NFT's Opensea compatibility should be 100%, as royalty ERC2981 is implemented and royalties are set in constructor. 
  - It's also possible to change default royalty receiver and amount later on interacting with the smart contract.

### Official Mint website

ConColors Mint Website:
[concolors.webomatic.xyz](https://concolors.webomatic.xyz/)

### Espace Contract

Deployed Contract on Conflux Espace:
[0xa505f0fc702e5ae4e6186356904ed7086c6892d6](https://evm.confluxscan.io/token/0xa505f0fc702e5ae4e6186356904ed7086c6892d6)

## NFT example

<img src="https://concolors.webomatic.xyz/concolor.svg" alt="Orange ConColors NFT example" width="400" height="400">

ConColors OnChain NFTs have only one attribute. Color - that is picked randomly (Color list below). As the process is 100% random, it's not possible to know which color will be the most rare, or most common. It's also possible that some of the colors will never be created as there is only 100 NFTs ever to be created.

Color list:
- Orange
- BlanchedAlmond
- Aquamarine
- DarkMagenta
- Coral
- CornflowerBlue
- DarkRed
- DarkBlue
- DarkOliveGreen
- DarkSlateBlue
- DeepPink
- DeepSkyBlue
- DarkTurquoise
- Gold
- Ivory
- Lavender
- LemonChiffon
- Plum
- Sienna
- SlateGray
- YellowGreen

## Frontend

<img src="https://concolors.webomatic.xyz/concolors.png" alt="ConColors Frontend" width="800" height="448.6">

## Installing and testing Contracts and Frontend locally

Frontend is located at `frontend` subdirectory.

Contracts are located at `contract` subdirectory.

You can install the packages from npm in `contract` subdirectory, by running the following command:

```bash
cd contract
npm install
```

Frontend doesnt require any installing. You can just copy-and-paste the whole directory to web server of your choosing, like `Apache Server 2` or even just have the files hosted on `github` as the files are static files only. You can edit the `index.html` to have the website information and `config.js` to have the contracts you have deployed.

### Testing contracts

You can run the tests on the contract by running the following command:

```bash
cd contract
npx hardhat test
```

If you wish to deploy on testnet and test there, then;
1. first you need to make a new wallet for.ex. with Metamask. 
1. Add Conflux Espace Testnet via for.ex. `Chainlist` website. 
1. Get CFX from Conflux Espace testnet faucet
1. You must edit `.env` file and add your private key to `PRIVATE_KEY` 
1. Lastly run following command:
```bash
cd contract
npx hardhat deploy --network espacetest
```
Remember to pick up the created contract address after above command and add that to the `config.js` on the `frontend` directory and add the files to a test web server of your choosing or even test it from local files of your computer with a web browser - should  be possible to do as the files are static.

### Test Results 

```bash

$ cd contract; npx hardhat test 

  ConColors
    ✔ should deploy the contract correctly
    ✔ 10 nfts should be airdropped to owner at deploy (180ms)
    ✔ should mint a nft (208ms)
    ✔ should only allow the owner to be able to airdrop tokens (50ms)
    ✔ should airdrop 5 new tokens to owner (303ms)
    ✔ should return valid token metadata and image (192ms)
    ✔ reverts with error when minted out (2543ms)
    ✔ reverts with error when trying to mint more than 2 for normal users - non-owners
    ✔ reverts with error when trying to claim mint more than 1 time for any user (45ms)
    ✔ should create transfer event when minting nft (53ms)
    ✔ should return the rightful owner of nft (46ms)
    ✔ should revert when querying token URI for a nonexistent token
    ✔ should allow the owner to transfer a token (58ms)
    ✔ should revert when a non-owner tries to transfer a token (59ms)
    ✔ should return the correct token balance for addresses (110ms)
    ✔ should support the ERC721 interface


  16 passing (21s)

```

