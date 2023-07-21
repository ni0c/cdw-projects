const ESPACE_MAIN_NET = {
  url: 'https://evm.confluxrpc.com',
  networkId: 1030,
  scan: 'https://evm.confluxscan.io',
	address: '0xa505f0fc702e5ae4e6186356904ed7086c6892d6',
  txurl: "https://evm.confluxscan.io/tx/",
  env: "PROD",
};

const ESPACE_TEST_NET = {
  url: 'https://evmtestnet.confluxrpc.com',
  networkId: 71,
  scan: 'https://evmtestnet.confluxscan.io',
	address: '0x4d6f65cdb014da102f2217c8834e82da753e0420',
  txurl: "https://evm.confluxscan.io/tx/",
  env: "TEST",
};

// Set current enviroment to use with THIS_ENV
const THIS_ENV = ESPACE_TEST_NET; // Testnet env
//const THIS_ENV = ESPACE_MAIN_NET; // Production env

const DEBUG = true;
//const DEBUG = false;
