import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Room ID is required' })
  }

  const rooms = await getRooms()
  const filtered = rooms.filter(r => r.id !== id)

  if (filtered.length === rooms.length) {
    throw createError({ statusCode: 404, statusMessage: 'Room not found' })
  }

  await saveRooms(filtered)

  return { success: true }
})
