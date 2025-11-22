import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get("eventId")
    const zoneId = searchParams.get("zoneId")
    const hours = Number.parseInt(searchParams.get("hours") || "24")

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    const densityData = await DatabaseService.getCrowdDensityHistory(eventId, zoneId || undefined, hours)
    const eventData = await DatabaseService.getEventById(eventId)
    const activeAnomalies = await DatabaseService.getAnomalyDetections(eventId, "active")

    // Generate 15-minute predictions
    const predictions = await generatePredictions(eventId, densityData, activeAnomalies, eventData || undefined)

    return NextResponse.json({
      densityData,
      predictions,
      eventInfo: eventData ? {
        id: eventData.id,
        name: eventData.name,
        startDate: eventData.start_date,
        capacity: eventData.capacity
      } : null,
      emergencyMode: activeAnomalies.some(a => a.detection_type === "violence" || a.detection_type === "unusual_movement")
    })
  } catch (error) {
    console.error("Error fetching crowd density:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST endpoint for triggering crowd density calculations with external API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, apiKey, zoneOverrides } = body // zoneOverrides can specify specific density values for testing

    if (!eventId) {
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    // In real implementation, validate apiKey here
    if (!apiKey || apiKey !== "valid-density-api-key") {
      return NextResponse.json({ error: "Invalid API key for density calculations" }, { status: 401 })
    }

    const eventData = await DatabaseService.getEventById(eventId)
    const eventZones = await DatabaseService.getEventZones(eventId)

    if (!eventData) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Here you would call the external crowd density API
    // For now, simulate with mock data influenced by zoneOverrides
    const densityCalculations: { [zoneId: string]: { density: number, cctvCount: number, cctvIds: string[] } } = {}

    for (const zone of eventZones) {
      const overrideValue = zoneOverrides?.[zone.id]
      const density = overrideValue !== undefined ? overrideValue : Math.floor(Math.random() * 100)

      // Simulate multiple CCTVs per zone
      const cctvCount = Math.floor(Math.random() * 3) + 2 // 2-4 CCTVs per zone
      const cctvs: { id: string; detectedDensity: number }[] = []

      for (let i = 0; i < cctvCount; i++) {
        const cctvDensity = Math.max(0, density + (Math.random() * 20 - 10)) // ±10 variation
        cctvs.push({
          id: `${zone.id}-cam${i + 1}`,
          detectedDensity: cctvDensity
        })
      }

      densityCalculations[zone.id] = {
        density: cctvs.reduce((sum, cctv) => sum + cctv.detectedDensity, 0) / cctvCount,
        cctvCount,
        cctvIds: cctvs.map(c => c.id)
      }
    }

    // Store the calculated densities in database
    const timestamp = new Date().toISOString()
    const densityRecords = eventZones.map(zone => ({
      event_id: eventId,
      zone_id: zone.id,
      timestamp,
      current_count: Math.floor(densityCalculations[zone.id].density * zone.capacity / 100), // convert % to count
      density_percentage: densityCalculations[zone.id].density,
      prediction_15min: null, // will be calculated separately
      prediction_30min: null,
      ai_confidence: 0.9
    }))

    // In real implementation, insert into database here
    // For now, just return the calculations

    return NextResponse.json({
      success: true,
      message: "Crowd density calculated and stored",
      calculations: densityCalculations,
      densityRecords,
      timestamp,
      apiUsed: "external-density-api"
    })
  } catch (error) {
    console.error("Error calculating crowd density:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
