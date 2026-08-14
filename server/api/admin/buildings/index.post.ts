import { defineEventHandler, readBody, createError } from 'h3'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userEmail = session.user.email

  const body = await readBody(event)

  if (!body || !body.name || typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Building name is required'
    })
  }

  const nameTrimmed = body.name.trim().toUpperCase()

  // Check for duplicate name (case-insensitive depending on database collation, standard eq)
  const existing = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.name, nameTrimmed))
    .limit(1)

  if (existing.length > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Building with this name already exists'
    })
  }

  const newBuilding = {
    id: `bld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: nameTrimmed,
    description: body.description?.trim() || null,
    createdBy: userEmail,
    updatedBy: userEmail,
    createdTimestamp: new Date(),
    updateTimestamp: new Date()
  }

  await db.insert(schema.buildings).values(newBuilding)

  return {
    value: newBuilding
  }
})
