const isAppleDevice = (window.navigator.userAgent.match(/iPad/) || window.navigator.userAgent.match(/iPhone/));
checkAnim();

const nftMint = {
  account: null,
  connected: false,
  provider: null,
  cprovider: null,
  contract: null,
  chainStatus: null,
  supply: null,
  total: null,
  minMint: 1,
  maxMint: 1,
  canMint: false,
  mintedOut: false,
  owner: null,
  balance: 0,
  nfts: [],
  txhash: '',
  eSpaceBlockNumber: 0,
  eSpaceAccount: '',


  init: async function() {
    clog.log("nftMint.init");
    this.provider = new ethers.providers.JsonRpcProvider(espaceProvider);
    this.contract = new ethers.Contract(eSpaceAddress, NFTABI, this.provider);

    this.updateNumbers();

  },

  updateNumbers: async function(noTimeout=false) {

    this.loadNFTs();

    clog.log("nftMint.updateNumbers");
    let _totalToMint = await this.contract.totalToMint();
    let totalToMint = bnToBigInt(_totalToMint);
    this.total = totalToMint;

    let _totalSupply = await this.contract.totalSupply();
    let totalSupply = bnToBigInt(_totalSupply);
    this.supply = totalSupply;


    let _maxMint = await this.contract.maxMint();
    this.maxMint = bnToBigInt(_maxMint);
    
    this.updateUI();
   
    if (!this.mintedOut && !noTimeout)
    {
      setTimeout(function() { nftMint.updateNumbers(); }, 30000);
    }
  },

  updateUI: async function() {
    clog.log("nftMint.updateUI");
    if (this.supply == this.total) {
      // Minted out
      this.mintedOut = true;
      this.canMint = false;
    } else 
    {
      this.mintedOut = false;
      this.canMint = true;
    }

    if (!this.canMint) {
      $("#mint-btn").removeClass("disabled").addClass("disable");
    } else 
    {
      $("#mint-btn").removeClass("disabled");
    }
    if (this.mintedOut) {
      $("#minted-out").removeClass("hidden");
    } 

    if (this.connected) {
      $("#mm-overlay").addClass("onEspaceShow");
    }

    $("#mint-data").text(this.supply + " / " + this.total);


    // toggle maxmint
    let _num = $("#number").text();
    let num = parseInt(_num);
    if (num > this.maxMint)
    {
      $("#number").text(this.maxMint);
    }
  },

  connectWallet: async function() {

    clog.log("connectWallet");

    if (typeof window.ethereum === 'undefined') {
      clog.log("metamask not installed");
      showError('Please install Metamask');
      return;
    }

    if (ethereum.networkVersion != currentChainId) {
      clog.log("wrong network", ethereum.networkVersion);
      if (THIS_ENV.env == "TEST")
      {
        showError('Wrong network. Please switch Metamask to Conflux ESpace testnet.');
      } else 
      {
        showError('Wrong network. Please switch Metamask to Conflux ESpace mainnet.');
      }
      return;
    }

    this.cprovider = new ethers.providers.Web3Provider(window.ethereum);

    const accounts = await this.cprovider.send("eth_requestAccounts", []);

    if (accounts.length === 0) {
      clog.log('RequestAccounts failed');
      showError('Could not get Wallet address from Metamask.');
      return;
    }

    localStorage.setItem('espaceConnected', true);

    this.account = accounts[0];
    this.connected = true;

    const _balance = await this.cprovider.getBalance(this.account);
    const balance = ethers.utils.formatEther(_balance);
    if (!balance && balance !== 0) {
      clog.log('Balance loading failed', _balance, balance);
      showError('Could not get Wallet balance from Metamask.');
      return;
    }
    this.balance = balance;    
    
    const signer = this.cprovider.getSigner();
    this.contract = this.contract.connect(signer);  
    let blockNumber = await this.cprovider.getBlockNumber()

    console.log("espaceBlockNumber", blockNumber);

    this.blockNumber = blockNumber;

    this.updateNumbers(true);

  },

  loadNFTs: async function() {
    
    clog.log("nftMint.loadNFTs");

    if (!!this.connected && !!this.account)
    {
      
      let balance = await this.contract.balanceOf(this.account);
      if (balance == 0) {

        return;
      }

      $("#your-nfts").removeClass("hidden");
      
      let nftstr = '';
      for (let i=1; i<=this.supply; i++)
      {
        let owner = String(await this.contract.ownerOf(i)).toLowerCase();
        let account = String(this.account).toLowerCase();

        clog.log(account, owner);
        if (account == owner)
        {
          let rawnft = await this.contract.tokenURI(i);
          let rawArr = String(rawnft).split(',');
          let obj = JSON.parse(atob(rawArr[1]));
          if (obj && obj.image)
          {

            nftstr += '<img class="nft" src="'+obj.image+'" alt="ConColor #'+i+'" />';
          }
        }      
      }

      if (nftstr.length > 0)
      {
        $("#nfts").html(nftstr);
      
      }
    }
  },

  mint: async function(amount) {
    
    if (this.mintedOut) {
      showError('Sorry! No more NFTs to mint. We are minted out!');
      return;
    }

    if (!this.connected) {
      showError('Connect your wallet first!');
      return;
    }

    showTimedNotice("Confirm the "+amount+"x mint transaction in your browser wallet", 4000);

    try {
      let hash = await this.contract.claim(amount);

      showHashPopup(hash);

      this.waitTx(hash).then(receipt => {
        if (receipt.status === 0) {
  
          showHashReadyPopup(hash);
  
          nftMint.loadNFTs();
  
        } else {
  
          showHashErrorPopup("Sorry! Mint failed.", hash);
  
        }
      });

    } catch(e) {
      clog.log(e);
      showError("Sorry! Mint failed. " + e.data.data);
      return;
    }
    
  }, 

  waitTx: async function(hash) {
    let count = 0;
    while(count < 20) {
      let receipt = await this.cprovider.getTransactionReceipt(hash);
      if (receipt) {
        return {
          receipt,
          status: receipt.status === 1 ? 0 : 1,  // 0: success other: failed
        };
      }
      await usleep(3000);  // wait 3s
      count++;
    }
    return null;
  },

}

