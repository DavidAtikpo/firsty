export interface Category {
  id: string
  name: string
  description?: string
  image?: string
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const response = await fetch("/api/categories")
    if (response.ok) {
      const data = await response.json()
      return data || []
    }
    return []
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}


