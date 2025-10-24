export type TUploadResult = {
  id: number
  url: string
  fileType: string
  fileName: string
  thumbnailUrl?: string
  fileSize: string
}

export type TFileMetadata = {
  'original-filename': string
  'original-mimetype': string
  'original-size': string
  encrypted: string
}
