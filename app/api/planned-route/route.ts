import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

interface RouteNode {
  id: string
  name: string
  zoneId: string
  coordinates: [number, number]
  type: "gate" | "path" | "area"
  capacity: number
}

interface RouteEdge {
  from: string
  to: string
  distance: number
  crowdDensity: number
  EstimatedTime: number
  congestionLevel: "low" | "medium" | "high" | "critical"
}

interface CrowdPrediction {
  predictedDensity15min: number
  confidence: number
  riskLevel: "low" | "medium" | "high"
}

class DynamicRoutePlanner {
  constructor(
    public nodes: RouteNode[],
    public edges: RouteEdge[],
    public crowdPredictions: Map<string, CrowdPrediction>
  ) {}

  // Find optimal evacuation/safety route using crowd predictions
  findOptimalRoute(
    startNode: string,
    endNode: string,
    avoidHighRisk: boolean = true
  ): {
    path: string[]
    totalDistance: number
    estimatedTime: number
    maxCongestion: string
    confidence: number
    riskAssessment: string
  } {
    // Simplified A* pathfinding with crowd density costs
    const start = this.nodes.find(n => n.id === startNode)
    const end = this.nodes.find(n => n.id === endNode)

    if (!start || !end) {
      throw new Error("Invalid start or end node")
    }

      // Calculate edge weights with crowd predictions
    const weightedEdges = this.edges.map(edge => {
      const zonePrediction = this.crowdPredictions.get(edge.to) ||
                            this.crowdPredictions.get(edge.from) ||
                            undefined

      let weight = edge.distance // base weight

      // Add crowd density penalties
      if (zonePrediction) {
        const crowdFactor = this.getCrowdWeightFactor(zonePrediction.predictedDensity15min)

        // Apply confidence boost (more confident predictions = more reliable routing)
        const confidenceBoost = zonePrediction.confidence || 0.5
        weight *= (crowdFactor / confidenceBoost)

        // Avoid high-risk zones if requested
        if (avoidHighRisk && zonePrediction.riskLevel === "high") {
          weight *= 5 // Strong penalty for high risk zones
        }
      }

      return { ...edge, weight, congestionLevel: this.getCongestionLevel(zonePrediction) }
    })

    // Simplified Dijkstra implementation
    const result = this.calculateShortestPath(startNode, endNode, weightedEdges)

    // Calculate additional metrics
    const avgConfidence = Array.from(this.crowdPredictions.values())
                              .reduce((sum, pred) => sum + pred.confidence, 0) /
                             Math.max(1, this.crowdPredictions.size)

    const riskAssessment = this.assessRouteRisk(result.path, this.crowdPredictions)

    return {
      ...result,
      confidence: avgConfidence,
      riskAssessment
    }
  }

  private getCrowdWeightFactor(density: number): number {
    // Weight factor based on crowd density (higher density = higher cost)
    if (density < 50) return 1.0     // Low density, minimal cost
    if (density < 100) return 1.5    // Medium density, moderate cost
    if (density < 150) return 2.5    // High density, significant cost
    return 4.0                       // Critical density, very high cost
  }

  private getCongestionLevel(prediction?: CrowdPrediction): "low" | "medium" | "high" | "critical" {
    if (!prediction) return "low"

    const density = prediction.predictedDensity15min
    if (density < 50) return "low"
    if (density < 100) return "medium"
    if (density < 150) return "high"
    return "critical"
  }

