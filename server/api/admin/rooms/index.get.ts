import { defineEventHandler, getQuery } from 'h3'
import { db, schema } from 'hub:db'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const buildingId = query.buildingId as string | undefined

  const conditions = []
  if (buildingId) {
    conditions.push(eq(schema.rooms.buildingId, buildingId))
  }

  const dbQuery = db
    .select({
      id: schema.rooms.id,
      buildingId: schema.rooms.buildingId,
      name: schema.rooms.name,
      email: schema.rooms.email,
      description: schema.rooms.description,
      createdTimestamp: schema.rooms.createdTimestamp,
      createdBy: schema.rooms.createdBy,
      updateTimestamp: schema.rooms.updateTimestamp,
      updatedBy: schema.rooms.updatedBy,
      buildingName: schema.buildings.name
    })
    .from(schema.rooms)
    .leftJoin(schema.buildings, eq(schema.rooms.buildingId, schema.buildings.id))

  const roomsList = await (conditions.length > 0 
    ? dbQuery.where(and(...conditions))
    : dbQuery)

  const formattedRooms = roomsList.map(room => ({
    ...room,
    buildingName: room.buildingName || 'Unassigned'
  }))

  return {
    value: formattedRooms
  }
})
