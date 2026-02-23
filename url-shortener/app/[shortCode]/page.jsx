import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ShortCodePage({ params }) {
  const { shortCode } = await params;

  if (!shortCode || shortCode.length > 20) {
    notFound();
  }

  const url = await prisma.url.findUnique({
    where: { shortCode },
  });

  if (!url) {
    notFound();
  }

  await prisma.url.update({
    where: { id: url.id },
    data: { clicks: { increment: 1 } },
  });

  redirect(url.originalUrl);
}
