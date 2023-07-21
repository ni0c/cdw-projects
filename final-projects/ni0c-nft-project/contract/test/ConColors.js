const { expect, use } = require('chai');
const { ethers } = require('hardhat');
const { solidity } = require('ethereum-waffle');
use(solidity);


describe('ConColors', () => {
	let contract;
  let ucontract;
  let owner;
  let addr1;
  let addr2;
  let tx;

  beforeEach(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    contract = await ethers.deployContract("ConColors");
  });

  it('should deploy the contract correctly', async () => {
    expect(contract.address).to.not.be.undefined;
  });

	it('10 nfts should be airdropped to owner at deploy', async () => {
    const totalSupply = await contract.totalSupply();
		expect(totalSupply).to.equal(10);
    const ownerOfToken = await contract.ownerOf(10);
    expect(ownerOfToken).to.equal(owner.address);
    const tokenURI = await contract.tokenURI(10);  
    expect(tokenURI.split(",")[0]).to.equal("data:application/json;base64");
  });

  it('should mint a nft', async () => {
    ucontract = await contract.connect(addr1);
    tx = await ucontract.claim(1);
    await tx.wait();
    const totalSupply = await contract.totalSupply();
    expect(totalSupply).to.equal(11);
    const ownerOfToken = await contract.ownerOf(11);
    expect(ownerOfToken).to.equal(addr1.address);
    const tokenURI = await contract.tokenURI(11);  
    expect(tokenURI.split(",")[0]).to.equal("data:application/json;base64");
  });

  it('should only allow the owner to be able to airdrop tokens', async () => {
    ucontract = await contract.connect(addr1);
    await expect(ucontract.airdrop(1)).to.be.revertedWith(
      'Ownable: caller is not the owner'
    );
  });

	it('should airdrop 5 new tokens to owner', async () => {
    tx = await contract.airdrop(5);
    await tx.wait();
    const totalSupply = await contract.totalSupply();
    expect(totalSupply).to.equal(15);
    const ownerOfToken = await contract.ownerOf(15);
    expect(ownerOfToken).to.equal(owner.address);
    const tokenURI = await contract.tokenURI(15);  
    expect(tokenURI.split(",")[0]).to.equal("data:application/json;base64");
  });

  it('should return valid token metadata and image', async () => {
    tx = await contract.claim(1);
    await tx.wait();
    const tokenURI = await contract.tokenURI(11);
    json = JSON.parse(atob(tokenURI.split(",")[1]));
    
    expect(Object.keys(json)).to.eql([ 'name', 'description','attributes','image' ]);
    expect(json.name).to.equal('ConColor: #11');
    expect(json.image.split(",")[0]).to.equal("data:image/svg+xml;base64");
    expect(json.attributes[0].trait_type).to.equal('Color');
  });

  it('reverts with error when minted out', async () => {

    for (let i = 0; i < 9; i++) {
      tx = await contract.airdrop(10);
      await tx.wait();
    }

    await expect(contract.airdrop(1)).to.be.revertedWith('Not possible to mint!');
  });

	it('reverts with error when trying to mint more than 2 for normal users - non-owners', async () => {
    ucontract = await contract.connect(addr1);
    await expect(ucontract.claim(3)).to.be.revertedWith('Not possible to mint!');
  });

	it('reverts with error when trying to claim mint more than 1 time for any user', async () => {
    tx = await contract.claim(1);
    await tx.wait();
		await expect(contract.claim(1)).to.be.reverted;
  });
  
  it('should create transfer event when minting nft', async () => {
    await expect(contract.claim(1)).to.emit(contract, 'Transfer').withArgs(ethers.constants.AddressZero, owner.address, 11);
  });
  
  it('should return the rightful owner of nft', async () => {
    ucontract = await contract.connect(addr1);
		tx = await ucontract.claim(1);
    await tx.wait();
    const ownerOfToken = await contract.ownerOf(11);
    expect(ownerOfToken).to.equal(addr1.address);
  });
  
  it('should revert when querying token URI for a nonexistent token', async () => {
    await expect(contract.tokenURI(0)).to.be.revertedWith('ERC721: invalid token ID');
  });
  
  it('should allow the owner to transfer a token', async () => {
    ucontract = await contract.connect(addr1);
		tx = await ucontract.claim(1);
    await tx.wait();
    tx = await ucontract.transferFrom(addr1.address, addr2.address, 11);
    await tx.wait();
    const newOwner = await contract.ownerOf(11);
    expect(newOwner).to.equal(addr2.address);
  });
  
  it('should revert when a non-owner tries to transfer a token', async () => {
    ucontract = await contract.connect(addr1);
    tx = await ucontract.claim(1);
    await tx.wait();
    ucontract = await contract.connect(addr2);
    await expect(ucontract.transferFrom(addr1.address, addr2.address, 11)).to.be.revertedWith(
      'ERC721: caller is not token owner or approved'
    );
  });
  
  it('should return the correct token balance for addresses', async () => {
    ucontract = await contract.connect(addr1);
    tx = await ucontract.claim(2);
    await tx.wait();
    ucontract = await contract.connect(addr2);
    tx = await ucontract.claim(1);
    await tx.wait();
    const balance1 = await contract.balanceOf(addr1.address);
    const balance2 = await contract.balanceOf(addr2.address);
    expect(balance1).to.equal(2);
    expect(balance2).to.equal(1);
  });

  it('should support the ERC721 interface', async () => {
    const supportsERC721 = await contract.supportsInterface('0x80ac58cd');
    expect(supportsERC721).to.be.true;
  });
  
});
