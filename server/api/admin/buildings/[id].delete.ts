import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Building ID is required' })
  }

  const buildings = await getBuildings()
  const filtered = buildings.filter(b => b.id !== id)

  if (filtered.length === buildings.length) {
    throw createError({ statusCode: 404, statusMessage: 'Building not found' })
  }

  await saveBuildings(filtered)

  // Remove buildingId reference or delete rooms linked to building
  const rooms = await getRooms()
  const updatedRooms = rooms.map(room => {
    if (room.buildingId === id) {
      return { ...room, buildingId: '', updatedAt: new Date().toISOString() }
    }
    return room
  })
  await saveRooms(updatedRooms)

  return { success: true }
})
