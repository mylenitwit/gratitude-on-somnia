'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_CONFIG, APP_CONFIG } from '@/lib/config'
import { ConnectButton } from '@/components/ConnectButton'
import { generateGratitudeMetadata, uploadToIPFS, createMetadataURI } from '@/lib/metadata'

export default function MintPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const { address, isConnected } = useAccount()
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Get next gratitude number
  const { data: totalSupply } = useReadContract({
    ...CONTRACT_CONFIG,
    functionName: 'totalSupply',
  })

  const nextGratitudeNumber = totalSupply ? Number(totalSupply) + 1 : 1

  // Check template availability on mount
  useEffect(() => {
    // Template availability check removed - not needed and causes CORS issues
    // Template is hosted externally and works fine
  }, [])

  const handleMint = async () => {
    if (!message.trim() || !isConnected || !address) return

    try {
      setIsLoading(true)
      setIsUploadingMetadata(true)
      setStorageError(null)
      
      // Generate metadata with somniagames.fun image URL
      const metadata = generateGratitudeMetadata(
        nextGratitudeNumber,
        message.trim(),
        address,
        Math.floor(Date.now() / 1000)
      )
      
      // Upload metadata (now using our storage system)
      let metadataURI = ''
      try {
        const metadataId = await uploadToIPFS(metadata) // Function name kept for compatibility
        metadataURI = createMetadataURI(metadataId)
        console.log('Metadata uploaded:', metadataURI)
      } catch (storageErr) {
        console.error('Storage upload failed:', storageErr)
        setStorageError('Metadata upload failed. Using fallback storage.')
        // Use a fallback metadata URI
        metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      }
      
      setIsUploadingMetadata(false)
      
      // Mint NFT with metadata URI
      writeContract({
        ...CONTRACT_CONFIG,
        functionName: 'mintGratitude',
        args: [message.trim(), metadataURI],
        value: parseEther(APP_CONFIG.mintPrice),
      })
    } catch (err) {
      console.error('Mint error:', err)
      setIsUploadingMetadata(false)
      setIsLoading(false)
    }
  }

  // Reset loading state when transaction completes
  useEffect(() => {
    if (isSuccess || error) {
      setIsLoading(false)
    }
  }, [isSuccess, error])

  const isFormValid = message.trim().length > 0 && message.length <= APP_CONFIG.maxMessageLength
  const isMinting = isLoading || isPending || isConfirming || isUploadingMetadata

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Mystical Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-cosmic mb-4 font-serif animate-glow">
            Manifest Your Gratitude
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto">
            Channel your appreciation into the eternal blockchain. Transform your gratitude into mystical energy 
            that will resonate through the universe forever.
          </p>
          {totalSupply && (
            <p className="text-sm text-purple-400 mt-2">
              Next Manifestation: #{nextGratitudeNumber}
            </p>
          )}
        </div>

        {/* Storage Warning */}
        {storageError && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="glass-card border border-yellow-500/30 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-300">{storageError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Side - Mystical Form */}
          <div className="glass-mystical rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-purple-200 mb-6 font-serif">
              What energy flows through you today?
            </h2>

            {!isConnected ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 animate-glow">🔮</div>
                <p className="text-purple-300 mb-4">Connect your wallet to access the mystical realm</p>
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Message Input */}
                <div>
                  <label htmlFor="gratitude-message" className="block text-sm font-medium text-purple-200 mb-2">
                    Your Gratitude Message
                  </label>
                  <textarea
                    id="gratitude-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="I send gratitude to the universe for..."
                    className="input-mystical w-full h-32 p-4 rounded-lg resize-none"
                    maxLength={APP_CONFIG.maxMessageLength}
                    disabled={isMinting}
                  />
                  <div className="flex justify-between text-sm text-purple-400 mt-1">
                    <span>Channel your appreciation into the cosmos</span>
                    <span className={message.length > APP_CONFIG.maxMessageLength * 0.9 ? 'text-pink-400' : ''}>
                      {message.length}/{APP_CONFIG.maxMessageLength}
                    </span>
                  </div>
                </div>

                {/* Cost Information */}
                <div className="glass-card rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200">Manifestation Cost:</span>
                    <span className="text-lg font-semibold text-cosmic">
                      {APP_CONFIG.mintPrice} STT
                    </span>
                  </div>
                  <p className="text-sm text-purple-300 mt-1">
                    This will crystallize your gratitude into an eternal NFT
                  </p>
                </div>

                {/* Mint Button */}
                <button
                  onClick={handleMint}
                  disabled={!isFormValid || isMinting}
                  className="w-full btn-mystical text-white font-semibold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isUploadingMetadata ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Preparing Metadata...
                    </div>
                  ) : isLoading || isPending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Channeling Energy...
                    </div>
                  ) : isConfirming ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Manifesting on Blockchain...
                    </div>
                  ) : (
                    '✨ Manifest Gratitude ✨'
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="glass-card border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">
                      Interference detected: {error.message}
                    </p>
                  </div>
                )}

                {/* Success Display */}
                {isSuccess && (
                  <div className="glass-card border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 font-medium">
                      🌟 Gratitude #{nextGratitudeNumber - 1} successfully manifested!
                    </p>
                    <p className="text-green-300 text-sm mt-1">
                      Your gratitude energy has been eternally inscribed in the blockchain.
                    </p>
                    {hash && (
                      <div className="mt-3 space-y-2">
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 text-sm underline block"
                        >
                          View transaction ↗
                        </a>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setMessage('')
                              setStorageError(null)
                            }}
                            className="text-sm glass-card text-purple-300 px-3 py-1 rounded hover:bg-purple-500/20 transition-colors"
                          >
                            Manifest Another
                          </button>
                          <a
                            href="/profile"
                            className="text-sm glass-card text-blue-300 px-3 py-1 rounded hover:bg-blue-500/20 transition-colors"
                          >
                            View My Collection
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side - Mystical Preview */}
          <div className="glass-mystical rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-purple-200 mb-6 font-serif">
              NFT Preview
            </h2>
            
            <div className="aspect-square bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-8 flex items-center justify-center relative overflow-hidden">
              {/* Mystical Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 left-4 w-16 h-16 border-2 border-purple-300 rounded-full animate-pulse-mystical"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-pink-300 rounded-full animate-pulse-mystical delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-blue-300 rounded-full animate-glow"></div>
              </div>

              {/* Floating particles */}
              <div className="absolute inset-0">
                <div className="absolute top-[20%] left-[20%] w-1 h-1 bg-purple-300 rounded-full animate-ping" />
                <div className="absolute top-[30%] right-[25%] w-1 h-1 bg-pink-300 rounded-full animate-ping delay-500" />
                <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-blue-300 rounded-full animate-ping delay-1000" />
                <div className="absolute bottom-[20%] right-[20%] w-1 h-1 bg-indigo-300 rounded-full animate-ping delay-1500" />
              </div>

              {/* Content */}
              <div className="relative z-10 text-center text-white">
                <div className="mb-6">
                  <div className="text-4xl mb-2 animate-glow">🙏</div>
                  <h3 className="text-xl font-bold mb-1 text-purple-200 font-serif">Gratitude</h3>
                  <p className="text-sm text-purple-300">#{nextGratitudeNumber}</p>
                </div>
                
                <div className="glass-mystical rounded-lg p-6 min-h-[120px] max-h-[140px] flex items-center justify-center overflow-hidden">
                  {message.trim() ? (
                    <div className="relative w-full">
                      <span className="absolute -left-2 top-0 text-purple-400 text-xl leading-none">"</span>
                      <p className="text-lg leading-relaxed text-center break-words hyphens-auto overflow-hidden px-4 line-clamp-4 text-gray-100">
                        {message}
                      </p>
                      <span className="absolute -right-2 bottom-0 text-purple-400 text-xl leading-none">"</span>
                    </div>
                  ) : (
                    <p className="text-purple-300/60 italic">
                      Your gratitude will manifest here...
                    </p>
                  )}
                </div>

                <div className="mt-6 text-sm text-purple-300/80">
                  <p>Channeled by: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Your Address'}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs mt-2 font-serif">SENT TO THE UNIVERSE</p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-purple-300 text-sm">
                This is how your NFT will appear once manifested
              </p>
              {storageError && (
                <p className="text-yellow-400 text-xs mt-2">
                  ⚠️ Using fallback storage
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 