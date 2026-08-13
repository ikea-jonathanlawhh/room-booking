import { defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  const buildings = await getBuildings()
  const rooms = await getRooms()

  // Attach room count to each building
  const buildingsWithCounts = buildings.map(bld => {
    const roomCount = rooms.filter(r => r.buildingId === bld.id).length
    return {
      ...bld,
      roomCount
    }
  })

  return {
    value: buildingsWithCounts
  }
})
