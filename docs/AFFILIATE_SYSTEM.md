# Système d'Affiliation - Documentation

## Vue d'ensemble

Le système d'affiliation permet aux **commerçants (MERCHANT)** de gagner des commissions lorsqu'un **client (CUSTOMER)** effectue un achat après avoir cliqué sur leur lien d'affiliation.

## Flux complet du système

### 1. **Création du compte commerçant**
- Lorsqu'un utilisateur s'inscrit avec le rôle `MERCHANT`, un compte `Merchant` est automatiquement créé avec :
  - Un `affiliateCode` unique (généré automatiquement)
  - Un `commissionRate` (taux de commission par défaut)
  - `totalEarnings` = 0
  - `pendingEarnings` = 0

### 2. **Génération du lien d'affiliation**
- Le commerçant se connecte à son dashboard (`/merchant`)
- Il accède à son lien d'affiliation via le composant `AffiliateLinkGenerator`
- Le lien généré : `https://votresite.com/shop?ref=AFFILIATE_CODE`
- Il peut copier ce lien pour le partager

### 3. **Client clique sur le lien**
- Le client clique sur le lien d'affiliation : `/shop?ref=AFFILIATE_CODE`
- Le composant `ShopInterface` détecte le paramètre `ref` dans l'URL
- Il appelle l'API `/api/affiliate/track?code=AFFILIATE_CODE`
- L'API :
  - Vérifie que le code d'affiliation existe dans la base de données
  - Stocke le code dans un cookie `affiliate_code` (valide 30 jours)
  - Retourne une confirmation

### 4. **Client parcourt la boutique**
- Le cookie `affiliate_code` reste actif pendant 30 jours
- Le client peut naviguer, ajouter des produits au panier, etc.

### 5. **Client passe une commande**
- Lors de la création de la commande (`POST /api/orders`) :
  - Le système récupère le cookie `affiliate_code`
  - Il cherche le commerçant correspondant via `getMerchantByAffiliateCode()`
  - Si trouvé, il associe le `merchantId` à la commande
  - La commande est créée avec `merchantId` rempli

### 6. **Calcul de la commission**
- Après création de la commande, si `merchantId` est présent :
  - Appel à `calculateCommission(orderId)`
  - La fonction calcule : `commission = (totalAmount * commissionRate) / 100`
  - Création d'un enregistrement `Commission` dans la base de données
  - Mise à jour du `pendingEarnings` du commerçant (gains en attente)

### 7. **Suivi pour le commerçant**
- Le commerçant voit dans son dashboard :
  - **Gains totaux** (`totalEarnings`) : commissions déjà payées
  - **Gains en attente** (`pendingEarnings`) : commissions non encore payées
  - **Commandes référées** : nombre total de commandes générées
  - **Revenu total** : montant total des ventes référées
  - **Commandes récentes** : liste des dernières commandes

### 8. **Paiement des commissions** (à implémenter)
- Un admin peut marquer une commission comme payée via `markCommissionAsPaid()`
- Cela met à jour :
  - `Commission.isPaid = true`
  - `Commission.paidAt = maintenant`
  - `Merchant.totalEarnings += commission.amount`
  - `Merchant.pendingEarnings -= commission.amount`

## Structure des données

### Merchant
```typescript
{
  id: string
  userId: string
  affiliateCode: string        // Code unique pour le lien
  commissionRate: number       // Taux de commission (ex: 10%)
  totalEarnings: number         // Commissions payées
  pendingEarnings: number       // Commissions en attente
}
```

### Order
```typescript
{
  id: string
  customerId: string
  merchantId: string | null    // null si pas d'affiliation
  totalAmount: number
  // ... autres champs
}
```

### Commission
```typescript
{
  id: string
  orderId: string              // Unique : une commission par commande
  merchantId: string
  amount: number                // Montant de la commission
  commissionRate: number        // Taux au moment de la vente
  isPaid: boolean               // Payée ou non
  paidAt: DateTime | null
}
```

## Points importants

### Durée de validité du cookie
- Le cookie `affiliate_code` est valide **30 jours**
- Si le client revient après 30 jours sans cliquer à nouveau, aucune commission n'est générée

### Attribution unique
- **Une seule commission par commande** (relation unique `orderId` dans `Commission`)
- Si le client a plusieurs cookies d'affiliation, seul le premier utilisé lors de la commande compte

### Calcul de commission
- Basé sur le `totalAmount` de la commande
- Le taux est celui du commerçant au moment de la vente (stocké dans `commissionRate` de la commission)
- Formule : `commission = (totalAmount × commissionRate) / 100`

## API Endpoints

### `/api/affiliate/track?code=XXX`
- **Méthode** : GET
- **Action** : Enregistre le code d'affiliation dans un cookie
- **Retour** : `{ success: true, merchant: { name: "..." } }`

### `/api/orders` (POST)
- **Méthode** : POST
- **Action** : Crée une commande et calcule la commission si un cookie d'affiliation existe
- **Body** : `{ items, shippingAddress, customerName, customerEmail }`

### `/api/merchants/stats`
- **Méthode** : GET
- **Action** : Récupère les statistiques du commerçant connecté
- **Retour** : Stats complètes avec commandes récentes

## Améliorations possibles

1. **Tracking plus détaillé** : Enregistrer les clics (pas seulement les commandes)
2. **Attribution multi-niveau** : Permettre des commissions à plusieurs niveaux
3. **Règles d'attribution** : Délai de grâce, règles spécifiques par produit
4. **Tableau de bord client** : Permettre au client de voir d'où il vient
5. **Notifications** : Alerter le commerçant quand une commission est générée
6. **Statistiques avancées** : Conversion rate, revenu moyen par client référé, etc.

