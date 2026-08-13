import { defineEventHandler, getQuery } from 'h3'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const buildingId = query.buildingId as string | undefined

  let rooms = await getRooms()
  const buildings = await getBuildings()

  if (buildingId) {
    rooms = rooms.filter(r => r.buildingId === buildingId)
  }

  // Attach building name
  const roomsWithBuilding = rooms.map(room => {
    const building = buildings.find(b => b.id === room.buildingId)
    return {
      ...room,
      buildingName: building ? building.name : 'Unassigned'
    }
  })

  return {
    value: roomsWithBuilding
  }
})
