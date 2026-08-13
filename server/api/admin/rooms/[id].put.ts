import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'
import { db, schema } from 'hub:db'
import { eq, and, ne } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userEmail = session.user.email

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID is required' })
  }

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

  // Verify room exists in database
  const existingList = await db
    .select()
    .from(schema.rooms)
    .where(eq(schema.rooms.id, id))
    .limit(1)

  if (existingList.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  const existingRoom = existingList[0]

  // Verify building exists in database
  const buildingExists = await db
    .select()
    .from(schema.buildings)
    .where(eq(schema.buildings.id, buildingIdTrimmed))
    .limit(1)

  if (buildingExists.length === 0) {
    throw createError({ statusCode: 404, statusMessage: 'Selected building does not exist' })
  }

  // Check email uniqueness excluding current room
  const emailDuplicate = await db
    .select()
    .from(schema.rooms)
    .where(and(
      ne(schema.rooms.id, id),
      eq(schema.rooms.email, emailTrimmed)
    ))
    .limit(1)

  if (emailDuplicate.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Room email address is already in use by another room' })
  }

  const updatedData = {
    buildingId: buildingIdTrimmed,
    name: name.trim(),
    email: emailTrimmed,
    description: description?.trim() || null,
    updatedBy: userEmail,
    updateTimestamp: new Date()
  }

  await db
    .update(schema.rooms)
    .set(updatedData)
    .where(eq(schema.rooms.id, id))

  return {
    value: {
      ...existingRoom,
      ...updatedData
    }
  }
})
