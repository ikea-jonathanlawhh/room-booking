import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiUrl = config.meetingRoomApiUrl || process.env.MEETING_ROOM_API_URL

  if (!apiUrl || !apiUrl.startsWith('http')) {
    throw createError({
      statusCode: 500,
      statusMessage: 'MEETING_ROOM_API_URL environment variable is not defined or invalid (must start with http:// or https://)'
    })
  }

  const startTime = Date.now()
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(20000)
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Remote API error: ${response.statusText}`
      })
    }

    const data = await response.json()
    if (!data || typeof data !== 'object' || !Array.isArray(data.value)) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Invalid response format received from dynamic API endpoint'
      })
    }

    // Only return what is needed
    const filteredRooms = data.value.map((room: any) => ({
      scheduleId: room.scheduleId || '',
      workingHours: room.workingHours ? {
        startTime: room.workingHours.startTime,
        endTime: room.workingHours.endTime
      } : undefined,
      scheduleItems: Array.isArray(room.scheduleItems)
        ? room.scheduleItems.map((item: any) => ({
          subject: item.subject,
          location: item.location,
          start: item.start ? {
            dateTime: item.start.dateTime,
            timeZone: item.start.timeZone
          } : undefined,
          end: item.end ? {
            dateTime: item.end.dateTime,
            timeZone: item.end.timeZone
          } : undefined
        }))
        : []
    }))

    return { 
      value: filteredRooms,
      serverTime: Date.now()
    }
  } catch (err: any) {
    const elapsed = Date.now() - startTime
    console.error(`[API] Live fetch failed after ${elapsed}ms: ${err.message}`)
    throw createError({
      statusCode: err.statusCode || 500,
      statusMessage: `Failed to fetch meeting rooms: ${err.message}`
    })
  }
})
