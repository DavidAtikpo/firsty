/**
 * Formate un montant en Franc CFA (XOF)
 * @param amount - Montant à formater
 * @returns Montant formaté avec le symbole FCFA
 */
export function formatCurrency(amount: number): string {
  // Formater le nombre avec des espaces comme séparateurs de milliers
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  
  return `${formatted} FCFA`
}

/**
 * Formate un montant en Franc CFA avec décimales
 * @param amount - Montant à formater
 * @returns Montant formaté avec le symbole FCFA
 */
export function formatCurrencyWithDecimals(amount: number): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
  
  return `${formatted} FCFA`
}

