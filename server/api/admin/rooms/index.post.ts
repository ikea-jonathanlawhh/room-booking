import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
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

  const buildings = await getBuildings()
  const buildingExists = buildings.some(b => b.id === buildingId)
  if (!buildingExists) {
    throw createError({ statusCode: 404, statusMessage: 'Selected building does not exist' })
  }

  const rooms = await getRooms()

  // Check email uniqueness
  const emailExists = rooms.some(r => r.email.toLowerCase() === email.trim().toLowerCase())
  if (emailExists) {
    throw createError({ statusCode: 409, statusMessage: 'Room email address is already in use' })
  }

  const newRoom: Room = {
    id: `rm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    buildingId: buildingId.trim(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    description: description?.trim() || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  rooms.push(newRoom)
  await saveRooms(rooms)

  return {
    value: newRoom
  }
})
