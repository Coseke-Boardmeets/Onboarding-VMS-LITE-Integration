import { prisma } from "./db";

/**
 * Retrieve all visitors from the database, newest first.
 */
export async function findAll() {
  return await prisma.visitor.findMany({
    orderBy: { createdAt: "desc" },
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
      status: "PENDING",
    },
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
      timeIn: new Date(),
    },
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
      timeOut: new Date(),
    },
  });
}

/**
 * Compute visitor statistics for the receptionist dashboard.
 */
export async function getStats() {
  const visitors = await prisma.visitor.findMany({
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();

  // Start of today
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  // Start of 7 days ago
  const startOfLast7Days = new Date(
    startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000,
  );

  // Start of 30 days ago
  const startOfLast30Days = new Date(
    startOfToday.getTime() - 30 * 24 * 60 * 60 * 1000,
  );

  let todayCount = 0;
  let weekCount = 0;
  let monthCount = 0;

  const purposeCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  // Initialize daily counts for the last 15 days to give a beautiful complete timeline
  for (let i = 14; i >= 0; i--) {
    const d = new Date(startOfToday.getTime() - i * 24 * 60 * 60 * 1000);
    const dateKey = d.toISOString().split("T")[0];
    dailyCounts[dateKey] = 0;
  }

  for (const visitor of visitors) {
    const createdDate = new Date(visitor.createdAt);

    // Period checks
    if (createdDate >= startOfToday) {
      todayCount++;
    }
    if (createdDate >= startOfLast7Days) {
      weekCount++;
    }
    if (createdDate >= startOfLast30Days) {
      monthCount++;
    }

    // Purpose grouping (normalize/trim to make it cleaner)
    const purpose = (visitor.purpose || "Other").trim();
    purposeCounts[purpose] = (purposeCounts[purpose] || 0) + 1;

    // Timeline grouping (last 30 days)
    if (createdDate >= startOfLast30Days) {
      const dateKey = createdDate.toISOString().split("T")[0];
      // Increment only if key is initialized (within 15 days) or just add if needed
      dailyCounts[dateKey] = (dailyCounts[dateKey] || 0) + 1;
    }
  }

  // Format purposeStats as sorted array
  const purposeStats = Object.entries(purposeCounts)
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count);

  // Format timelineStats as sorted array of dates
  const timelineStats = Object.entries(dailyCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      today: todayCount,
      thisWeek: weekCount,
      thisMonth: monthCount,
      allTime: visitors.length,
    },
    purposeStats,
    timelineStats,
  };
}
