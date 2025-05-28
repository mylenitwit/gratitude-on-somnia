'use client'

import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useChainId, useSwitchChain } from 'wagmi'
import { parseEther } from 'viem'
import { CONTRACT_CONFIG, APP_CONFIG, somniaNetwork } from '@/lib/config'
import { ConnectButton } from '@/components/ConnectButton'
import { generateGratitudeMetadata, uploadToIPFS, createMetadataURI } from '@/lib/metadata'

export default function MintPage() {
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isUploadingMetadata, setIsUploadingMetadata] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [showFullScreenLoading, setShowFullScreenLoading] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const [isSwitchingNetwork, setIsSwitchingNetwork] = useState(false)
  
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
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

  // Check if user is on correct network
  const isCorrectNetwork = chainId === somniaNetwork.id
  const needsNetworkSwitch = isConnected && !isCorrectNetwork

  // Debug logs - gerçek ağ bilgisini de kontrol et
  useEffect(() => {
    const checkRealNetwork = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const realChainId = await window.ethereum.request({ method: 'eth_chainId' })
          const realChainIdDecimal = parseInt(realChainId, 16)

        } catch (err) {
          console.error('Failed to get real chain ID:', err)
        }
      }
    }
    
    checkRealNetwork()
  }, [chainId, isCorrectNetwork, needsNetworkSwitch])

  // Auto-switch to Somnia when wallet connects
  useEffect(() => {
    const autoSwitchNetwork = async () => {
      if (isConnected && !isCorrectNetwork && !isSwitchingNetwork && switchChain) {

        try {
          setIsSwitchingNetwork(true)
          await switchChain({ chainId: somniaNetwork.id })

        } catch (err) {
          console.error('Auto network switch failed:', err)
        } finally {
          setIsSwitchingNetwork(false)
        }
      }
    }

    autoSwitchNetwork()
  }, [isConnected, isCorrectNetwork, isSwitchingNetwork, switchChain])

  // Handle network switch
  const handleSwitchNetwork = async () => {
    if (!switchChain) return
    
    try {
      setIsSwitchingNetwork(true)
      await switchChain({ chainId: somniaNetwork.id })
    } catch (err) {
      console.error('Network switch failed:', err)
    } finally {
      setIsSwitchingNetwork(false)
    }
  }

  const handleMintClick = async () => {
    if (!message.trim() || !isConnected || !address) return

    // Gerçek ağ bilgisini al
    let realChainId = chainId
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
        realChainId = parseInt(chainIdHex, 16)
      } catch (err) {
        console.error('Failed to get real chain ID:', err)
      }
    }

    // Eğer yanlış ağdaysa, MUTLAKA ağ değiştir
    if (realChainId !== somniaNetwork.id) {
      try {
        setIsSwitchingNetwork(true)
        
        // Önce ağı ekle (eğer yoksa)
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: `0x${somniaNetwork.id.toString(16)}`,
              chainName: somniaNetwork.name,
              nativeCurrency: somniaNetwork.nativeCurrency,
              rpcUrls: somniaNetwork.rpcUrls.default.http,
              blockExplorerUrls: [somniaNetwork.blockExplorers.default.url],
            }],
          })
        } catch (addError) {
        }

        // Sonra ağa geç
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${somniaNetwork.id.toString(16)}` }],
        })
        
        // Ağ değiştikten sonra kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Tekrar kontrol et
        const newChainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
        const newChainId = parseInt(newChainIdHex, 16)
        
        if (newChainId !== somniaNetwork.id) {
          throw new Error(`Network switch failed. Current: ${newChainId}, Required: ${somniaNetwork.id}`)
        }
        
      } catch (err) {
        console.error('Network switch failed:', err)
        setIsSwitchingNetwork(false)
        alert(`Please manually switch to Somnia Network in your wallet.\nCurrent network: ${realChainId}\nRequired network: ${somniaNetwork.id}`)
        return
      }
      setIsSwitchingNetwork(false)
    }

    try {
      setIsLoading(true)
      setIsUploadingMetadata(true)
      setStorageError(null)
      setShowFullScreenLoading(true) // Tam ekran loading başlat
      
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
      } catch (storageErr) {
        console.error('Storage upload failed:', storageErr)
        setStorageError('Metadata upload failed. Using fallback storage.')
        // Use a fallback metadata URI
        metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`
      }
      
      setIsUploadingMetadata(false)
      
      // Son bir kez ağ kontrolü yap
      const finalChainIdHex = await window.ethereum.request({ method: 'eth_chainId' })
      const finalChainId = parseInt(finalChainIdHex, 16)
      
      if (finalChainId !== somniaNetwork.id) {
        throw new Error(`Network changed during mint process. Current: ${finalChainId}, Required: ${somniaNetwork.id}`)
      }
      
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
      setShowFullScreenLoading(false) // Hata durumunda loading'i kapat
    }
  }

  // Reset loading state when transaction completes
  useEffect(() => {
    if (isSuccess || error) {
      setIsLoading(false)
      
      // İşlem başarılı ise 3 saniye daha bekle, hata varsa hemen kapat
      if (isSuccess) {
        setTimeout(() => {
          setShowFullScreenLoading(false)
        }, 3000) // 3 saniye bekle
      } else {
        setShowFullScreenLoading(false) // Hata durumunda hemen kapat
      }
    }
  }, [isSuccess, error])

  const isFormValid = message.trim().length > 0 && message.length <= APP_CONFIG.maxMessageLength
  const isMinting = isLoading || isPending || isConfirming || isUploadingMetadata
  const canMint = isFormValid && isCorrectNetwork && !isMinting && !isSwitchingNetwork

  // Full screen loading view
  if (showFullScreenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Grateful character backgrounds - sadece bunlar kalacak */}
        <div className="grateful-bg-left"></div>
        <div className="grateful-bg-right"></div>
        
        {/* Loading video in center */}
        <div className="relative z-10 flex flex-col items-center">
          {!videoError ? (
            <video
              autoPlay
              muted
              loop
              className="w-96 h-96 object-cover rounded-2xl shadow-2xl"
              style={{ filter: 'brightness(1.1) contrast(1.1)' }}
              onError={() => setVideoError(true)}
            >
              <source src="/loading.mp4" type="video/mp4" />
            </video>
          ) : (
            // Fallback animation when video fails to load
            <div className="w-96 h-96 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600 rounded-2xl flex items-center justify-center relative overflow-hidden shadow-2xl">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-8 left-8 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
                <div className="absolute bottom-8 right-8 w-16 h-16 border-2 border-purple-200 rounded-full animate-pulse delay-500"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-pink-200 rounded-full animate-spin-slow"></div>
              </div>
              
              {/* Central loading animation */}
              <div className="relative z-10 flex flex-col items-center">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent mb-6"></div>
                <div className="text-6xl animate-bounce">🙏</div>
              </div>
              
              {/* Floating particles */}
              <div className="absolute inset-0">
                <div className="absolute top-[20%] left-[20%] w-3 h-3 bg-white rounded-full animate-ping" />
                <div className="absolute top-[30%] right-[25%] w-2 h-2 bg-purple-200 rounded-full animate-ping delay-300" />
                <div className="absolute bottom-[30%] left-[30%] w-3 h-3 bg-pink-200 rounded-full animate-ping delay-700" />
                <div className="absolute bottom-[20%] right-[20%] w-2 h-2 bg-white rounded-full animate-ping delay-1000" />
              </div>
            </div>
          )}
          
          {/* Loading text below video */}
          <div className="mt-8 text-center">
            <h3 className="text-3xl font-bold text-white font-serif animate-glow mb-4">
              {isSuccess ? "Gratitude Manifested!" : "Manifesting Your Gratitude"}
            </h3>
            <p className="text-xl text-purple-200 animate-pulse mb-6">
              {isSuccess 
                ? "Your gratitude has been eternally inscribed in the cosmic blockchain..."
                : "Channeling your energy into the cosmic realm..."
              }
            </p>
            
            {/* Status text */}
            <div className="text-lg text-purple-300">
              {isSuccess ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-400 mr-3"></div>
                  Gratitude Successfully Manifested! ✨
                </div>
              ) : isUploadingMetadata ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300 mr-3"></div>
                  Preparing Metadata...
                </div>
              ) : isPending ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300 mr-3"></div>
                  Channeling Energy...
                </div>
              ) : isConfirming ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300 mr-3"></div>
                  Manifesting on Blockchain...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-300 mr-3"></div>
                  Processing...
                </div>
              )}
            </div>
            
            {/* Mystical Loading Dots */}
            <div className="flex justify-center space-x-3 mt-6">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-100"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce delay-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
          <div className="max-w-4xl mx-auto mb-4">
            <div className="glass-card border border-yellow-500/30 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-2">
                  <p className="text-xs text-yellow-300">{storageError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Network Warning */}
        {needsNetworkSwitch && (
          <div className="max-w-4xl mx-auto mb-4">
            <div className="glass-card border border-orange-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-orange-300 font-medium">Wrong Network Detected</p>
                    <p className="text-xs text-orange-200 mt-1">
                      You need to switch to Somnia Network to manifest your gratitude
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleSwitchNetwork}
                  disabled={isSwitchingNetwork}
                  className="btn-mystical text-white text-sm px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSwitchingNetwork ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Switching...
                    </div>
                  ) : (
                    'Switch to Somnia'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Left Side - Mystical Form */}
          <div className="glass-mystical rounded-xl p-6">
            <h2 className="text-xl font-semibold text-purple-200 mb-4 font-serif">
              What energy flows through you today?
            </h2>

            {!isConnected ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-3 animate-glow">🔮</div>
                <p className="text-purple-300 mb-4">Connect your wallet to access the mystical realm</p>
                <ConnectButton />
              </div>
            ) : (
              <div className="space-y-4">
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
                    className="input-mystical w-full h-28 p-3 rounded-lg resize-none"
                    maxLength={APP_CONFIG.maxMessageLength}
                    disabled={isMinting}
                  />
                  <div className="flex justify-between text-xs text-purple-400 mt-1">
                    <span>Channel your appreciation into the cosmos</span>
                    <span className={message.length > APP_CONFIG.maxMessageLength * 0.9 ? 'text-pink-400' : ''}>
                      {message.length}/{APP_CONFIG.maxMessageLength}
                    </span>
                  </div>
                </div>

                {/* Cost Information */}
                <div className="glass-card rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-200 text-sm">Manifestation Cost:</span>
                    <span className="text-base font-semibold text-cosmic">
                      {APP_CONFIG.mintPrice} STT
                    </span>
                  </div>
                  <p className="text-xs text-purple-300 mt-1">
                    This will crystallize your gratitude into an eternal NFT
                  </p>
                </div>

                {/* Mint Button */}
                <button
                  onClick={handleMintClick}
                  disabled={(!isFormValid && isCorrectNetwork) || isMinting || isSwitchingNetwork}
                  className="w-full btn-mystical text-white font-semibold py-3 px-5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {needsNetworkSwitch ? (
                    isSwitchingNetwork ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                        Switching to Somnia...
                      </div>
                    ) : (
                      `🔗 Switch to Somnia (Current: ${chainId})`
                    )
                  ) : (
                    '✨ Manifest Gratitude ✨'
                  )}
                </button>

                {/* Error Display */}
                {error && (
                  <div className="glass-card border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-300 text-xs">
                      {(() => {
                        const errorMessage = error.message.toLowerCase()
                        
                        if (errorMessage.includes('user rejected') || errorMessage.includes('user denied')) {
                          return 'Transaction cancelled'
                        }
                        
                        if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
                          return 'Insufficient balance'
                        }
                        
                        if (errorMessage.includes('network') || errorMessage.includes('connection')) {
                          return 'Network connection error'
                        }
                        
                        if (errorMessage.includes('gas')) {
                          return 'Gas fee error'
                        }
                        
                        if (errorMessage.includes('contract')) {
                          return 'Contract error'
                        }
                        
                        // Fallback to original message for unknown errors
                        return `Error: ${error.message}`
                      })()}
                    </p>
                  </div>
                )}

                {/* Success Display */}
                {isSuccess && (
                  <div className="glass-card border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-300 font-medium text-sm">
                      🌟 Gratitude #{nextGratitudeNumber - 1} successfully manifested!
                    </p>
                    <p className="text-green-300 text-xs mt-1">
                      Your gratitude energy has been eternally inscribed in the blockchain.
                    </p>
                    {hash && (
                      <div className="mt-2 space-y-2">
                        <a
                          href={`https://shannon-explorer.somnia.network/tx/${hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 hover:text-blue-200 text-xs underline block"
                        >
                          View transaction ↗
                        </a>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setMessage('')
                              setStorageError(null)
                            }}
                            className="text-xs glass-card text-purple-300 px-2 py-1 rounded hover:bg-purple-500/20 transition-colors"
                          >
                            Manifest Another
                          </button>
                          <a
                            href="/profile"
                            className="text-xs glass-card text-blue-300 px-2 py-1 rounded hover:bg-blue-500/20 transition-colors"
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
          <div className="glass-mystical rounded-xl p-6">
            <h2 className="text-xl font-semibold text-purple-200 mb-4 font-serif">
              NFT Preview
            </h2>
            
            <div className="aspect-square bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-xl p-6 flex items-center justify-center relative overflow-hidden">
              {/* Mystical Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-3 left-3 w-12 h-12 border-2 border-purple-300 rounded-full animate-pulse-mystical"></div>
                <div className="absolute bottom-3 right-3 w-10 h-10 border-2 border-pink-300 rounded-full animate-pulse-mystical delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-blue-300 rounded-full animate-glow"></div>
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
                <div className="mb-4">
                  <div className="text-3xl mb-2 animate-glow">🙏</div>
                  <h3 className="text-lg font-bold mb-1 text-purple-200 font-serif">Gratitude</h3>
                  <p className="text-xs text-purple-300">#{nextGratitudeNumber}</p>
                </div>
                
                <div className="glass-mystical rounded-lg p-4 min-h-[100px] max-h-[120px] flex items-center justify-center overflow-hidden">
                  {message.trim() ? (
                    <div className="relative w-full">
                      <span className="absolute -left-2 top-0 text-purple-400 text-lg leading-none">"</span>
                      <p className="text-sm leading-relaxed text-center break-words hyphens-auto overflow-hidden px-3 line-clamp-4 text-gray-100">
                        {message}
                      </p>
                      <span className="absolute -right-2 bottom-0 text-purple-400 text-lg leading-none">"</span>
                    </div>
                  ) : (
                    <p className="text-purple-300/60 italic text-sm">
                      Your gratitude will manifest here...
                    </p>
                  )}
                </div>

                <div className="mt-4 text-xs text-purple-300/80">
                  <p>Channeled by: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Your Address'}</p>
                  <p>Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs mt-1 font-serif">SENT TO THE UNIVERSE</p>
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-purple-300 text-xs">
                This is how your NFT will appear once manifested
              </p>
              {storageError && (
                <p className="text-yellow-400 text-xs mt-1">
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