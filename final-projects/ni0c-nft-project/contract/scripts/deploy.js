async function main() {
	const ConColors = await ethers.getContractFactory("ConColors");
	const contract = await ConColors.deploy();
	console.log("Contract deployed to address:", contract.address);
}

main()
 .then(() => process.exit(0))
 .catch(error => {
	 console.error(error);
	 process.exit(1);
 });
