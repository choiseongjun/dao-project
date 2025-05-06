// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract VAToken is ERC20, Ownable {
    constructor() ERC20("VA Token", "VA") Ownable(msg.sender) {
        // 초기 발행량: 1,000,000 VA 토큰
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 18;
    }
} 