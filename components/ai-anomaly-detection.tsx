"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, AlertTriangle, Brain, Camera, MapPin, Clock, X, Play, Pause } from "lucide-react"

interface AnomalyDetection {
  id: string
  type: "crowd_behavior" | "abandoned_object" | "violence" | "unusual_movement" | "gathering"
  confidence: number
  location: string
  cameraId: string
  timestamp: Date
  description: string
  status: "active" | "investigating" | "resolved" | "false_positive"
  imageUrl?: string
}

interface AIAnomalyDetectionProps {
  context?: "user" | "responder" | "admin"
}

export function AIAnomalyDetection({ context = "user" }: AIAnomalyDetectionProps) {
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [isProcessing, setIsProcessing] = useState(true)
  const [selectedAnomaly, setSelectedAnomaly] = useState<AnomalyDetection | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  useEffect(() => {
    // Simulate AI processing
    const interval = setInterval(() => {
      const newAnomaly = generateMockAnomaly()
      if (newAnomaly && Math.random() > 0.7) {
        // 30% chance of new anomaly every 10 seconds
        setAnomalies((prev) => [newAnomaly, ...prev.slice(0, 4)]) // Keep last 5 anomalies
      }
    }, 10000)

    // Initial load
    setTimeout(() => {
      setAnomalies([generateMockAnomaly(), generateMockAnomaly()].filter(Boolean) as AnomalyDetection[])
      setIsProcessing(false)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const generateMockAnomaly = (): AnomalyDetection | null => {
    const anomalyTypes = [
      {
        type: "crowd_behavior" as const,
        description: "Unusual crowd movement pattern detected",
        confidence: 85 + Math.random() * 10,
        cameraId: "CAM-1", // Force cam1 for crowd behavior
      },
      {
        type: "abandoned_object" as const,
        description: "Unattended bag detected for over 10 minutes",
        confidence: 92 + Math.random() * 5,
        cameraId: "CAM-2", // Force cam2 for abandoned objects
      },
      {
        type: "unusual_movement" as const,
        description: "Person moving against crowd flow",
        confidence: 78 + Math.random() * 15,
        cameraId: "CAM-1",
      },
      {
        type: "gathering" as const,
        description: "Large group forming outside designated area",
        confidence: 88 + Math.random() * 8,
        cameraId: "CAM-2",
      },
    ]

    const locations = ["Main Stage", "Food Court", "Entrance A", "VIP Area", "Parking Lot", "Backstage"]
    const randomType = anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)]
    const randomLocation = locations[Math.floor(Math.random() * locations.length)]

    return {
      id: Date.now().toString(),
      ...randomType,
      location: randomLocation,
      timestamp: new Date(),
      status: "active",
      imageUrl: "/placeholder.svg?height=100&width=150&text=CCTV+Frame",
    }
  }

  const getAnomalyColor = (type: string) => {
    switch (type) {
      case "violence":
        return "text-destructive"
      case "abandoned_object":
        return "text-warning"
      case "crowd_behavior":
        return "text-primary"
      case "unusual_movement":
        return "text-accent"
      case "gathering":
        return "text-success"
      default:
        return "text-muted-foreground"
    }
  }

  const getAnomalyBadge = (type: string) => {
    switch (type) {
      case "violence":
        return "destructive"
      case "abandoned_object":
        return "secondary"
      case "crowd_behavior":
        return "outline"
      case "unusual_movement":
        return "outline"
      case "gathering":
        return "outline"
      default:
        return "outline"
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-destructive"
    if (confidence >= 80) return "text-warning"
    if (confidence >= 70) return "text-primary"
    return "text-muted-foreground"
  }

  const formatAnomalyType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getVideoSource = (cameraId: string) => {
    // Map camera IDs to video files
    if (cameraId.includes("1") || cameraId.includes("CAM-1")) {
      return "/videos/cam1.mp4"
    } else if (cameraId.includes("2") || cameraId.includes("CAM-2")) {
      return "/videos/cam2.mp4"
    }
    // Default to cam1 for other cameras
    return "/videos/cam1.mp4"
  }

  const handleViewAnomaly = (anomaly: AnomalyDetection) => {
    setSelectedAnomaly(anomaly)
    setIsVideoPlaying(true)
  }

  const closeVideoModal = () => {
    setSelectedAnomaly(null)
    setIsVideoPlaying(false)
  }

  if (isProcessing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Anomaly Detection</span>
          </CardTitle>
          <CardDescription>Computer vision analysis of crowd behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing CCTV feeds...</p>
            <Badge variant="outline" className="mt-2">
              AI Analysis Active
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-primary" />
            <span>AI Anomaly Detection</span>
          </div>
          <Badge variant="outline" className="bg-success/10 text-success border-success/20">
            Active
          </Badge>
        </CardTitle>
        <CardDescription>Real-time computer vision analysis across all cameras</CardDescription>
      </CardHeader>
      <CardContent>
        {anomalies.length === 0 ? (
          <div className="text-center py-6">
            <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No anomalies detected</p>
            <p className="text-sm text-muted-foreground mt-1">AI monitoring 24 cameras continuously</p>
          </div>
        ) : (
          <div className="space-y-4">
            {anomalies.map((anomaly) => (
              <Alert key={anomaly.id} className="border-l-4 border-l-warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant={getAnomalyBadge(anomaly.type)}>{formatAnomalyType(anomaly.type)}</Badge>
                        <Badge variant="outline" className={getConfidenceColor(anomaly.confidence)}>
                          {Math.round(anomaly.confidence)}% confidence
                        </Badge>
                      </div>
                      <p className="font-medium mb-1">{anomaly.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{anomaly.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Camera className="h-3 w-3" />
                          <span>{anomaly.cameraId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{anomaly.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {anomaly.imageUrl && (
                        <img
                          src={anomaly.imageUrl || "/placeholder.svg"}
                          alt="CCTV Frame"
                          className="w-20 h-12 rounded border object-cover"
                        />
                      )}
                      <div className="flex flex-col space-y-1">
                        <Button size="sm" variant="outline" onClick={() => handleViewAnomaly(anomaly)}>
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {context === "admin" && (
                          <Button size="sm" variant="outline">
                            Dispatch
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">24</div>
              <div className="text-xs text-muted-foreground">Cameras Monitored</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">87%</div>
              <div className="text-xs text-muted-foreground">Detection Accuracy</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">1.2s</div>
              <div className="text-xs text-muted-foreground">Avg Processing Time</div>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Video Modal */}
      {selectedAnomaly && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">{selectedAnomaly.description}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedAnomaly.cameraId} • {selectedAnomaly.location} • {selectedAnomaly.timestamp.toLocaleTimeString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={closeVideoModal}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  src={getVideoSource(selectedAnomaly.cameraId)}
                  controls
                  autoPlay={isVideoPlaying}
                  className="w-full h-auto max-h-[60vh]"
                  onPlay={() => setIsVideoPlaying(true)}
                  onPause={() => setIsVideoPlaying(false)}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-4 left-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                  {selectedAnomaly.cameraId} - Live Feed
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant={getAnomalyBadge(selectedAnomaly.type)}>
                    {formatAnomalyType(selectedAnomaly.type)}
                  </Badge>
                  <Badge variant="outline" className={getConfidenceColor(selectedAnomaly.confidence)}>
                    {Math.round(selectedAnomaly.confidence)}% confidence
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
                    {isVideoPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
                    {isVideoPlaying ? "Pause" : "Play"}
                  </Button>
                  {context === "admin" && (
                    <Button size="sm">
                      Dispatch Response Team
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
