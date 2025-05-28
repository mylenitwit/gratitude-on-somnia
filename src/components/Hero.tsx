'use client'

import { useAccount } from 'wagmi'
import { ConnectButton } from './ConnectButton'
import { APP_CONFIG } from '@/lib/config'

export function Hero() {
  const { address, isConnected } = useAccount()

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Mystical decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-float text-purple-300">🌟</div>
        <div className="absolute top-20 right-20 text-4xl opacity-20 animate-pulse-mystical text-pink-300">✨</div>
        <div className="absolute bottom-20 left-20 text-5xl opacity-20 animate-float text-blue-300" style={{ animationDelay: '2s' }}>🔮</div>
        <div className="absolute bottom-10 right-10 text-3xl opacity-20 animate-pulse-mystical text-indigo-300" style={{ animationDelay: '1s' }}>🌙</div>
        <div className="absolute top-1/2 left-1/4 text-2xl opacity-10 animate-glow text-purple-400">💫</div>
        <div className="absolute top-1/3 right-1/3 text-2xl opacity-10 animate-glow text-pink-400" style={{ animationDelay: '3s' }}>⭐</div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight text-cosmic animate-glow">
            {APP_CONFIG.name}
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-purple-100 max-w-2xl mx-auto leading-relaxed">
            Transform your gratitude into eternal energy. Send your appreciation to the universe and mint it as a mystical NFT.
          </p>
        </div>

        <div className="mb-12">
          <div className="glass-mystical rounded-2xl p-8 max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl font-semibold mb-6 text-purple-200 font-serif">The Mystical Journey</h2>
            <div className="grid md:grid-cols-3 gap-6 text-sm">
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-3 animate-glow">🔗</div>
                <h3 className="font-semibold mb-2 text-purple-200">Connect to the Cosmos</h3>
                <p className="text-purple-300/80">Link your wallet to the mystical realm</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-3 animate-glow">✍️</div>
                <h3 className="font-semibold mb-2 text-purple-200">Channel Gratitude</h3>
                <p className="text-purple-300/80">Express your appreciation to the universe</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-3xl mb-3 animate-glow">🎨</div>
                <h3 className="font-semibold mb-2 text-purple-200">Manifest NFT</h3>
                <p className="text-purple-300/80">Crystallize your energy for {APP_CONFIG.mintPrice} STT</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6">
          {!isConnected ? (
            <div className="flex flex-col items-center gap-4">
              <ConnectButton />
              <p className="text-sm text-purple-300/80">Connect your wallet to begin the mystical journey</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-4 items-center">
                <div className="glass-card text-purple-200 px-6 py-3 rounded-full font-semibold border border-purple-500/30">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <a
                  href="/mint"
                  className="btn-mystical text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Begin Manifestation
                </a>
              </div>
              <p className="text-sm text-purple-300/80">Your connection is established!</p>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-purple-400/70">
            <span>Powered by Somnia Network</span>
            <span>•</span>
            <span>Manifest for only {APP_CONFIG.mintPrice} STT</span>
          </div>
        </div>
      </div>
    </section>
  )
} 