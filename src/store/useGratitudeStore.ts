import { create } from 'zustand'

export interface GratitudeNFT {
  id: string
  tokenId: number
  message: string
  owner: string
  originalAuthor: string
  messageDate: number
  gratitudeNumber: number
  imageUrl: string
  transactionHash?: string
}

interface GratitudeStore {
  // State
  recentNFTs: GratitudeNFT[]
  userNFTs: GratitudeNFT[]
  isLoading: boolean
  error: string | null
  
  // Minting state
  isMinting: boolean
  mintingMessage: string
  
  // Actions
  setRecentNFTs: (nfts: GratitudeNFT[]) => void
  setUserNFTs: (nfts: GratitudeNFT[]) => void
  addNewNFT: (nft: GratitudeNFT) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setMinting: (minting: boolean) => void
  setMintingMessage: (message: string) => void
  clearError: () => void
}

export const useGratitudeStore = create<GratitudeStore>((set, get) => ({
  // Initial state
  recentNFTs: [],
  userNFTs: [],
  isLoading: false,
  error: null,
  isMinting: false,
  mintingMessage: '',
  
  // Actions
  setRecentNFTs: (nfts) => set({ recentNFTs: nfts }),
  
  setUserNFTs: (nfts) => set({ userNFTs: nfts }),
  
  addNewNFT: (nft) => set((state) => ({
    recentNFTs: [nft, ...state.recentNFTs].slice(0, 100), // Keep only latest 100
    userNFTs: [nft, ...state.userNFTs],
  })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setError: (error) => set({ error }),
  
  setMinting: (minting) => set({ isMinting: minting }),
  
  setMintingMessage: (message) => set({ mintingMessage: message }),
  
  clearError: () => set({ error: null }),
})) 