import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
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

  const rooms = await getRooms()
  const index = rooms.findIndex(r => r.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  // Check email uniqueness excluding current room
  const emailDuplicate = rooms.some(r => r.id !== id && r.email.toLowerCase() === email.trim().toLowerCase())
  if (emailDuplicate) {
    throw createError({ statusCode: 409, statusMessage: 'Room email address is already in use by another room' })
  }

  rooms[index] = {
    ...rooms[index],
    buildingId: buildingId.trim(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    description: description?.trim() || undefined,
    updatedAt: new Date().toISOString()
  }

  await saveRooms(rooms)

  return {
    value: rooms[index]
  }
})
