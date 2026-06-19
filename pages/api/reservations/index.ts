import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { prisma } from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions as any);
  if (!session) return res.status(401).json({ error: "Autenticazione richiesta" });

  const userId = Number(session.user.id);

  if (req.method === "POST") {
    const { scheduleId } = req.body;
    if (!scheduleId) return res.status(400).json({ error: "scheduleId richiesto" });

    // carica schedule con gym
    const schedule = await prisma.schedule.findUnique({
      where: { id: Number(scheduleId) },
      include: { gym: true },
    });
    if (!schedule) return res.status(404).json({ error: "Schedule non trovato" });

    // evita doppia prenotazione
    const existing = await prisma.reservation.findUnique({
      where: { userId_scheduleId: { userId, scheduleId: Number(scheduleId) } },
    });
    if (existing) return res.status(400).json({ error: "Hai già una prenotazione per questo slot" });

    const confirmedCount = await prisma.reservation.count({
      where: { scheduleId: Number(scheduleId), status: "CONFIRMED" },
    });

    if (confirmedCount < schedule.gym.capacity) {
      const r = await prisma.reservation.create({
        data: { userId, scheduleId: Number(scheduleId), status: "CONFIRMED" },
      });
      return res.status(201).json({ reservation: r, status: "CONFIRMED" });
    } else {
      const agg = await prisma.reservation.aggregate({
        _max: { waitPosition: true },
        where: { scheduleId: Number(scheduleId), status: "WAITLIST" },
      });
      const nextPos = (agg._max.waitPosition ?? 0) + 1;
      const r = await prisma.reservation.create({
        data: { userId, scheduleId: Number(scheduleId), status: "WAITLIST", waitPosition: nextPos },
      });
      return res.status(201).json({ reservation: r, status: "WAITLIST", position: nextPos });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
