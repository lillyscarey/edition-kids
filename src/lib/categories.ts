type CategoryStyle = {
  bg: string       // Tailwind bg class
  border: string   // Tailwind border class
  text: string     // Tailwind text class
  label: string    // Display label
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  TECHNOLOGY: { bg: 'bg-blue-100',   border: 'border-blue-300',  text: 'text-blue-700',   label: 'Technology' },
  SCIENCE:    { bg: 'bg-green-100',  border: 'border-green-300', text: 'text-green-700',  label: 'Science'    },
  SPORTS:     { bg: 'bg-orange-100', border: 'border-orange-300',text: 'text-orange-700', label: 'Sports'     },
  CULTURE:    { bg: 'bg-purple-100', border: 'border-purple-300',text: 'text-purple-700', label: 'Culture'    },
  WORLD:      { bg: 'bg-yellow-100', border: 'border-yellow-300',text: 'text-yellow-700', label: 'World'      },
  HEALTH:     { bg: 'bg-pink-100',   border: 'border-pink-300',  text: 'text-pink-700',   label: 'Health'     },
}

const FALLBACK: CategoryStyle = {
  bg: 'bg-gray-100', border: 'border-gray-300', text: 'text-gray-700', label: 'News'
}

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLES[category?.toUpperCase()] ?? FALLBACK
}
