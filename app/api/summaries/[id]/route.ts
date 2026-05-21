import { getSummaries, saveSummaries } from "@/lib/store";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const items = await getSummaries();
  const item = items.find(s=>s.id===id);

  if (!item) return NextResponse.json(
    {error: "Not found"}, {status: 404}
  );

  Object.assign(item, body);
  await saveSummaries(items);
  return NextResponse.json(item);
}

export async function DELETE(
  _req:Request, {params}:{params: Promise<{id:string}>}
) {
  const {id} = await params;
  const items = await getSummaries();
  const index = items.findIndex(s=>s.id===id);

  if( index===-1) return NextResponse.json({error:"Not found"})

  items.splice(index,1);
  await saveSummaries(items);
  return new NextResponse(null, {status:204});
}
