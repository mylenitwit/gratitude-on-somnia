import { readContract } from '@wagmi/core'
import { CONTRACT_CONFIG } from './config'
import { wagmiConfig } from './wagmi'

export interface GratitudeData {
  message: string
  originalAuthor: string
  timestamp: bigint
  gratitudeNumber: bigint
}

// Get gratitude data from contract
export async function getGratitudeData(tokenId: number): Promise<GratitudeData | null> {
  try {
    const result = await readContract(wagmiConfig, {
      ...CONTRACT_CONFIG,
      functionName: 'getGratitude',
      args: [BigInt(tokenId)],
    })

    // Contract returns a struct, not an array
    if (result && typeof result === 'object') {
      const gratitudeStruct = result as {
        message: string
        originalAuthor: string
        timestamp: bigint
        gratitudeNumber: bigint
      }
      
      return {
        message: gratitudeStruct.message,
        originalAuthor: gratitudeStruct.originalAuthor,
        timestamp: gratitudeStruct.timestamp,
        gratitudeNumber: gratitudeStruct.gratitudeNumber,
      }
    }
    return null
  } catch (error) {
    console.error(`Error fetching gratitude data for token ${tokenId}:`, error)
    return null
  }
}

// Get multiple gratitude data
export async function getMultipleGratitudeData(tokenIds: number[]): Promise<Array<{ tokenId: number; data: GratitudeData } | null>> {
  const promises = tokenIds.map(async (tokenId) => {
    const data = await getGratitudeData(tokenId)
    return data ? { tokenId, data } : null
  })

  return await Promise.all(promises)
}

// Check if token exists
export async function tokenExists(tokenId: number): Promise<boolean> {
  try {
    const result = await readContract(wagmiConfig, {
      ...CONTRACT_CONFIG,
      functionName: 'exists',
      args: [BigInt(tokenId)],
    })
    return result as boolean
  } catch (error) {
    console.error(`Error checking if token ${tokenId} exists:`, error)
    return false
  }
}

// Get total supply
export async function getTotalSupply(): Promise<number> {
  try {
    const result = await readContract(wagmiConfig, {
      ...CONTRACT_CONFIG,
      functionName: 'totalSupply',
    })
    return Number(result as bigint)
  } catch (error) {
    console.error('Error fetching total supply:', error)
    return 0
  }
}

// Get user's gratitude token IDs
export async function getUserGratitudes(userAddress: string): Promise<number[]> {
  try {
    const result = await readContract(wagmiConfig, {
      ...CONTRACT_CONFIG,
      functionName: 'getUserGratitudes',
      args: [userAddress as `0x${string}`],
    })
    
    if (Array.isArray(result)) {
      return result.map(id => Number(id as bigint))
    }
    return []
  } catch (error) {
    console.error(`Error fetching user gratitudes for ${userAddress}:`, error)
    return []
  }
}

// Get recent gratitudes
export async function getRecentGratitudes(count: number = 100): Promise<number[]> {
  try {
    const result = await readContract(wagmiConfig, {
      ...CONTRACT_CONFIG,
      functionName: 'getRecentGratitudes',
      args: [BigInt(count)],
    })
    
    if (Array.isArray(result)) {
      return result.map(id => Number(id as bigint))
    }
    return []
  } catch (error) {
    console.error('Error fetching recent gratitudes:', error)
    return []
  }
}

// Get mint price
export async function getMintPrice(): Promise<string> {
  try {
    const result = await readContract(wagmiConfig, {
      ...CONTRACT_CONFIG,
      functionName: 'MINT_PRICE',
    })
    return (result as bigint).toString()
  } catch (error) {
    console.error('Error fetching mint price:', error)
    return '10000000000000000' // 0.01 ETH in wei as fallback
  }
}

// Debug function to test contract connection
export async function debugContractConnection(userAddress?: string): Promise<void> {
  console.log('🔍 Debug: Testing contract connection...')
  
  try {
    // Test total supply
    const totalSupply = await getTotalSupply()
    console.log('✅ Total Supply:', totalSupply)
    
    if (userAddress) {
      // Test user balance
      const balance = await readContract(wagmiConfig, {
        ...CONTRACT_CONFIG,
        functionName: 'balanceOf',
        args: [userAddress as `0x${string}`],
      })
      console.log('✅ User Balance:', Number(balance as bigint))
      
      // Test user gratitudes
      const userGratitudes = await getUserGratitudes(userAddress)
      console.log('✅ User Gratitudes:', userGratitudes)
      
      // Test first gratitude data if exists
      if (userGratitudes.length > 0) {
        const firstGratitude = await getGratitudeData(userGratitudes[0])
        console.log('✅ First Gratitude Data:', firstGratitude)
      }
    }
    
    // Test recent gratitudes
    const recentGratitudes = await getRecentGratitudes(5)
    console.log('✅ Recent Gratitudes:', recentGratitudes)
    
  } catch (error) {
    console.error('❌ Debug Error:', error)
  }
} 