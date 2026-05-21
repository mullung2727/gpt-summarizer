import { getSummaries, saveSummaries, SummaryItem } from "@/lib/store";
import { NextResponse } from "next/server";

export async function GET() {
  const items = await getSummaries();
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const body = await req.json();
  const newItem: SummaryItem = {
    id: crypto.randomUUID(),
    title: body.title,
    category: body.category,
    summary: body.summary,
    createdAt: new Date().toISOString(),
  };
  const items = await getSummaries();
  items.push(newItem);
  await saveSummaries(items);
  return NextResponse.json(newItem, { status: 201 });
}