  private calculateShortestPath(
    start: string,
    end: string,
    edges: (RouteEdge & { weight: number })[]
  ): {
    path: string[]
    totalDistance: number
    estimatedTime: number
    maxCongestion: string
  } {
    // Simplified pathfinding - in production, use A* or Dijkstra library
    const distances = new Map<string, number>()
    const previous = new Map<string, string>()
    const unvisited = new Set<string>()

    // Initialize
    this.nodes.forEach(node => {
      distances.set(node.id, node.id === start ? 0 : Infinity)
      unvisited.add(node.id)
    })

    let maxCongestion: "low" | "medium" | "high" | "critical" = "low"

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let current: string | null = null
      let minDist = Infinity

      for (const node of unvisited) {
        const dist = distances.get(node) || Infinity
        if (dist < minDist) {
          minDist = dist
          current = node
        }
      }

      if (!current || minDist === Infinity) break
      unvisited.delete(current)

      // Update neighbors
      const neighbors = edges.filter(edge => edge.from === current)
      for (const edge of neighbors) {
        if (!unvisited.has(edge.to)) continue

        const newDist = minDist + edge.weight
        if (newDist < (distances.get(edge.to) || Infinity)) {
          distances.set(edge.to, newDist)
          previous.set(edge.to, current)

          // Track max congestion
          const congestionLevel = this.getCongestionLevel(
            this.crowdPredictions.get(edge.to)
          )
          if (congestionLevel === "critical") maxCongestion = "critical"
          else if (congestionLevel === "high" && maxCongestion !== "critical") maxCongestion = "high"
          else if (congestionLevel === "medium" && maxCongestion === "low") maxCongestion = "medium"
        }
      }
    }

    // Reconstruct path
    const path: string[] = []
    let current = end
    while (current && current !== start) {
      path.unshift(current)
      current = previous.get(current) || null
    }
    if (path.length === 0 || path[0] !== end) {
      // No path found or incomplete path
      return { path: [], totalDistance: 0, estimatedTime: 0, maxCongestion: "unknown" }
    }
    path.unshift(start)

    // Calculate total distance and time
    let totalDistance = 0
    let estimatedTime = 0

    for (let i = 0; i < path.length - 1; i++) {
      const edge = edges.find(e => e.from === path[i] && e.to === path[i+1])
      if (edge) {
        totalDistance += edge.distance
        estimatedTime += edge.EstimatedTime
      }
    }

