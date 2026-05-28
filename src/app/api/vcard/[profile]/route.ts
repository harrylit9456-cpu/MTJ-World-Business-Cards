import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request: Request, props: { params: Promise<{ profile: string }> }) {
  const params = await props.params;
  const { profile } = params;

  let data: any = null;

  try {
    if (db.app.options.projectId !== "demo-project") {
      const docRef = doc(db, "profiles", profile.toLowerCase());
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        data = docSnap.data();
      }
    }
  } catch (error) {
    console.error("Error fetching profile for vCard:", error);
  }

  if (!data) {
    return new NextResponse("Profile not found", { status: 404 });
  }

  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${data.name || ""}
ORG:MTJ World
TITLE:${data.role || ""}
TEL;TYPE=WORK,VOICE:${data.phone || ""}
EMAIL;TYPE=WORK:${data.email || ""}
URL:${data.website || "https://mtjworld.com"}
END:VCARD`;

  const filename = `${data.name?.replace(/\s+/g, '_') || "Contact"}_Contact.vcf`;

  return new NextResponse(vcard, {
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
