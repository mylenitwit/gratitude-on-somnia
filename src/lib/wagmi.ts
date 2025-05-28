import { createConfig, http } from 'wagmi'
import { injected, metaMask } from 'wagmi/connectors'
import { somniaNetwork } from './config'

export const wagmiConfig = createConfig({
  chains: [somniaNetwork],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [somniaNetwork.id]: http(),
  },
  ssr: true,
}) 