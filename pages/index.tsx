import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]";
import { prisma } from "../lib/prisma";

export default function Home({ gyms }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Prenotazioni Palestre</h1>
      <p>Scegli una palestra:</p>
      <ul>
        {gyms.map(g => (
          <li key={g.id}>{g.name} (posti: {g.capacity})</li>
        ))}
      </ul>
      <p>
        <Link href="/api/auth/signin">Accedi / Registrati</Link> | <Link href="/my-reservations">Le mie prenotazioni</Link>
      </p>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  // mostra le palestre (se non ce ne sono, l'admin le può creare via prisma)
  const gyms = await prisma.gym.findMany();
  return { props: { gyms } };
}
