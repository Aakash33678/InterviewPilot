import { deleteResume } from "@/app/actions/resume";
import { getUserId } from "@/lib/user";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ resumeId: string }> }
) {
  try {
    await getUserId();

    const { resumeId } = await params;

    const deletedResume = await deleteResume(resumeId);

    if (deletedResume.length === 0) {
      return NextResponse.json(
        { error: "Resume not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Resume deleted successfully",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}