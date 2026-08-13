export interface Building {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Room {
  id: string
  buildingId: string
  name: string
  email: string
  description?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY_BUILDINGS = 'data:buildings.json'
const STORAGE_KEY_ROOMS = 'data:rooms.json'

export async function getBuildings(): Promise<Building[]> {
  const storage = useStorage()
  let buildings = await storage.getItem<Building[]>(STORAGE_KEY_BUILDINGS)
  if (!buildings) {
    buildings = []
    await storage.setItem(STORAGE_KEY_BUILDINGS, buildings)
  }
  return buildings
}

export async function saveBuildings(buildings: Building[]): Promise<void> {
  const storage = useStorage()
  await storage.setItem(STORAGE_KEY_BUILDINGS, buildings)
}

export async function getRooms(): Promise<Room[]> {
  const storage = useStorage()
  let rooms = await storage.getItem<Room[]>(STORAGE_KEY_ROOMS)
  if (!rooms) {
    rooms = []
    await storage.setItem(STORAGE_KEY_ROOMS, rooms)
  }
  return rooms
}

export async function saveRooms(rooms: Room[]): Promise<void> {
  const storage = useStorage()
  await storage.setItem(STORAGE_KEY_ROOMS, rooms)
}
