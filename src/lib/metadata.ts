import { APP_CONFIG } from './config'
import { createGratitudeImageURL, uploadMetadataToStorage } from './storage'

export interface GratitudeMetadata {
  name: string
  description: string
  image: string
  external_url: string
  attributes: Array<{
    trait_type: string
    value: string | number
    display_type?: string
  }>
}

export function generateGratitudeMetadata(
  gratitudeNumber: number,
  message: string,
  owner: string,
  timestamp: number
): GratitudeMetadata {
  // Create image URL using somniagames.fun template
  const imageUrl = createGratitudeImageURL(message, gratitudeNumber)
  
  return {
    name: `Gratitude #${gratitudeNumber}`,
    description: `A daily gratitude moment minted on Somnia blockchain: "${message}"`,
    image: imageUrl,
    external_url: APP_CONFIG.url,
    attributes: [
      {
        trait_type: "message",
        value: message
      },
      {
        trait_type: "owner",
        value: owner
      },
      {
        trait_type: "original_author",
        value: owner
      },
      {
        trait_type: "message_date",
        value: timestamp,
        display_type: "date"
      },
      {
        trait_type: "gratitude_number",
        value: gratitudeNumber,
        display_type: "number"
      },
      {
        trait_type: "message_length",
        value: message.length,
        display_type: "number"
      },
      {
        trait_type: "blockchain",
        value: "Somnia"
      },
      {
        trait_type: "mint_price",
        value: APP_CONFIG.mintPrice + " STT"
      },
      {
        trait_type: "template_url",
        value: imageUrl
      }
    ]
  }
}

export async function uploadToIPFS(metadata: GratitudeMetadata): Promise<string> {
  // Now using our storage system instead of IPFS
  return await uploadMetadataToStorage(metadata)
}

export function createMetadataURI(metadataId: string): string {
  // If it's already a data URI or full URL, return as is
  if (metadataId.startsWith('data:') || metadataId.startsWith('http')) {
    return metadataId
  }
  
  // Otherwise, construct the URI
  return metadataId
} 