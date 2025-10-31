# Plateforme E-commerce avec Système d'Affiliation

## Configuration de la Base de Données avec Neon

### Étapes d'installation :

1. **Installer les dépendances** :
\`\`\`bash
npm install
\`\`\`

2. **Configurer Neon** :
   - L'intégration Neon est déjà connectée et fournit automatiquement les variables d'environnement
   - Les variables `NEON_POSTGRES_PRISMA_URL` et `NEON_NEON_DATABASE_URL` sont disponibles automatiquement
   - Pas besoin de créer un fichier `.env` manuellement

3. **Créer les tables dans Neon** :
   - Allez dans l'onglet Scripts de v0
   - Exécutez le script `001_init_database.sql` pour créer toutes les tables
   - (Optionnel) Exécutez `002_seed_sample_data.sql` pour ajouter des données de test

4. **Lancer l'application** :
\`\`\`bash
npm run dev
\`\`\`

## Structure de la Base de Données

### Tables principales :

- **User** : Utilisateurs (Admin, Commerçants, Clients)
- **Merchant** : Profils des commerçants avec codes d'affiliation
- **Product** : Catalogue de produits
- **Order** : Commandes avec tracking d'affiliation
- **OrderItem** : Articles dans les commandes
- **Commission** : Commissions gagnées par les commerçants

## Fonctionnalités

- ✅ Système d'authentification multi-rôles
- ✅ Gestion de produits
- ✅ Tracking d'affiliation avec codes uniques
- ✅ Calcul automatique des commissions
- ✅ Tableau de bord pour commerçants
- ✅ Interface d'achat pour clients
- ✅ Panel admin pour le vendeur

## Utilisation

### Pour les Commerçants :
1. Inscrivez-vous avec le rôle "Commerçant"
2. Obtenez votre code d'affiliation unique dans votre tableau de bord
3. Partagez vos liens d'affiliation avec vos clients
4. Gagnez des commissions sur chaque vente

### Pour les Clients :
1. Cliquez sur un lien d'affiliation d'un commerçant
2. Parcourez le catalogue et ajoutez des produits au panier
3. Passez commande - le commerçant gagnera automatiquement sa commission

### Pour l'Admin :
1. Connectez-vous avec le compte admin
2. Gérez les produits, commandes et commerçants
3. Suivez les statistiques de vente
