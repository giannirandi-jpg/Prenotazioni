import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session) return res.status(401).json({ error: "Autenticazione richiesta" });

  const userId = Number(session.user.id);
  const { id } = req.query;

  if (req.method === "DELETE") {
    const reservation = await prisma.reservation.findUnique({ where: { id: Number(id) } });
    if (!reservation) return res.status(404).json({ error: "Reservation non trovato" });
    if (reservation.userId !== userId) return res.status(403).json({ error: "Non autorizzato" });

    // annulla la prenotazione
    await prisma.reservation.update({ where: { id: Number(id) }, data: { status: "CANCELLED" } });

    // se era CONFIRMED, promuovi primo in waitlist
    if (reservation.status === "CONFIRMED") {
      const next = await prisma.reservation.findFirst({
        where: { scheduleId: reservation.scheduleId, status: "WAITLIST" },
        orderBy: { waitPosition: "asc" },
      });
      if (next) {
        await prisma.reservation.update({ where: { id: next.id }, data: { status: "CONFIRMED", waitPosition: null } });

        // decrementa posizioni della waitlist
        await prisma.$executeRaw`
          UPDATE "Reservation" SET "waitPosition" = "waitPosition" - 1
          WHERE "scheduleId" = ${reservation.scheduleId} AND "status" = 'WAITLIST' AND "waitPosition" > ${next.waitPosition}
        `;
      }
    }

    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
