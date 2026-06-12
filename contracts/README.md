# GardenSignal Contract

This contract is the complete onchain source for Garden Signal. It has exactly three write functions and no token, fee, reward, invite, admin, or limit logic.

## Source

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract GardenSignal {
    mapping(address => uint256) public userSprouts;
    mapping(address => uint256) public userBlooms;
    mapping(address => uint256) public userBreezes;

    uint256 public totalSprouts;
    uint256 public totalBlooms;
    uint256 public totalBreezes;

    event SproutWatered(address indexed user, uint256 userSprouts, uint256 totalSprouts);
    event BloomWarmed(address indexed user, uint256 userBlooms, uint256 totalBlooms);
    event BreezeSent(address indexed user, uint256 userBreezes, uint256 totalBreezes);

    function waterSprout() external {
        unchecked {
            userSprouts[msg.sender] += 1;
            totalSprouts += 1;
        }
        emit SproutWatered(msg.sender, userSprouts[msg.sender], totalSprouts);
    }

    function warmBloom() external {
        unchecked {
            userBlooms[msg.sender] += 1;
            totalBlooms += 1;
        }
        emit BloomWarmed(msg.sender, userBlooms[msg.sender], totalBlooms);
    }

    function sendBreeze() external {
        unchecked {
            userBreezes[msg.sender] += 1;
            totalBreezes += 1;
        }
        emit BreezeSent(msg.sender, userBreezes[msg.sender], totalBreezes);
    }
}
```

## Frontend ABI Match

The frontend ABI in `lib/abi.ts` matches these read and write methods:

- `userSprouts(address)`
- `userBlooms(address)`
- `userBreezes(address)`
- `totalSprouts()`
- `totalBlooms()`
- `totalBreezes()`
- `waterSprout()`
- `warmBloom()`
- `sendBreeze()`

After deployment on Base, update `contractAddress` in `lib/wagmi.ts`.
