/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");

module.exports = {
   solidity: "0.8.4",
   defaultNetwork: "hardhat",
   networks: {
      hardhat: {
				chainId: 1337,
      },
      espace: {
         url: "https://evm.confluxrpc.com/",
         accounts: [ process.env.PRIVATE_KEY ]
      },
      espacetest: {
         url: "https://evmtestnet.confluxrpc.com/",
         accounts: [ process.env.PRIVATE_KEY ]
      }
   },
   mocha: {
     timeout: 60000
   },
}
