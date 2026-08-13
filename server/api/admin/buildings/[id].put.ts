import { defineEventHandler, readBody, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Building ID is required' })
  }

  const body = await readBody(event)
  if (!body || !body.name || typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Building name is required' })
  }

  const buildings = await getBuildings()
  const index = buildings.findIndex(b => b.id === id)

  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Building not found' })
  }

  // Check duplicate name excluding self
  const duplicate = buildings.find(b => b.id !== id && b.name.toLowerCase() === body.name.trim().toLowerCase())
  if (duplicate) {
    throw createError({ statusCode: 409, statusMessage: 'Another building with this name already exists' })
  }

  buildings[index] = {
    ...buildings[index],
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    updatedAt: new Date().toISOString()
  }

  await saveBuildings(buildings)

  return {
    value: buildings[index]
  }
})
