'use client'

import { useState, useEffect } from 'react'
import { useReadContract } from 'wagmi'
import { CONTRACT_CONFIG } from '@/lib/config'
import { getMultipleGratitudeData, GratitudeData, debugContractConnection } from '@/lib/contract'
import { formatDistanceToNow } from 'date-fns'
import { NFTTemplate, NFTTemplateCompact } from '@/components/NFTTemplate'

interface NFTCardProps {
  tokenId: number
  gratitudeData: GratitudeData
  onClick: () => void
}

function NFTCard({ tokenId, gratitudeData, onClick }: NFTCardProps) {
  return (
    <div 
      onClick={onClick}
      className="glass-card rounded-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden border border-purple-500/20 hover:border-purple-400/40"
    >
      {/* NFT Preview using React component */}
      <div className="aspect-[3/4] relative">
        <NFTTemplateCompact
          message={gratitudeData.message}
          number={Number(gratitudeData.gratitudeNumber)}
          className="rounded-t-xl"
        />
      </div>
      
      {/* NFT Info */}
      <div className="p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-purple-200">
            #{Number(gratitudeData.gratitudeNumber)}
          </span>
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
      <div className="glass-mystical rounded-2xl max-w-4xl w-full h-fit border border-purple-500/30">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-cosmic font-serif">
              Gratitude #{Number(gratitudeData.gratitudeNumber)}
            </h2>
            <button
              onClick={onClose}
              className="text-purple-300 hover:text-purple-100 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: NFT Image */}
            <div className="aspect-square rounded-xl overflow-hidden">
              <NFTTemplate
                message={gratitudeData.message}
                number={Number(gratitudeData.gratitudeNumber)}
                className="rounded-xl"
              />
            </div>

            {/* Right: Details */}
            <div className="space-y-3">
              <div className="glass-card rounded-lg p-3 border border-purple-500/20">
                <h4 className="font-medium text-purple-200 mb-1 text-sm">Number</h4>
                <p className="text-purple-300">#{Number(gratitudeData.gratitudeNumber)}</p>
              </div>

              <div className="glass-card rounded-lg p-3 border border-purple-500/20">
                <h4 className="font-medium text-purple-200 mb-1 text-sm">Message</h4>
                <p className="text-purple-300 italic text-sm">"{gratitudeData.message}"</p>
              </div>

              <div className="glass-card rounded-lg p-3 border border-purple-500/20">
                <h4 className="font-medium text-purple-200 mb-1 text-sm">Author</h4>
                <p className="text-purple-300 font-mono text-xs">{gratitudeData.originalAuthor}</p>
              </div>

              <div className="glass-card rounded-lg p-3 border border-purple-500/20">
                <h4 className="font-medium text-purple-200 mb-1 text-sm">Manifested</h4>
                <p className="text-purple-300 text-sm">
                  {new Date(Number(gratitudeData.timestamp) * 1000).toLocaleString()}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <a
                  href={`https://shannon-explorer.somnia.network/token/${CONTRACT_CONFIG.address}?a=${tokenId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 btn-mystical text-white text-center py-2 px-3 rounded-lg transition-colors text-sm"
                >
                  View on Explorer
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Link copied to clipboard!')
                  }}
                  className="flex-1 glass-card text-purple-200 py-2 px-3 rounded-lg hover:bg-purple-500/20 transition-colors border border-purple-500/30 text-sm"
                >
                  Share Energy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CollectionPage() {
  const [selectedNFT, setSelectedNFT] = useState<{ tokenId: number; data: GratitudeData } | null>(null)

  // Get total supply
  const { data: totalSupply } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'totalSupply',
  })

  // Get recent gratitudes (last 100)
  const { data: recentTokenIds } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'getRecentGratitudes',
    args: [BigInt(100)],
  })

  // Get gratitude data for each token
  const [gratitudeDataList, setGratitudeDataList] = useState<Array<{ tokenId: number; data: GratitudeData }>>([])
  const [isLoading, setIsLoading] = useState(true)

  // Debug effect
  useEffect(() => {
    console.log('🔍 Collection Debug - Total Supply:', totalSupply)
    console.log('🔍 Collection Debug - Recent Token IDs:', recentTokenIds)
    debugContractConnection()
  }, [totalSupply, recentTokenIds])

  useEffect(() => {
    const fetchGratitudeData = async () => {
      if (!recentTokenIds || recentTokenIds.length === 0) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const tokenIdNumbers = recentTokenIds.map(id => Number(id))
        console.log('🔍 Collection - Fetching data for tokens:', tokenIdNumbers)
        
        const results = await getMultipleGratitudeData(tokenIdNumbers)
        console.log('🔍 Collection - Results:', results)
        
        const validResults = results.filter(Boolean) as Array<{ tokenId: number; data: GratitudeData }>
        console.log('🔍 Collection - Valid results:', validResults)
        
        setGratitudeDataList(validResults)
      } catch (error) {
        console.error('Error fetching gratitude data:', error)
        // Fallback to empty array
        setGratitudeDataList([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchGratitudeData()
  }, [recentTokenIds])

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Mystical Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cosmic mb-4 font-serif animate-glow">
            Gratitude Collection
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Explore the mystical gratitude energies shared by our community. 
            Each NFT represents a unique moment of appreciation sent to the universe.
          </p>
          {totalSupply && (
            <p className="text-sm text-purple-400 mt-2">
              Total Manifestations: {Number(totalSupply)}
            </p>
          )}
        </div>

        {/* NFT Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="text-purple-300 mt-4">Loading collection...</p>
          </div>
        ) : gratitudeDataList.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-glow">🔮</div>
            <p className="text-purple-300 text-lg">No gratitudes manifested yet.</p>
            <div className="mt-6">
              <a
                href="/mint"
                className="btn-mystical text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 inline-block"
              >
                Be the First to Manifest
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {gratitudeDataList.map((item) => (
              <NFTCard
                key={item.tokenId}
                tokenId={item.tokenId}
                gratitudeData={item.data}
                onClick={() => setSelectedNFT(item)}
              />
            ))}
          </div>
        )}

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