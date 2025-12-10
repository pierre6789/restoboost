# 🚀 Guide pour Pousser le Code sur GitHub

## Prérequis

Assurez-vous d'avoir Git installé et configuré :
```bash
git --version
```

Si ce n'est pas installé : https://git-scm.com/downloads

---

## Étape 1 : Initialiser Git (si pas déjà fait)

Ouvrez votre terminal dans le dossier du projet et exécutez :

```bash
cd C:\Users\pierr\Desktop\restoboost\restoboost
git init
```

---

## Étape 2 : Créer un fichier .gitignore (si pas déjà présent)

Assurez-vous d'avoir un `.gitignore` pour ne pas pousser les fichiers sensibles :

```bash
# Créez ou vérifiez le fichier .gitignore
```

Le fichier devrait contenir au minimum :
```
node_modules/
.next/
.env.local
.env*.local
.DS_Store
*.log
```

---

## Étape 3 : Ajouter tous les fichiers

```bash
git add .
```

---

## Étape 4 : Faire le premier commit

```bash
git commit -m "Initial commit: RestoBoost MVP with feature gating"
```

---

## Étape 5 : Connecter au repo GitHub

```bash
git remote add origin https://github.com/pierre6789/restoboost.git
```

---

## Étape 6 : Pousser le code

```bash
git branch -M main
git push -u origin main
```

Si vous êtes demandé de vous authentifier :
- Utilisez un **Personal Access Token** (pas votre mot de passe)
- Créez-en un ici : https://github.com/settings/tokens
- Sélectionnez les permissions : `repo` (toutes les permissions repo)

---

## Commandes Complètes (Copier-Coller)

```bash
# Aller dans le dossier du projet
cd C:\Users\pierr\Desktop\restoboost\restoboost

# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Faire le commit
git commit -m "Initial commit: RestoBoost MVP with feature gating"

# Connecter au repo GitHub
git remote add origin https://github.com/pierre6789/restoboost.git

# Pousser le code
git branch -M main
git push -u origin main
```

---

## ⚠️ Si vous avez déjà un repo Git local

Si vous avez déjà fait `git init` avant, vous devrez peut-être :

```bash
# Vérifier les remotes existants
git remote -v

# Si origin existe déjà, supprimez-le et réajoutez-le
git remote remove origin
git remote add origin https://github.com/pierre6789/restoboost.git

# Pousser
git push -u origin main
```

---

## 🔐 Authentification GitHub

Si vous êtes demandé de vous connecter :

1. **Ne pas utiliser votre mot de passe GitHub**
2. **Créer un Personal Access Token** :
   - Allez sur : https://github.com/settings/tokens
   - Cliquez sur "Generate new token (classic)"
   - Donnez-lui un nom : "RestoBoost Local"
   - Sélectionnez la permission : `repo` (toutes les permissions)
   - Cliquez sur "Generate token"
   - **Copiez le token** (vous ne pourrez plus le voir après)
3. **Utilisez le token comme mot de passe** quand Git vous le demande

---

## ✅ Vérification

Après avoir poussé, allez sur :
https://github.com/pierre6789/restoboost

Vous devriez voir tous vos fichiers !

---

## 🐛 Dépannage

### Erreur : "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/pierre6789/restoboost.git
```

### Erreur : "failed to push some refs"
```bash
# Si le repo GitHub a déjà du contenu (README, etc.)
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### Erreur d'authentification
- Utilisez un Personal Access Token, pas votre mot de passe
- Vérifiez que le token a les permissions `repo`

---

## 📝 Prochaines Étapes

Une fois le code poussé sur GitHub :

1. **Connectez le repo à Vercel** (voir `GUIDE_DEPLOIEMENT_VERCEL.md`)
2. **Configurez les variables d'environnement**
3. **Déployez !**

