# Guide de Configuration Supabase Storage pour les Logos

Pour permettre aux plans Enterprise d'uploader leurs logos, vous devez configurer un bucket Supabase Storage.

## Étape 1 : Créer le Bucket

1. Allez sur votre projet Supabase : https://supabase.com/dashboard
2. Cliquez sur **Storage** dans le menu de gauche
3. Cliquez sur **New bucket**
4. Configurez le bucket :
   - **Name** : `restaurant-assets`
   - **Public bucket** : ✅ **Cochez cette case** (important pour que les logos soient accessibles publiquement)
   - **File size limit** : 5 MB (ou plus selon vos besoins)
   - **Allowed MIME types** : `image/*` (ou laissez vide pour tous les types)

5. Cliquez sur **Create bucket**

## Étape 2 : Configurer les Politiques RLS (Row Level Security)

1. Dans le bucket `restaurant-assets`, cliquez sur **Policies**
2. Cliquez sur **New Policy**
3. Sélectionnez **For full customization**, puis cliquez sur **Use this template**
4. Configurez la politique pour permettre l'upload :

**Policy Name** : `Allow authenticated users to upload logos`

**Allowed operation** : `INSERT`

**Policy definition** :
```sql
(authenticated() AND bucket_id = 'restaurant-assets')
```

5. Créez une autre politique pour permettre la lecture :

**Policy Name** : `Allow public read access to logos`

**Allowed operation** : `SELECT`

**Policy definition** :
```sql
(bucket_id = 'restaurant-assets')
```

6. Créez une politique pour permettre la suppression (pour les utilisateurs qui possèdent le logo) :

**Policy Name** : `Allow users to delete their own logos`

**Allowed operation** : `DELETE`

**Policy definition** :
```sql
(authenticated() AND bucket_id = 'restaurant-assets')
```

## Étape 3 : Vérifier la Configuration

Une fois configuré, les utilisateurs avec un plan Enterprise pourront :
- Uploader leur logo dans les paramètres du restaurant
- Le logo s'affichera automatiquement sur la page de review (`/review/[slug]`)

## Notes Importantes

- Les logos sont stockés dans le dossier `restaurant-logos/` du bucket
- Les anciens logos sont automatiquement supprimés lors de l'upload d'un nouveau logo
- La taille maximale par défaut est de 5MB
- Seuls les formats d'image sont acceptés (JPG, PNG, GIF, etc.)

## Dépannage

Si vous rencontrez des erreurs lors de l'upload :

1. **Erreur "Bucket not found"** : Vérifiez que le bucket `restaurant-assets` existe bien
2. **Erreur "Permission denied"** : Vérifiez que les politiques RLS sont correctement configurées
3. **Erreur "File too large"** : Augmentez la limite de taille dans les paramètres du bucket
4. **Logo ne s'affiche pas** : Vérifiez que le bucket est public et que l'URL est correcte

