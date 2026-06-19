# Prenotazioni - scaffold

Setup rapido

1. Copia .env.example in .env e imposta DATABASE_URL, SMTP_URL e SMTP_FROM.
2. Installa dipendenze:
   npm install
3. Inizializza Prisma e applica migration (o `prisma db push`):
   npx prisma db push
4. Avvia lo sviluppo:
   npm run dev

Autenticazione: Magic link via NextAuth Email provider.

Questo scaffolding include: Prisma schema, NextAuth config, API routes per prenotazioni e pagine minime.
