import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }

  const [users, analyses, payments, events] = await Promise.all([
    prisma.user.count(),
    prisma.analysis.findMany({ select: { status: true, overallScore: true, reportUnlocked: true, estimatedCostUsd: true, targetRole: true, targetLanguage: true } }),
    prisma.payment.findMany({ select: { status: true, amountMad: true, productCode: true } }),
    prisma.analyticsEvent.groupBy({ by: ["name"], _count: true }),
  ]);

  const completed = analyses.filter((a) => a.status === "COMPLETED");
  const paid = payments.filter((p) => p.status === "SUCCEEDED");
  const revenue = paid.reduce((s, p) => s + p.amountMad, 0);
  const free = completed.filter((a) => !a.reportUnlocked).length;
  const paidAnalyses = completed.filter((a) => a.reportUnlocked).length;
  const avgScore =
    completed.length === 0
      ? 0
      : Math.round(completed.reduce((s, a) => s + (a.overallScore ?? 0), 0) / completed.length);
  const aiCost = completed.reduce((s, a) => s + a.estimatedCostUsd, 0);
  const conversion = completed.length ? Math.round((paidAnalyses / completed.length) * 1000) / 10 : 0;
  const aov = paid.length ? Math.round(revenue / paid.length) : 0;

  const roles: Record<string, number> = {};
  for (const a of completed) {
    const key = a.targetRole || "(non précisé)";
    roles[key] = (roles[key] ?? 0) + 1;
  }

  return NextResponse.json({
    kpis: {
      users,
      cvAnalyzed: completed.length,
      conversionRate: conversion,
      revenueMad: revenue,
      averageOrderValue: aov,
      aiCostUsd: Math.round(aiCost * 10000) / 10000,
      profitPerAnalysisMad: completed.length ? Math.round((revenue - aiCost * 10) / completed.length) : 0,
      freeAnalyses: free,
      paidAnalyses,
      averageCvScore: avgScore,
    },
    funnel: events,
    popularRoles: Object.entries(roles)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8),
    languages: Object.entries(
      completed.reduce<Record<string, number>>((acc, a) => {
        acc[a.targetLanguage] = (acc[a.targetLanguage] ?? 0) + 1;
        return acc;
      }, {}),
    ),
  });
}
