import { prisma } from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  const checkin = await prisma.checkin.create({
    data: {
        ...body,
    },
  });

  return checkin;
});