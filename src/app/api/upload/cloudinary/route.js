import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

export async function POST(req) {
  const form = await req.formData();
  const file = form.get("file");
  if (!file || typeof file === "string") {
    return new Response("NO_FILE", { status: 400 });
  }

  const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
  if (!ALLOWED.includes(file.type)) {
    return new Response("INVALID_TYPE", { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return new Response("TOO_LARGE", { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buf.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "employees",
    resource_type: "image",
    transformation: [{ width: 512, height: 512, crop: "fill", gravity: "auto" }],
  });

  return new Response(
    JSON.stringify({
      url: result.secure_url,      // เก็บลง photoUrl
      publicId: result.public_id,  // เก็บลง photoPublicId (ไว้ลบ/อัปเดต)
      width: result.width,
      height: result.height,
      format: result.format,
    }),
    { status: 200 }
  );
}
