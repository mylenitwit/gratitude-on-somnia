'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract } from 'wagmi'
import { CONTRACT_CONFIG } from '@/lib/config'
import { getMultipleGratitudeData, GratitudeData, debugContractConnection } from '@/lib/contract'
import { ConnectButton } from '@/components/ConnectButton'
import { NFTTemplate, NFTTemplateCompact } from '@/components/NFTTemplate'
import { formatDistanceToNow } from 'date-fns'

interface UserNFTCardProps {
  tokenId: number
  gratitudeData: GratitudeData
  onClick: () => void
}

function UserNFTCard({ tokenId, gratitudeData, onClick }: UserNFTCardProps) {
  return (
    <div 
      onClick={onClick}
      className="glass-card rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden border border-purple-500/20 hover:border-purple-400/40"
    >
      {/* NFT Preview using React component */}
      <div className="aspect-square relative">
        <NFTTemplateCompact
          message={gratitudeData.message}
          number={Number(gratitudeData.gratitudeNumber)}
          className="rounded-t-xl"
        />
      </div>
      
      {/* NFT Info */}
      <div className="p-3">
        <div className="text-center">
          <span className="text-xs text-purple-400">
            {formatDistanceToNow(new Date(Number(gratitudeData.timestamp) * 1000), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  )
}

interface NFTDetailModalProps {
  isOpen: boolean
  onClose: () => void
  tokenId: number
  gratitudeData: GratitudeData
}

function NFTDetailModal({ isOpen, onClose, tokenId, gratitudeData }: NFTDetailModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="glass-mystical rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-purple-500/30">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-cosmic font-serif">
              My Gratitude #{Number(gratitudeData.gratitudeNumber)}
            </h2>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-purple-100 text-2xl"
            >
              ×
            </button>
          </div>

          {/* NFT Image using React component */}
          <div className="aspect-square rounded-xl overflow-hidden mb-6">
            <NFTTemplate
              message={gratitudeData.message}
              number={Number(gratitudeData.gratitudeNumber)}
              className="rounded-xl"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-card rounded-lg p-4 border border-purple-500/20">
                <h4 className="font-medium text-purple-200 mb-1">Number</h4>
                <p className="text-purple-300">#{Number(gratitudeData.gratitudeNumber)}</p>
              </div>
            </div>

            <div className="glass-card rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-medium text-purple-200 mb-1">Message</h4>
              <p className="text-purple-300 italic">"{gratitudeData.message}"</p>
            </div>

            <div className="glass-card rounded-lg p-4 border border-purple-500/20">
              <h4 className="font-medium text-purple-200 mb-1">Manifested</h4>
              <p className="text-purple-300">
                {new Date(Number(gratitudeData.timestamp) * 1000).toLocaleString()}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <a
                href={`https://shannon-explorer.somnia.network/token/${CONTRACT_CONFIG.address}?a=${tokenId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 btn-mystical text-white text-center py-3 px-4 rounded-lg transition-colors"
              >
                View on Explorer
              </a>
              <button
                onClick={() => {
                  const shareText = `Check out my gratitude NFT: "${gratitudeData.message}" - Manifested on Somnia blockchain! ✨`
                  navigator.clipboard.writeText(shareText)
                  alert('Gratitude copied to clipboard!')
                }}
                className="flex-1 glass-card text-purple-200 py-3 px-4 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30"
              >
                Share Energy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const { address, isConnected } = useAccount()
  const [selectedNFT, setSelectedNFT] = useState<{ tokenId: number; data: GratitudeData } | null>(null)
  const [userNFTs, setUserNFTs] = useState<Array<{ tokenId: number; data: GratitudeData }>>([])
  const [isLoading, setIsLoading] = useState(false)

  // Get user's NFT balance
  const { data: userBalance } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  })

  // Get user's gratitude token IDs
  const { data: userTokenIds } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getUserGratitudes',
    args: address ? [address] : undefined,
  })

  // Debug effect
  useEffect(() => {
    if (address && isConnected) {
      console.log('🔍 Profile Debug - Address:', address)
      console.log('🔍 Profile Debug - User Balance:', userBalance)
      console.log('🔍 Profile Debug - User Token IDs:', userTokenIds)
      debugContractConnection(address)
    }
  }, [address, isConnected, userBalance, userTokenIds])

  useEffect(() => {
    const fetchUserNFTs = async () => {
      if (!userTokenIds || userTokenIds.length === 0 || !address) {
        setUserNFTs([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      
      try {
        const tokenIdNumbers = userTokenIds.map(id => Number(id))
        console.log('🔍 Fetching NFT data for tokens:', tokenIdNumbers)
        
        const results = await getMultipleGratitudeData(tokenIdNumbers)
        console.log('🔍 NFT data results:', results)
        
        const validResults = results.filter(Boolean) as Array<{ tokenId: number; data: GratitudeData }>
        console.log('🔍 Valid NFT results:', validResults)
        
        setUserNFTs(validResults)
      } catch (error) {
        console.error('Error fetching user NFTs:', error)
        setUserNFTs([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserNFTs()
  }, [userTokenIds, address])

  // Calculate statistics
  const totalNFTs = userNFTs.length
  const firstMintDate = userNFTs.length > 0 
    ? new Date(Math.min(...userNFTs.map(nft => Number(nft.data.timestamp) * 1000)))
    : null
  const daysSinceMinting = firstMintDate 
    ? Math.floor((Date.now() - firstMintDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Mystical background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float text-purple-300">🌟</div>
          <div className="absolute top-20 right-20 text-4xl opacity-20 animate-pulse-mystical text-pink-300">✨</div>
          <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-float text-blue-300" style={{ animationDelay: '2s' }}>🔮</div>
          <div className="absolute bottom-10 right-10 text-3xl opacity-20 animate-pulse-mystical text-indigo-300" style={{ animationDelay: '1s' }}>🌙</div>
        </div>

        <div className="text-center relative z-10">
          <div className="glass-mystical rounded-2xl p-8 max-w-md mx-auto border border-purple-500/30">
            <div className="text-6xl mb-4 animate-glow">🙏</div>
            <h1 className="text-4xl font-bold text-cosmic mb-4 font-serif">
              Your Profile
            </h1>
            <p className="text-lg text-purple-200 mb-8">
              Connect your wallet to access your mystical gratitude journey
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Mystical background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-4xl opacity-10 animate-float text-purple-300">🌟</div>
        <div className="absolute top-20 right-20 text-3xl opacity-10 animate-pulse-mystical text-pink-300">✨</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-10 animate-float text-blue-300" style={{ animationDelay: '2s' }}>🔮</div>
        <div className="absolute bottom-10 right-10 text-2xl opacity-10 animate-pulse-mystical text-indigo-300" style={{ animationDelay: '1s' }}>🌙</div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cosmic mb-4 font-serif animate-glow">
            Your Gratitude Journey
          </h1>
          <p className="text-lg text-purple-200">
            Welcome back! Here's your mystical gratitude collection.
          </p>
          <p className="text-sm text-purple-400 mt-2 font-mono glass-card inline-block px-3 py-1 rounded-full border border-purple-500/30">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
        </div>

        {/* Statistics */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group">
              <div className="text-3xl font-bold text-cosmic mb-2 group-hover:animate-glow">
                {totalNFTs}
              </div>
              <div className="text-purple-300">
                Gratitudes
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group">
              <div className="text-3xl font-bold text-cosmic mb-2 group-hover:animate-glow">
                {daysSinceMinting}
              </div>
              <div className="text-purple-300">
                Days of Journey
              </div>
            </div>
            
            <div className="glass-card rounded-xl p-6 text-center border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group">
              <div className="text-3xl font-bold text-cosmic mb-2 group-hover:animate-glow">
                {firstMintDate ? firstMintDate.toLocaleDateString() : 'N/A'}
              </div>
              <div className="text-purple-300">
                First Manifestation
              </div>
            </div>
          </div>
        </div>

        {/* User's NFTs */}
        <div className="max-w-6xl mx-auto">
          <div className="glass-mystical rounded-xl p-6 mb-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-purple-200 mb-6 font-serif">
              My Collection ({totalNFTs})
            </h2>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
                <p className="text-purple-300 mt-4">Loading your energies...</p>
              </div>
            ) : userNFTs.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 animate-glow">🙏</div>
                <h3 className="text-xl font-semibold text-purple-200 mb-2 font-serif">
                  No gratitudes yet
                </h3>
                <p className="text-purple-300 mb-6">
                  Begin your mystical journey by manifesting your first gratitude
                </p>
                <a
                  href="/mint"
                  className="btn-mystical text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-block"
                >
                  ✨ Manifest Your First Gratitude ✨
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {userNFTs
                  .sort((a, b) => Number(b.data.timestamp) - Number(a.data.timestamp))
                  .map((nft) => (
                    <UserNFTCard
                      key={nft.tokenId}
                      tokenId={nft.tokenId}
                      gratitudeData={nft.data}
                      onClick={() => setSelectedNFT(nft)}
                    />
                  ))}
              </div>
            )}
          </div>

          {/* Gratitude Timeline */}
          {userNFTs.length > 0 && (
            <div className="glass-mystical rounded-xl p-6 border border-purple-500/30">
              <h2 className="text-2xl font-bold text-purple-200 mb-6 font-serif">
                Timeline
              </h2>
              
              <div className="space-y-4">
                {userNFTs
                  .sort((a, b) => Number(b.data.timestamp) - Number(a.data.timestamp))
                  .slice(0, 5) // Show last 5 gratitudes
                  .map((nft) => (
                    <div key={nft.tokenId} className="flex items-start space-x-4 p-4 glass-card rounded-lg border border-purple-500/20">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm animate-glow">
                        #{Number(nft.data.gratitudeNumber)}
                      </div>
                      <div className="flex-1">
                        <p className="text-purple-200 mb-1">"{nft.data.message}"</p>
                        <p className="text-sm text-purple-400">
                          {formatDistanceToNow(new Date(Number(nft.data.timestamp) * 1000), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                
                {userNFTs.length > 5 && (
                  <div className="text-center pt-4">
                    <p className="text-purple-400 text-sm">
                      And {userNFTs.length - 5} more gratitudes in your collection...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* NFT Detail Modal */}
        {selectedNFT && (
          <NFTDetailModal
            isOpen={!!selectedNFT}
            onClose={() => setSelectedNFT(null)}
            tokenId={selectedNFT.tokenId}
            gratitudeData={selectedNFT.data}
          />
        )}
      </div>
    </div>
  )
} 