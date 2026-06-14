"use server";

import { getPb, BASECAMP_DOC_ID } from "@/lib/pb/server";
import type { Basecamp } from "@/lib/types";

type UpdatableFields = Omit<Partial<Basecamp>, "updatedAt" | "updatedBy">;

export async function updateBasecamp(
  fields: UpdatableFields,
  updatedBy: string,
) {
  try {
    const pb = getPb();
    const payload = { ...fields, updatedBy };
    try {
      await pb.collection("basecamp").update(BASECAMP_DOC_ID, payload);
    } catch (err) {
      if ((err as { status?: number }).status === 404) {
        await pb
          .collection("basecamp")
          .create({ id: BASECAMP_DOC_ID, ...payload });
      } else {
        throw err;
      }
    }
  } catch (err) {
    console.error("Failed to update basecamp:", err);
    throw err;
  }
}
