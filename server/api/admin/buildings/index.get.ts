import { defineEventHandler } from 'h3'
import { db, schema } from 'hub:db'
import { eq, sql } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const buildingsWithCounts = await db
    .select({
      id: schema.buildings.id,
      name: schema.buildings.name,
      description: schema.buildings.description,
      createdTimestamp: schema.buildings.createdTimestamp,
      createdBy: schema.buildings.createdBy,
      updateTimestamp: schema.buildings.updateTimestamp,
      updatedBy: schema.buildings.updatedBy,
      roomCount: sql<number>`cast(count(${schema.rooms.id}) as signed)`
    })
    .from(schema.buildings)
    .leftJoin(schema.rooms, eq(schema.buildings.id, schema.rooms.buildingId))
    .groupBy(schema.buildings.id)

  return {
    value: buildingsWithCounts
  }
})
