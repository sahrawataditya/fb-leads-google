import { NextResponse } from "next/server";
import { appendToGoogleSheet } from "@/lib/appendToSheet";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req) {
  const body = await req.json();

  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const leadgenId = changes?.value?.leadgen_id;
    const formId = changes?.value?.form_id;
    const adId = changes?.value?.ad_id;

    const leadRes = await fetch(
      `https://graph.facebook.com/v17.0/${leadgenId}?access_token=${process.env.FB_PAGE_ACCESS_TOKEN}`
    );

    const data = await leadRes.json();
    const fieldData = data.field_data || [];

    const getField = (fieldName) =>
      fieldData.find((f) => f.name === fieldName)?.values?.[0] || "";

    const name = getField("full_name");
    const email = getField("email");
    const phone = getField("phone_number");

    await appendToGoogleSheet({
      name,
      email,
      phone,
      adId,
      formId,
      created_time: data.created_time,
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (err) {
    console.error("Error handling Facebook lead:", err);
    return NextResponse.json(
      { status: "error", error: err.message },
      { status: 500 }
    );
  }
}
