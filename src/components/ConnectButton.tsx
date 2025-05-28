'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState } from 'react'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [showConnectors, setShowConnectors] = useState(false)

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <div className="glass-card text-purple-200 px-4 py-2 rounded-full text-sm font-medium border border-purple-400/40 animate-glow">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
          </div>
        </div>
        
        <button
          onClick={() => disconnect()}
          className="glass-card text-red-300 hover:text-red-200 px-4 py-2 rounded-full hover:bg-red-500/20 transition-all duration-300 text-sm font-medium border border-red-400/30 hover:border-red-400/50 group"
        >
          <div className="flex items-center gap-2">
            <span className="group-hover:animate-pulse">🔌</span>
            <span>Disconnect</span>
          </div>
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowConnectors(!showConnectors)}
        disabled={isPending}
        className="btn-mystical text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 group"
      >
        <div className="flex items-center gap-2">
          {isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <span className="group-hover:animate-glow">🔮</span>
              <span>Connect Wallet</span>
              <span className="group-hover:animate-bounce">✨</span>
            </>
          )}
        </div>
      </button>

      {showConnectors && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowConnectors(false)}
          />
          
          <div className="absolute top-full mt-3 glass-mystical rounded-2xl border border-purple-500/30 min-w-[280px] z-50 overflow-hidden">
            <div className="p-4 border-b border-purple-500/20">
              <h3 className="text-purple-200 font-semibold text-sm flex items-center gap-2">
                <span className="animate-glow">🌟</span>
                Choose Your Portal
              </h3>
              <p className="text-purple-300/70 text-xs mt-1">Select a wallet to enter the mystical realm</p>
            </div>
            
            <div className="p-2">
              {connectors.map((connector, index) => (
                <button
                  key={connector.uid}
                  onClick={() => {
                    connect({ connector })
                    setShowConnectors(false)
                  }}
                  disabled={isPending}
                  className="w-full text-left p-4 hover:bg-purple-500/20 transition-all duration-200 rounded-xl disabled:opacity-50 group border border-transparent hover:border-purple-400/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/20">
                      {connector.type === 'metaMask' && <span className="text-lg">🦊</span>}
                      {connector.type === 'injected' && <span className="text-lg">🔮</span>}
                      {!['metaMask', 'injected'].includes(connector.type) && <span className="text-lg">💼</span>}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {connector.type === 'metaMask' && 'MetaMask'}
                        {connector.type === 'injected' && 'Browser Wallet'}
                        {!['injected', 'metaMask'].includes(connector.type) && 'External Wallet'}
                      </div>
                      <div className="text-xs text-purple-200">
                        {connector.type === 'metaMask' && 'Browser Extension'}
                        {connector.type === 'injected' && 'Injected Provider'}
                        {!['injected', 'metaMask'].includes(connector.type) && 'External Wallet'}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-purple-500/20 bg-purple-900/20">
              <p className="text-xs text-purple-300/60 text-center flex items-center justify-center gap-1">
                <span>🔒</span>
                Secure connection to Somnia Network
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Custom hook for styled connect button
export function useConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  return {
    address,
    isConnected,
    connect,
    connectors,
    disconnect,
    isPending,
  }
} 