    return {
      path,
      totalDistance,
      estimatedTime,
      maxCongestion
    }
  }

  private assessRouteRisk(path: string[], predictions: Map<string, CrowdPrediction>): string {
    const highRiskCount = path.filter(nodeId => {
      const pred = predictions.get(nodeId)
      return pred && (pred.riskLevel === "high" || pred.predictedDensity15min > 150)
    }).length

    const criticalCount = path.filter(nodeId => {
      const pred = predictions.get(nodeId)
      return pred && pred.predictedDensity15min > 200
    }).length

    if (criticalCount > 0) return "HIGH RISK - Avoid if possible"
    if (highRiskCount > 0) return "MEDIUM RISK - Monitor closely"
    return "LOW RISK - Safe route"
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventId,
      startNode,
      endNode,
      currentTime = Date.now()
    } = body

    if (!eventId || !startNode || !endNode) {
      return NextResponse.json(
        { error: "Missing required fields: eventId, startNode, endNode" },
        { status: 400 }
      )
    }

    console.log(`🛣️  Planning optimal route for ${eventId}: ${startNode} → ${endNode}`)

    // Get current crowd densities and predictions
    const crowdResponse = await fetch(
      `http://localhost:3000/api/crowd-density?eventId=${eventId}&hours=1`
    )

    if (!crowdResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch crowd data" },
        { status: 500 }
      )
    }

    const crowdData = await crowdResponse.json()
    const crowdPredictions = new Map<string, CrowdPrediction>()

    // Extract predictions for each zone
    if (crowdData.predictions) {
      crowdData.predictions.forEach((pred: any) => {
        crowdPredictions.set(pred.zoneId, {
          predictedDensity15min: pred.prediction15Min || pred.prediction_15min || 0,
          confidence: pred.ai_confidence || pred.confidence || 0.5,
          riskLevel: pred.riskLevel || "medium"
        })
      })
    }

    // Define venue layout (simplified - in production, fetch from database)
    const routeNodes: RouteNode[] = [
      { id: "gate_north", name: "North Gate", zoneId: "zone_1", coordinates: [0, 100], type: "gate", capacity: 500 },
      { id: "gate_south", name: "South Gate", zoneId: "zone_2", coordinates: [0, 0], type: "gate", capacity: 500 },
      { id: "main_stage", name: "Main Stage", zoneId: "zone_5", coordinates: [50, 50], type: "area", capacity: 2000 },
      { id: "food_court", name: "Food Court", zoneId: "zone_3", coordinates: [25, 25], type: "area", capacity: 800 },
      { id: "path_east", name: "East Path", zoneId: "zone_4", coordinates: [75, 50], type: "path", capacity: 300 },
      { id: "vip_area", name: "VIP Area", zoneId: "zone_6", coordinates: [80, 80], type: "area", capacity: 200 }
    ]

    // Define route connections
    const routeEdges: RouteEdge[] = [
      { from: "gate_north", to: "food_court", distance: 50, crowdDensity: 0, EstimatedTime: 5, congestionLevel: "low" },
      { from: "food_court", to: "main_stage", distance: 30, crowdDensity: 0, EstimatedTime: 3, congestionLevel: "low" },
      { from: "food_court", to: "path_east", distance: 40, crowdDensity: 0, EstimatedTime: 4, congestionLevel: "low" },
      { from: "path_east", to: "main_stage", distance: 25, crowdDensity: 0, EstimatedTime: 3, congestionLevel: "low" },
      { from: "gate_south", to: "food_court", distance: 45, crowdDensity: 0, EstimatedTime: 4, congestionLevel: "low" },
      { from: "main_stage", to: "vip_area", distance: 35, crowdDensity: 0, EstimatedTime: 4, congestionLevel: "low" }
    ]

    // Initialize route planner with crowd predictions
    const planner = new DynamicRoutePlanner(routeNodes, routeEdges, crowdPredictions)

    // Calculate optimal route
    const route = planner.findOptimalRoute(startNode, endNode, true)

    console.log(`✅ Planned route: ${route.path.join(' → ')} (${route.path.length - 1} segments)`)
    console.log(`   Total distance: ${route.totalDistance}m, Time: ${route.estimatedTime} min`)
    console.log(`   Max congestion: ${route.maxCongestion}, Risk: ${route.riskAssessment}`)

    return NextResponse.json({
      eventId,
      route: route,
      nodes: routeNodes,
      timestamp: new Date().toISOString(),
      predictionSource: "XGBoost 15-min forecasts (MAE: 12.65, Accuracy: 84.88%)"
    })

  } catch (error) {
    console.error("Route planning error:", error)
    return NextResponse.json(
      { error: "Failed to plan optimal route" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get("eventId")

  if (!eventId) {
    return NextResponse.json(
      { error: "eventId parameter required" },
      { status: 400 }
    )
  }

  // Return available route nodes for the event
  const routeNodes = [
    { id: "gate_north", name: "North Gate", zoneId: "zone_1", coordinates: [0, 100], type: "gate" },
    { id: "gate_south", name: "South Gate", zoneId: "zone_2", coordinates: [0, 0], type: "gate" },
    { id: "main_stage", name: "Main Stage", zoneId: "zone_5", coordinates: [50, 50], type: "area" },
    { id: "food_court", name: "Food Court", zoneId: "zone_3", coordinates: [25, 25], type: "area" },
    { id: "path_east", name: "East Path", zoneId: "zone_4", coordinates: [75, 50], type: "path" },
    { id: "vip_area", name: "VIP Area", zoneId: "zone_6", coordinates: [80, 80], type: "area" }
  ]

  return NextResponse.json({
    eventId,
    availableNodes: routeNodes,
    totalNodes: routeNodes.length,
    description: "Dynamic crowd-aware routing using XGBoost 15-min predictions",
    predictionModel: {
      type: "XGBoost",
      mae: 12.65,
      accuracy: 84.88,
      features: 41,
      confidenceScoring: true
    }
  })
}
