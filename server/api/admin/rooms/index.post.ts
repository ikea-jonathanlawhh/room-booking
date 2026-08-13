import { defineEventHandler, readBody, createError } from 'h3'
import { db, schema } from 'hub:db'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userEmail = session.user.email

  const body = await readBody(event)

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Request body required' })
  }

  const { buildingId, name, email, description } = body

  if (!buildingId || typeof buildingId !== 'string' || !buildingId.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Building selection is required' })
  }

  if (!name || typeof name !== 'string' || !name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Room name is required' })
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Room email is required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid email address format' })
  }

  const buildingIdTrimmed = buildingId.trim()
  const emailTrimmed = email.trim().toLowerCase()

  // Verify building exists in database
  const buildingExists = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.id, buildingIdTrimmed))
    .limit(1)

  if (buildingExists.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Selected building does not exist' })
  }

  // Check email uniqueness in database
  const emailExists = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.email, emailTrimmed))
    .limit(1)

  if (emailExists.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Room email address is already in use' })
  }

  const newRoom = {
    id: `rm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    buildingId: buildingIdTrimmed,
    name: name.trim(),
    email: emailTrimmed,
    description: description?.trim() || null,
    createdBy: userEmail,
    updatedBy: userEmail,
    createdTimestamp: new Date(),
    updateTimestamp: new Date()
  }

  await db.insert(schema.rooms).values(newRoom)

  return {
    value: newRoom
  }
})
