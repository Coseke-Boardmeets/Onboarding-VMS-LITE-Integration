import { prisma } from "./db";

export async function findByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function findById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
  });
}

export async function create(data: {
  email: string;
  passwordHash: string;
  fullName: string;
}) {
  return await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password: data.passwordHash,
      fullName: data.fullName,
    },
  });
}

export async function countUsers() {
  return await prisma.user.count();
}
