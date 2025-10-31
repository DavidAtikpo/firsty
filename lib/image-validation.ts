export function getValidImageUrl(image: string | null | undefined): string {
  if (!image) return "/placeholder.svg"
  // Gérer les images base64
  if (image.startsWith("data:image")) return image
  // Gérer les URLs externes
  if (image.startsWith("http")) return image
  // Gérer les chemins relatifs
  if (image.startsWith("/")) return image
  // Sinon, préfixer avec /
  return `/${image}`
}

