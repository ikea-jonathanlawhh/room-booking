import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { db, schema } from 'hub:db'
import { eq, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userEmail = session.user.email

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Building ID is required' })
  }

  const body = await readBody(event)
  if (!body || !body.name || typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Building name is required' })
  }

  const nameTrimmed = body.name.trim()

  // Verify building exists
  const existingList = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.id, id))
    .limit(1)

  if (existingList.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Building not found' })
  }

  const existingBuilding = existingList[0]

  // Check duplicate name excluding self
  const duplicate = await db
    .select()
    .from(schema.buildings)
    .where(and(
      ne(schema.buildings.id, id),
      eq(schema.buildings.name, nameTrimmed)
    ))
    .limit(1)

  if (duplicate.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Another building with this name already exists' })
  }

  const updatedData = {
    name: nameTrimmed,
    description: body.description?.trim() || null,
    updatedBy: userEmail,
    updateTimestamp: new Date()
  }

  await db
    .update(schema.buildings)
    .set(updatedData)
    .where(eq(schema.buildings.id, id))

  return {
    value: {
      ...existingBuilding,
      ...updatedData
    }
  }
})
