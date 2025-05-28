import { GratitudeMetadata } from './metadata'


// Production'da somniagames.fun kullanmak için:
const TEMPLATE_BASE_URL = 'https://somniagames.fun'
const TEMPLATE_PATH = '/Gratitude.html'

// Kendi şablonumuzla image URL oluştur
export function createGratitudeImageURL(message: string, gratitudeNumber?: number): string {
  const encodedMessage = encodeURIComponent(message)
  let url = `${TEMPLATE_BASE_URL}${TEMPLATE_PATH}?message=${encodedMessage}`
  
  if (gratitudeNumber) {
    url += `&number=${gratitudeNumber}`
  }
  
  return url
}

// Metadata'yı basit JSON storage'a yükle (data URI kullanarak)
export async function uploadMetadataToStorage(metadata: GratitudeMetadata): Promise<string> {
  try {
    // Data URI ile metadata oluştur
    const metadataString = JSON.stringify(metadata, null, 2)
    const dataURI = `data:application/json;base64,${btoa(metadataString)}`
    
    // Upload simülasyonu
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return dataURI
  } catch (error) {
    console.error('Error uploading metadata:', error)
    throw new Error('Failed to upload metadata')
  }
}

// API endpoint'e metadata yükle (alternatif)
export async function uploadMetadataToAPI(metadata: GratitudeMetadata): Promise<string> {
  try {
    const response = await fetch('/api/upload-metadata', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.url || result.metadataURI
  } catch (error) {
    console.error('Error uploading to API:', error)
    // Fallback to data URI
    return uploadMetadataToStorage(metadata)
  }
}

// Kendi sunucumuzun erişilebilirliğini kontrol et
export async function checkTemplateAvailability(): Promise<boolean> {
  try {
    const testUrl = `${TEMPLATE_BASE_URL}${TEMPLATE_PATH}?message=test`
    const response = await fetch(testUrl, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    console.error('Template availability check failed:', error)
    return false
  }
}

// Metadata URI oluştur
export function createMetadataURI(metadataId: string): string {
  // Eğer zaten tam bir URI ise, olduğu gibi döndür
  if (metadataId.startsWith('http') || metadataId.startsWith('data:')) {
    return metadataId
  }
  
  // Aksi takdirde API endpoint'i oluştur
  return `/api/metadata/${metadataId}`
}

// Template URL'ini test et
export function getTemplateTestURL(message: string = "Hello World", number: number = 1): string {
  return createGratitudeImageURL(message, number)
} 