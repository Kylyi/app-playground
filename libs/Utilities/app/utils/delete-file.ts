// Models
import type { FileModel } from '../models/file.model'

const rC = useRuntimeConfig()
const filesHost = rC.public.filesHost

export function deleteFile(payload: {
  file: FileModel
}) {
  const { file } = payload

  // Delete the file
  console.log('deleteFile', file)
}
