import type { GalleryPhoto } from './campus-photos-shared'

// A stable spiral adds photos around the existing wall, without replacing a page.
export function campusWallLayout(photos: GalleryPhoto[]) {
  let x = 0, y = 0, dx = 1, dy = 0, length = 1, walked = 0, turns = 0
  const sizes = [{ width: 420, height: 280 }, { width: 420, height: 280 }, { width: 330, height: 325 }, { width: 420, height: 270 }, { width: 470, height: 265 }, { width: 430, height: 287 }]
  const positions = photos.map((photo, index) => {
    const size = sizes[index % sizes.length]
    const position = { ...photo, ...size, x: x * 560 - size.width / 2 + (index % 3 - 1) * 20, y: y * 420 - size.height / 2 + (index % 4 - 1.5) * 20, color: '#425363' }
    x += dx; y += dy; walked++
    if (walked === length) { walked = 0; [dx, dy] = [-dy, dx]; if (++turns % 2 === 0) length++ }
    return position
  })
  const left = Math.min(...positions.map(photo => photo.x)) - 160
  const top = Math.min(...positions.map(photo => photo.y)) - 160
  const right = Math.max(...positions.map(photo => photo.x + photo.width)) + 160
  const bottom = Math.max(...positions.map(photo => photo.y + photo.height)) + 160
  return { photos: positions.map(photo => ({ ...photo, x: photo.x - left, y: photo.y - top })), width: right - left, height: bottom - top, originX: -left, originY: -top }
}
