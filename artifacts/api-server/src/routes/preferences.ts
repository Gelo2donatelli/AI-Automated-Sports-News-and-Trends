import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, preferencesTable } from "@workspace/db";
import {
  GetPreferencesQueryParams,
  UpdatePreferencesBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const DEFAULT_CATEGORIES = [
  "injury",
  "trade",
  "lineup",
  "performance",
  "signing",
  "suspension",
  "general",
];

function toResponse(row: typeof preferencesTable.$inferSelect) {
  return {
    clientId: row.clientId,
    followedTeamIds: row.followedTeamIds,
    categoriesEnabled: row.categoriesEnabled,
    updatedAt: row.updatedAt.toISOString(),
  };
}

router.get("/preferences", async (req, res): Promise<void> => {
  const parsed = GetPreferencesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .select()
    .from(preferencesTable)
    .where(eq(preferencesTable.clientId, parsed.data.clientId));
  if (!row) {
    res.json({
      clientId: parsed.data.clientId,
      followedTeamIds: [],
      categoriesEnabled: DEFAULT_CATEGORIES,
    });
    return;
  }
  res.json(toResponse(row));
});

router.put("/preferences", async (req, res): Promise<void> => {
  const parsed = UpdatePreferencesBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { clientId, followedTeamIds, categoriesEnabled } = parsed.data;
  const [row] = await db
    .insert(preferencesTable)
    .values({
      clientId,
      followedTeamIds,
      categoriesEnabled,
    })
    .onConflictDoUpdate({
      target: preferencesTable.clientId,
      set: {
        followedTeamIds,
        categoriesEnabled,
        updatedAt: new Date(),
      },
    })
    .returning();
  res.json(toResponse(row));
});

export default router;
