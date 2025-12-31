# API Port Russell

## 📌 Présentation du projet

**API Port Russell** est une application Node.js permettant de gérer un port de plaisance.Le projet combine :

- une **API REST** documentée avec **Swagger**
- une **interface web (EJS)** pour l’administration
- une **authentification sécurisée par JWT (cookie httpOnly)**
- une base de données **MongoDB**

Les fonctionnalités principales couvrent la gestion :

- des **utilisateurs**
- des **catways**
- des **réservations**

---

## 🧱 Stack technique

- Node.js
- Express
- MongoDB + Mongoose
- EJS
- JWT (authentification)
- Swagger (swagger-jsdoc / swagger-ui-express)
- Postman
- method-override (PATCH / DELETE via formulaires)

---

## 📂 Arborescence (extrait)

```txt
src
 ┣ app.js
 ┣ config
 ┃ ┣ db
 ┃ ┃ ┗ mongo.js
 ┃ ┗ swagger.js
 ┣ middlewares
 ┣ models
 ┣ routes
 ┃ ┣ api
 ┃ ┗ web
 ┣ services
 ┣ views
 ┃ ┣ layout.ejs
 ┃ ┣ index.ejs
 ┃ ┣ dashboard
 ┃ ┣ catways
 ┃ ┣ reservations
 ┃ ┗ users
public
 ┗ stylesheets
   ┗ style.css
```


## ⚙️ Prérequis

* Node.js ≥ 18
* MongoDB installé et lancé en local
* Postman

---

## 🔐 Configuration de l’environnement

Le fichier `.env` **n’est pas fourni** (bonne pratique).

Un fichier d’exemple est disponible.

### 1️⃣ Créer le fichier `.env`

<pre class="overflow-visible! px-0!" data-start="1393" data-end="1455"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>cp</span><span> src/config/env/.env.example src/config/env/.env
</span></span></code></div></div></pre>

### 2️⃣ Variables attendues (exemple)

<pre class="overflow-visible! px-0!" data-start="1496" data-end="1591"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-env"><span>PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/port_russell
SECRET_KEY=dev_secret_key
</span></code></div></div></pre>

---

## ▶️ Lancement du projet (local)

### 1️⃣ Installer les dépendances

<pre class="overflow-visible! px-0!" data-start="1668" data-end="1691"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm install
</span></span></code></div></div></pre>

### 2️⃣ Démarrer MongoDB

<pre class="overflow-visible! px-0!" data-start="1719" data-end="1737"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>mongod
</span></span></code></div></div></pre>

### 3️⃣ Lancer l’application

<pre class="overflow-visible! px-0!" data-start="1769" data-end="1790"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-bash"><span><span>npm start
</span></span></code></div></div></pre>

Application disponible sur :

<pre class="overflow-visible! px-0!" data-start="1822" data-end="1851"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>http:</span><span>//localhost:3000</span><span>
</span></span></code></div></div></pre>


## 👤 Compte de démonstration

Un compte utilisateur doit exister pour se connecter.

### 🔑 Identifiants de test

<pre class="overflow-visible! px-0!" data-start="1973" data-end="2040"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-txt"><span><span>Email : admin@port-russell.test
Mot de passe : Admin123!
</span></span></code></div></div></pre>

> Ces identifiants sont fournis à titre **strictement pédagogique** pour le devoir.

---

## 🖥️ Interface web (EJS)

* `/` → page d’accueil + formulaire de connexion
* `/dashboard` → tableau de bord (réservations en cours / à venir)
* `/catways` → gestion des catways
* `/reservations` → gestion complète des réservations
* `/users` → gestion des utilisateurs

---

## 📘 API REST & Swagger

La documentation Swagger est accessible à l’adresse :

<pre class="overflow-visible! px-0!" data-start="2490" data-end="2528"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>http://localhost:3000/api-docs
</span></span></code></div></div></pre>

Elle détaille l’ensemble des endpoints :

* Authentification
* Users
* Catways
* Reservations

---

## 🧪 Tests avec Postman

Le projet est conçu pour être testé avec  **Postman** .

### Étapes recommandées :

1. Importer la collection Postman fournie
2. Tester les endpoints CRUD
3. Vérifier les règles métier :
   * catwayNumber unique
   * dates valides
   * absence de chevauchement de réservations

---

## 📋 Règles métier principales

### Catways

* Identifiés par `catwayNumber` (pas d’ObjectId)
* `catwayType` : `long` ou `short`
* Seul `catwayState` est modifiable

### Réservations

* `catwayNumber` doit exister
* `endDate` > `startDate`
* Aucun chevauchement autorisé sur un même catway
* Plusieurs réservations possibles à des périodes différentes

---

## 🔒 Sécurité

* JWT stocké en **cookie httpOnly**
* Variables sensibles protégées par `.env`
* Aucun mot de passe stocké ou affiché en clair
* Routes protégées par middleware (`requireAuth`)

---

## ⚠️ Notes importantes

* Le dossier `public/` contient uniquement des **assets statiques** (CSS, images).
* Les pages sont rendues via **EJS** (`views/`).
* Aucun fichier `index.html` statique n’est utilisé afin d’éviter les conflits avec le routage Express.

---

## 📎 Contexte

Projet réalisé dans le cadre d’un  **devoir Node.js / Express / MongoDB** , avec utilisation obligatoire de **Postman** et  **MongoDB** .
