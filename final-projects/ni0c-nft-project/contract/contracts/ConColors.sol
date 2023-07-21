// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./Claimable.sol";

contract ConColors is ERC721, ERC2981, Ownable, ReentrancyGuard, Claimable {

	using Counters for Counters.Counter;
	Counters.Counter private _tokenIds;

	mapping(address => bool) public claimers;

	uint256 public totalToMint = 100;
	uint256 public maxMint = 2;

	uint256 private _colorsCount = totalToMint+1;
	uint256[] private tokenColors = new uint256[](_colorsCount);

	constructor() ERC721("ConColors", "CNCLRS") {
		address _royaltyAddress = _msgSender();
		uint96 _feeNumerator = 690;
		_setDefaultRoyalty(_royaltyAddress, _feeNumerator);
 		_tokenIds.increment();
		airdrop(10);
	}

	string[] private colors = ['Orange','BlanchedAlmond','Aquamarine','DarkMagenta','Coral','CornflowerBlue','DarkRed','DarkBlue','DarkOliveGreen','DarkSlateBlue','DeepPink','DeepSkyBlue','DarkTurquoise','Gold','Ivory','Lavender','LemonChiffon','Plum','Sienna','SlateGray','YellowGreen'];

 	modifier onlyNotClaimed {
  	require(claimers[_msgSender()] == false, "You already claimed");
  	_;
  }

	modifier notMintedOut {
		uint256 curId = _tokenIds.current() - 1;
		require(curId <= totalToMint, "Minted out already!");
  	_;
	}

	function totalSupply() public view returns (uint256) {
		return _tokenIds.current() - 1;
	}

	function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC2981) returns (bool) {
		return ERC721.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
	}

  /**
  * @dev Withdraws the erc20 tokens or native coins from this contract.
  */
  function claimValues(address _token, address _to) external onlyOwner {
  	_claimValues(_token, _to);
  }

	/**
  * @dev Default royalty set function
  */
  function setDefaultRoyalty(address _receiver, uint96 _feeNumerator) external onlyOwner {
    _setDefaultRoyalty(_receiver, _feeNumerator);
  }

	function tokenURI(uint256 tokenId) override public view returns (string memory) {
		_requireMinted(tokenId);
		string[5] memory parts;
		string memory color = getColor(tokenId, colors);
		parts[0] = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.dev/svgjs" viewBox="0 0 1080 1080" width="1080" height="1080"><defs><linearGradient x1="50%" y1="0%" x2="50%" y2="100%" id="grad1"><stop stop-color="';
		parts[1] = color;
		parts[2] = '" stop-opacity="1"></stop><stop stop-color="';
		parts[3] = color;
		parts[4] = '" stop-opacity="0.69" offset="100%"></stop></linearGradient></defs><g><rect width="100%" height="100%" fill="#ffffff"></rect><rect width="100%" height="100%" fill="url(#grad1)"></rect></g></svg>';
		string memory output = string(abi.encodePacked(parts[0], parts[1], parts[2], parts[3], parts[4]));
		string memory jsonpart = string(abi.encodePacked('"attributes":[{"trait_type":"Color","value":"',color,'"}],'));
		string memory json = Base64.encode(bytes(string(abi.encodePacked('{"name":"ConColor: #', toString(tokenId), '","description":"ConColor - Color OnChain NFTs on Conflux ESpace",', jsonpart, '"image":"data:image/svg+xml;base64,', Base64.encode(bytes(output)), '"}'))));
		output = string(abi.encodePacked('data:application/json;base64,', json));
		return output;
	}

	function toString(uint256 value) internal pure returns (string memory) {
		// Inspired by OraclizeAPI's implementation - MIT license
		// https://github.com/oraclize/ethereum-api/blob/b42146b063c7d6ee1358846c198246239e9360e8/oraclizeAPI_0.4.25.sol
		if (value == 0) {
			return "0";
		}
		uint256 temp = value;
		uint256 digits;
		while (temp != 0) {
			digits++;
			temp /= 10;
		}
		bytes memory buffer = new bytes(digits);
		while (value != 0) {
			digits -= 1;
			buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
			value /= 10;
		}
		return string(buffer);
	}
    
	function getRandom(uint256 tokenId, string memory keyPrefix, string[] memory sourceArray) internal view returns (uint256) {
		uint256 rand = random(string(abi.encodePacked(block.difficulty, block.timestamp, keyPrefix, toString(tokenId))));
		uint256 output = rand % sourceArray.length;
		return output;
	}

	function random(string memory input) internal pure returns (uint256) {
		return uint256(keccak256(abi.encodePacked(input)));
	}
    
	function getColor(uint256 tokenId, string[] memory sourceArray) internal view returns (string memory){
		string memory output = sourceArray[tokenColors[tokenId]];
		return output;
	}

	function getRandomColor(uint256 tokenId) internal view returns (uint256){
		return getRandom(tokenId, "Colors", colors);
	}

	function airdrop(uint256 _amount) public onlyOwner notMintedOut {
		uint256 totalCount = _amount + _tokenIds.current() - 1;
		if (totalCount > totalToMint) {
			revert("Not possible to mint!");
		}
		for (uint256 i = 1; i <= _amount; i++) {
			_mint_one();
		}      
	}

	function claim(uint256 _amount) public onlyNotClaimed notMintedOut nonReentrant {
		require(_amount >= 1 && _amount <= maxMint, "Not possible to mint!");
		uint256 totalCount = _amount + _tokenIds.current() - 1;
		if (totalCount > totalToMint) {
			revert("Not possible to mint!");
		}

		claimers[_msgSender()] = true;

		for (uint256 i = 1; i <= _amount; i++) {
			_mint_one();
		}      
	}

	function _mint_one() internal virtual {
		uint256 newItemId = _tokenIds.current();
		uint256 tokenColor = getRandomColor(newItemId);
		tokenColors[newItemId] = tokenColor;
		_tokenIds.increment();	
		_safeMint(_msgSender(), newItemId);
  }
}