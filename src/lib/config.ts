import { defineChain } from 'viem'

// Somnia Network Configuration
export const somniaNetwork = defineChain({
  id: 50312,
  name: 'Somnia',
  nativeCurrency: {
    decimals: 18,
    name: 'STT',
    symbol: 'STT',
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://shannon-explorer.somnia.network/',
    },
  },
})

// App Configuration
export const APP_CONFIG = {
  name: 'Gratitude on Somnia',
  description: 'A decentralized platform for minting daily gratitude moments as NFTs',
  url: 'https://gratitude-on-somnia.com',
  mintPrice: '0.01', // STT
  maxMessageLength: 280,
  recentNFTsLimit: 100,
}

// Contract ABI
export const CONTRACT_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "name", "type": "string"},
      {"internalType": "string", "name": "symbol", "type": "string"},
      {"internalType": "string", "name": "baseTokenURI", "type": "string"}
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "string", "name": "message", "type": "string"},
      {"internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "name": "mintGratitude",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "getGratitude",
    "outputs": [
      {
        "components": [
          {"internalType": "string", "name": "message", "type": "string"},
          {"internalType": "address", "name": "originalAuthor", "type": "address"},
          {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
          {"internalType": "uint256", "name": "gratitudeNumber", "type": "uint256"}
        ],
        "internalType": "struct GratitudeNFT.GratitudeData",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserGratitudes",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "count", "type": "uint256"}],
    "name": "getRecentGratitudes",
    "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MINT_PRICE",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "exists",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

// Contract Configuration - DEPLOYED ON SOMNIA!
export const CONTRACT_CONFIG = {
  address: '0xf2939b8707c74e38ff682143432a3bf6b4e76abd' as `0x${string}`,
  abi: CONTRACT_ABI,
}



// Social Media Links
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/gratitude_somnia',
  discord: 'https://discord.gg/gratitude-somnia',
  github: 'https://github.com/gratitude-on-somnia',
} 