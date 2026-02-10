export const MAGIC_STONE_ABI = [
    {
        "inputs": [
            { "internalType": "address", "name": "to", "type": "address" },
            { "internalType": "string", "name": "archetype", "type": "string" },
            { "internalType": "uint8", "name": "level", "type": "uint8" }
        ],
        "name": "safeMint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
        "name": "balanceOf",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    }
] as const;

export const CONTRACT_ADDRESS = "0x0882a70a601E0C4D52a114EeD9C1806f9193F849";