// JQuery ready 
$(function () {
  jQuery_init();
});

// Jquery Init
function jQuery_init()
{

  let url = THIS_ENV.scan + '/token/' + THIS_ENV.address;
  $("#contract").html('<a href="'+url+'" target="_blank">[ '+THIS_ENV.address+' ]</a>')

  $("#mint-btn").click(function() {
    let _num = $("#number").text();
    let num = parseInt(_num);
    if (num < nftMint.minMint)
    {
      num = nftMint.minMint;
    }
    if (num > nftMint.maxMint)
    {
      num = nftMint.maxMint;
    }

    nftMint.mint(num);
  });

	$("#bg-anim-toggle").click(function() {
    animToggleClick();
	});

  $("#buttonminus").click(function() {
    let _num = $("#number").text();
    let num = parseInt(_num);
    if (num == nftMint.minMint)
    {
      return;
    }
    num--;
    $("#number").text(num);
  });

  $("#buttonplus").click(function() {
    let _num = $("#number").text();
    let num = parseInt(_num);
    if (num == nftMint.maxMint)
    {
      return;
    }
    num++;
    $("#number").text(num);
	});

  $("#top-bar-conf-btn").click(function() {
    $("#top-bar-conf-cmds").toggle();
    $("#top-bar-conf-btn").toggleClass("btn-is-active");
	});
  
  $("#mm-button .wallet-button-text").click(function () {
    showTimedNotice("Attempting connecting to Metamask Wallet.", 3000);
    nftMint.connectWallet();
  });

  $("#info-button-text").click(function () {
    showPopup("popup4");
  });

  $(".info-faq-heading").click(function () {
    let faq = $(this).attr("data-faq");
    toggleFaq(faq);
  });

  nftMint.init();
}


// Main
let eSpaceAddress = THIS_ENV.address;
let currentChainId = THIS_ENV.networkId;
let scanUrl = THIS_ENV.scan;
let espaceProvider = THIS_ENV.url;

