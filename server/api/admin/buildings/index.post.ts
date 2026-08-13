import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body || !body.name || typeof body.name !== 'string' || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Building name is required'
    })
  }

  const buildings = await getBuildings()
  
  // Check for duplicate name
  const existing = buildings.find(b => b.name.toLowerCase() === body.name.trim().toLowerCase())
  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Building with this name already exists'
    })
  }

  const newBuilding: Building = {
    id: `bld_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: body.name.trim(),
    description: body.description?.trim() || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  buildings.push(newBuilding)
  await saveBuildings(buildings)

  return {
    value: newBuilding
  }
})
