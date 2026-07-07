# CH-Portail-Admin

Portail d'administration CustHome : gestion des utilisateurs (activation/désactivation,
édition, suppression), workflow de validation des nouveaux comptes, et gestion des rôles.

Front **React 19 + TypeScript + Vite**, basé sur le design system **`canopui`**,
servi par un serveur Node/Express qui proxifie `/api/*` vers l'**API Gateway**.

## Architecture

```
Navigateur ──► CH-Api-GateWay (:8080)
                 │  [401 navigateur] redirige vers le portail d'authentification
                 ▼
        CH-Portail-Admin (:3001)
                 │  /api/* → Gateway (cookies HttpOnly same-origin)
                 ▼
        Gateway /api/auth/*  ──► CH-Api-Authenticator (:8081)   (session /me, logout)
        Gateway /api/admin/* ──► CH-Api-Authenticator (:8081)   (gestion users/rôles, US-8.4)
```

- **Authentification** : centralisée sur `CH-Portail-Authenticator`. Ce portail ne porte
  pas d'écran de connexion ; sans session valide, l'utilisateur y est redirigé
  (`VITE_AUTH_PORTAL_URL`, défaut `http://localhost:3000`).
- **Autorisation** : accès réservé au rôle `admin` sur le portail `portail_admin`
  (ou super-admin global). La garde `RequireAdmin` vérifie via `/api/auth/me` ;
  le Gateway impose la même règle côté `/api/admin/*` (portal `portail_admin`).
- **Tokens** : jamais manipulés par le front (cookies HttpOnly `ch_token` / `ch_refresh`).

## Démarrage

```bash
npm install
cp .env.example .env   # ajuster si besoin (PORT, GATEWAY_URL, VITE_AUTH_PORTAL_URL)
npm run dev            # http://localhost:3001
```

Le portail attend l'API Gateway sur `http://localhost:8080`. Le design system `canopui`
est un package hébergé (registry npm privé configuré dans `.npmrc`) : `npm install` le récupère,
aucune synchronisation locale n'est nécessaire.

## Scripts

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de dev Vite (port 3001) |
| `npm run build` | `tsc -b` + build Vite (prod) |
| `npm start` | Sert le build via Express (`server.js`) |
| `npm run lint` | ESLint |
| `npm test` | Tests Vitest |
| `npm run coverage` | Tests + couverture (seuil 80%) |

## Structure

```
src/
  api/        Client HTTP (request + ApiError) et endpoints (auth: /me, logout)
  components/ RequireAdmin (garde), AdminLayout (coquille + nav)
  context/    CurrentUser (utilisateur courant, dispo sous RequireAdmin)
  i18n/       Messages fr/en (admin.*)
  lib/        roles (isPortalAdmin), navigation, auth-redirect
  pages/      Dashboard, Users, Roles, Forbidden
```

## Suivi

Sprint Jira **« Portail Admin »** (EPIC 8 / SCRUM-106). US `SCRUM-107` → `SCRUM-115`.
