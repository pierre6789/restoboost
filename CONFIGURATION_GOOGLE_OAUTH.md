# Configuration de l'Authentification Google OAuth

## Étapes de Configuration

### 1. Configuration dans Supabase

1. Allez dans votre projet Supabase : https://supabase.com/dashboard
2. Naviguez vers **Authentication** > **Providers**
3. Activez le provider **Google**
4. Vous devrez configurer :
   - **Client ID** : Obtenu depuis Google Cloud Console
   - **Client Secret** : Obtenu depuis Google Cloud Console
5. Dans **Redirect URLs**, ajoutez :
   ```
   https://restorise.fr/auth/callback
   ```
   (Pour le développement local, ajoutez aussi : `http://localhost:3000/auth/callback`)

### 2. Configuration dans Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **Google+ API** (ou utilisez Google Identity)
4. Allez dans **Credentials** > **Create Credentials** > **OAuth client ID**
5. Configurez :
   - **Application type** : Web application
   - **Name** : RestoRise (ou votre nom)
   - **Authorized JavaScript origins** :
     ```
     https://restorise.fr
     http://localhost:3000 (pour le développement)
     ```
   - **Authorized redirect URIs** :
     ```
     https://[votre-projet-supabase].supabase.co/auth/v1/callback
     ```
     (Trouvez cette URL dans Supabase > Authentication > URL Configuration)
6. Copiez le **Client ID** et le **Client Secret**
7. Collez-les dans Supabase (étape 1)

### 3. Configuration de l'URL de Redirection Email

Dans Supabase :
1. Allez dans **Authentication** > **URL Configuration**
2. Dans **Site URL**, mettez :
   ```
   https://restorise.fr
   ```
3. Dans **Redirect URLs**, ajoutez :
   ```
   https://restorise.fr/auth/callback
   https://restorise.fr/dashboard
   ```

### 4. Variable d'Environnement

Assurez-vous que dans votre `.env.local` (et sur Vercel), vous avez :
```env
NEXT_PUBLIC_URL=https://restorise.fr
```

## Test de l'Authentification Google

1. Allez sur `/login` ou `/signup`
2. Cliquez sur "Continuer avec Google"
3. Vous devriez être redirigé vers Google pour vous connecter
4. Après connexion, vous serez redirigé vers `/dashboard`

## Test de la Confirmation d'Email

1. Créez un compte avec email/mot de passe
2. Vérifiez votre email
3. Cliquez sur le lien de confirmation
4. Vous devriez être redirigé vers `https://restorise.fr/auth/callback` puis vers `/dashboard`

## Dépannage

### Problème : "redirect_uri_mismatch"
- Vérifiez que l'URL de redirection dans Google Cloud Console correspond exactement à celle dans Supabase
- L'URL doit être : `https://[votre-projet-supabase].supabase.co/auth/v1/callback`

### Problème : Redirection vers localhost après confirmation email
- Vérifiez que `NEXT_PUBLIC_URL` est bien configuré à `https://restorise.fr`
- Vérifiez les **Redirect URLs** dans Supabase incluent `https://restorise.fr/auth/callback`

### Problème : Google OAuth ne fonctionne pas
- Vérifiez que le provider Google est activé dans Supabase
- Vérifiez que les credentials (Client ID et Secret) sont corrects
- Vérifiez que les URLs autorisées dans Google Cloud Console sont correctes

