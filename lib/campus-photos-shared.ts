export const campusPhotoCategories = ['校园', '日常', '四季'] as const
export type CampusPhotoCategory = typeof campusPhotoCategories[number]
export type GalleryPhoto = {
  id: string; title: string; category: string; src: string; thumbnail: string
  srcSet?: string; width: number; height: number
}
export const campusPhotoUploadLimit = 8 * 1024 * 1024
