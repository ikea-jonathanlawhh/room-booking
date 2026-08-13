import { defineEventHandler, createError, getRouterParam } from 'h3'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Building ID is required' })
  }

  // Check if building exists
  const existing = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.id, id))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Building not found' })
  }

  // Delete building (MySQL cascade constraint will automatically delete associated rooms)
  await db
    .delete(schema.buildings)
    .where(eq(schema.buildings.id, id))

  return { success: true }
})
