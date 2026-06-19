import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { prisma } from "../lib/prisma";

export default function MyReservations({ reservations }) {
  return (
    <div style={{ padding: 20 }}>
      <h1>Le mie prenotazioni</h1>
      {reservations.length === 0 && <p>Nessuna prenotazione</p>}
      <ul>
        {reservations.map(r => (
          <li key={r.id}>
            {r.schedule.name ?? ''} - {new Date(r.schedule.date).toLocaleString()} - {r.status}
          </li>
        ))}
      </ul>
    </div>
  );
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions as any);
  if (!session) {
    return { redirect: { destination: '/api/auth/signin', permanent: false } };
  }
  const userId = Number(session.user.id);
  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: { schedule: true },
    orderBy: { createdAt: 'desc' },
  });
  return { props: { reservations } };
}
