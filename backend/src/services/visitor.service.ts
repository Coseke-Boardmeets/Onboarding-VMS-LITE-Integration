import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Create a connection pool and initialize the database adapter
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);

// A single shared Prisma client instance — do NOT create a new one inside each function
const prisma = new PrismaClient({ adapter });


/**
 * Retrieve all visitors from the database, newest first.
 */
export async function findAll() {
    return await prisma.visitor.findMany({
    orderBy: { createdAt: "desc" }
  });
}

/**
 * Create a new visitor record with PENDING status.
 */
export async function create(data: { fullName: string; purpose: string }) {
    return await prisma.visitor.create({
    data: {
      fullName: data.fullName,
      purpose: data.purpose,
      status: "PENDING"
    }
  });

}

/**
 * Mark a visitor as CHECKED_IN and record their arrival time.
 */
export async function checkIn(id: string) {
    return await prisma.visitor.update({
    where: { id },
    data: {
      status: "CHECKED_IN",
      timeIn: new Date()
    }
  });
}

/**
 * Mark a visitor as CHECKED_OUT and record their departure time.
 */
export async function checkOut(id: string) {
    return await prisma.visitor.update({
    where: { id },
    data: {
      status: "CHECKED_OUT",
      timeOut: new Date()
    }
  });
}
