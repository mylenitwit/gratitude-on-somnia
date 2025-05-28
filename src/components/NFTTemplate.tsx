'use client'

interface NFTTemplateProps {
  message: string
  number: number
  className?: string
}

export function NFTTemplate({ message, number, className = "" }: NFTTemplateProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Mystical background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
      
      {/* Cosmic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />
      
      {/* Mystical decorations */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[10%] left-[10%] text-4xl animate-pulse-mystical">🌟</div>
        <div className="absolute top-[20%] right-[15%] text-2xl animate-pulse-mystical delay-1000">✨</div>
        <div className="absolute bottom-[15%] left-[20%] text-3xl animate-pulse-mystical delay-2000">🔮</div>
        <div className="absolute bottom-[25%] right-[10%] text-xl animate-pulse-mystical delay-3000">🌙</div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0">
        <div className="absolute top-[15%] left-[25%] w-1 h-1 bg-purple-300 rounded-full animate-ping" />
        <div className="absolute top-[35%] right-[30%] w-1 h-1 bg-blue-300 rounded-full animate-ping delay-700" />
        <div className="absolute bottom-[35%] left-[35%] w-1 h-1 bg-pink-300 rounded-full animate-ping delay-1400" />
        <div className="absolute bottom-[15%] right-[25%] w-1 h-1 bg-indigo-300 rounded-full animate-ping delay-2100" />
      </div>

      {/* Main container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
        {/* Mystical card background */}
        <div className="glass-mystical rounded-2xl p-6 w-full max-w-sm border border-purple-500/30">
          {/* Header */}
          <div className="mb-4">
            <div className="text-3xl mb-2 animate-glow">🙏</div>
            <h3 className="text-lg font-bold text-purple-200 font-serif">Gratitude</h3>
            <p className="text-sm text-purple-300 font-medium">#{number}</p>
          </div>
          
          {/* Message */}
          <div className="mb-4 min-h-[80px] max-h-[120px] flex items-center justify-center overflow-hidden">
            <div className="relative w-full px-4">
              <span className="absolute -left-1 top-0 text-purple-400 text-lg leading-none">"</span>
              <p className="text-sm text-gray-100 italic leading-relaxed text-center break-words hyphens-auto overflow-hidden px-3">
                {message.length > 120 ? `${message.substring(0, 120)}...` : message}
              </p>
              <span className="absolute -right-1 bottom-0 text-purple-400 text-lg leading-none">"</span>
            </div>
          </div>
          
          {/* Mystical footer */}
          <div className="text-xs text-purple-300/70 font-serif">
            Sent to the Universe
          </div>
        </div>
      </div>
    </div>
  )
}

// Compact version for small displays
export function NFTTemplateCompact({ message, number, className = "" }: NFTTemplateProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Mystical background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900" />
      
      {/* Cosmic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/10" />

      {/* Main container */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-3 text-center">
        {/* Mystical card background */}
        <div className="glass-card rounded-lg p-4 w-full h-full flex flex-col justify-center border border-purple-500/20">
          {/* Header */}
          <div className="mb-2 flex-shrink-0">
            <div className="text-lg mb-1 animate-glow">🙏</div>
            <h3 className="text-xs font-bold text-purple-200 font-serif">Gratitude</h3>
            <p className="text-xs text-purple-300">#{number}</p>
          </div>
          
          {/* Message */}
          <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden">
            <div className="relative w-full px-1">
              <span className="absolute -left-0 top-0 text-purple-400 text-xs leading-none">"</span>
              <p className="text-xs text-gray-100 italic leading-tight text-center break-words hyphens-auto overflow-hidden px-2 line-clamp-6">
                {message.length > 120 ? `${message.substring(0, 120)}...` : message}
              </p>
              <span className="absolute -right-0 bottom-0 text-purple-400 text-xs leading-none">"</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating particles for compact */}
      <div className="absolute top-[20%] left-[15%] w-0.5 h-0.5 bg-purple-300 rounded-full animate-ping" />
      <div className="absolute bottom-[20%] right-[15%] w-0.5 h-0.5 bg-pink-300 rounded-full animate-ping delay-1000" />
    </div>
  )
} 