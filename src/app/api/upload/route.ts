import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { files } from "@/db/schema";
import { auth } from "@/lib/auth";
import { generateUniqueFilename, validateFile } from "@/lib/validations/file";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const transactionId = formData.get("transactionId") as string;
    const fileType = (formData.get("fileType") as string) || "receipt";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name);
    const uploadDir = join(
      process.cwd(),
      "public",
      "uploads",
      fileType === "avatar" ? "avatars" : "receipts",
    );

    // Ensure upload directory exists
    await mkdir(uploadDir, { recursive: true });

    // Save file to disk
    const filePath = join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Save file metadata to database
    const [fileRecord] = await db
      .insert(files)
      .values({
        userId: parseInt(session.user.id, 10),
        transactionId: transactionId ? parseInt(transactionId, 10) : null,
        filename,
        originalName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        filePath: `/uploads/${fileType === "avatar" ? "avatars" : "receipts"}/${filename}`,
        fileType,
      })
      .returning();

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        filePath: fileRecord.filePath,
        fileType: fileRecord.fileType,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
