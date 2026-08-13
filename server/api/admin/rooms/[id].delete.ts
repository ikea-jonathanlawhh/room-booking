import { defineEventHandler, createError, getRouterParam } from 'h3'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID is required' })
  }

  // Check if room exists
  const existing = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id))
    .limit(1)

  if (existing.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  // Delete room
  await db
    .delete(schema.rooms)
    .where(eq(schema.rooms.id, id))

  return { success: true }
})
