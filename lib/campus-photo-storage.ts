import 'server-only'
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import sharp from 'sharp'
import { campusPhotoUploadLimit } from './campus-photos-shared'

export class PhotoInputError extends Error {}
const directory = () => resolve(process.env.CAMPUS_PHOTO_STORAGE_DIR || '.uploads/campus')
export const validPhotoId = (id: string) => /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)
function filePath(id: string, thumbnail: boolean) {
  if (!validPhotoId(id)) throw new PhotoInputError('图片编号不正确')
  return join(directory(), `${id}${thumbnail ? '-thumb' : ''}.webp`)
}
export async function compressCampusPhoto(bytes: Buffer) {
  if (!bytes.length || bytes.length > campusPhotoUploadLimit) throw new PhotoInputError('请选择 8 MB 以内的图片')
  try {
    const options = { limitInputPixels: 40000000, failOn: 'error' as const }
    const metadata = await sharp(bytes, options).metadata()
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '') || (metadata.pages || 1) > 1) throw new PhotoInputError('仅支持静态 JPG、PNG、WebP 图片')
    if (!metadata.width || !metadata.height || Math.min(metadata.width, metadata.height) < 320) throw new PhotoInputError('图片短边至少需要 320 像素')
    // Re-encode actual pixels; metadata (including GPS) is deliberately not copied.
    const full = await sharp(bytes, options).rotate().resize({ width: 1920, height: 1920, fit: 'inside', withoutEnlargement: true }).webp({ quality: 78, effort: 3 }).toBuffer({ resolveWithObject: true })
    const thumbnail = await sharp(full.data).resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true }).webp({ quality: 74, effort: 3 }).toBuffer()
    return { full: full.data, thumbnail, width: full.info.width, height: full.info.height, bytes: full.data.length + thumbnail.length }
  } catch (error) {
    if (error instanceof PhotoInputError) throw error
    throw new PhotoInputError('图片无法读取，或超过 4000 万像素；请换一张 JPG、PNG 或 WebP 图片')
  }
}
export async function storeCampusPhoto(id: string, full: Buffer, thumbnail: Buffer) {
  await mkdir(directory(), { recursive: true, mode: 0o700 })
  try {
    await writeFile(filePath(id, false), full, { flag: 'wx', mode: 0o600 })
    await writeFile(filePath(id, true), thumbnail, { flag: 'wx', mode: 0o600 })
  } catch (error) { await removeCampusPhoto(id); throw error }
}
export async function readCampusPhoto(id: string, thumbnail: boolean) { return readFile(filePath(id, thumbnail)) }
export async function removeCampusPhoto(id: string) {
  await Promise.all([false, true].map(async thumb => { try { await unlink(filePath(id, thumb)) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error } }))
}
