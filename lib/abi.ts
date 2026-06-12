export const gardenSignalAbi = [
  {
    type: "function",
    name: "userSprouts",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "userBlooms",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "userBreezes",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "totalSprouts",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "totalBlooms",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "totalBreezes",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }]
  },
  {
    type: "function",
    name: "waterSprout",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "warmBloom",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "function",
    name: "sendBreeze",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: []
  },
  {
    type: "event",
    name: "SproutWatered",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "userSprouts", type: "uint256", indexed: false },
      { name: "totalSprouts", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "BloomWarmed",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "userBlooms", type: "uint256", indexed: false },
      { name: "totalBlooms", type: "uint256", indexed: false }
    ],
    anonymous: false
  },
  {
    type: "event",
    name: "BreezeSent",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "userBreezes", type: "uint256", indexed: false },
      { name: "totalBreezes", type: "uint256", indexed: false }
    ],
    anonymous: false
  }
] as const;
