"use client"

import React, { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  AlertTriangle,
  NavigationIcon,
  Phone,
  MessageCircle,
  Activity,
  Users,
  Heart,
  Flame,
  Wrench,
  ShieldCheck,
  Timer,
  Route,
} from "lucide-react"
import { AIChatbot } from "@/components/ai-chatbot"
import { Navigation } from "@/components/navigation"

const mockIncidents = {
  medical: [
    {
      id: "MED-001",
      type: "Medical Emergency",
      severity: "high",
      status: "active",
      location: "Main Stage - Section A",
      zone: "main-stage",
      description: "Person collapsed, unconscious",
      reportedBy: "Security Team",
      timeReported: "11:23 AM",
      estimatedTime: "3 min",
      distance: "0.2 km",
      assignedTo: null,
    },
    {
      id: "MED-002",
      type: "Minor Injury",
      severity: "medium",
      status: "claimed",
      location: "Food Court - Vendor 3",
      zone: "food-court",
      description: "Cut on hand from broken glass",
      reportedBy: "Vendor Staff",
      timeReported: "11:15 AM",
      estimatedTime: "5 min",
      distance: "0.4 km",
      assignedTo: "Dr. Sarah Johnson",
    },
  ],
  security: [
    {
      id: "SEC-001",
      type: "Crowd Control",
      severity: "high",
      status: "active",
      location: "Entrance Gate B",
      zone: "entrance-b",
      description: "Large crowd gathering, potential bottleneck",
      reportedBy: "AI System",
      timeReported: "11:20 AM",
      estimatedTime: "2 min",
      distance: "0.1 km",
      assignedTo: null,
    },
    {
      id: "SEC-002",
      type: "Suspicious Activity",
      severity: "medium",
      status: "investigating",
      location: "Parking Lot C",
      zone: "parking-c",
      description: "Unattended bag reported",
      reportedBy: "Event Attendee",
      timeReported: "11:10 AM",
      estimatedTime: "8 min",
      distance: "0.6 km",
      assignedTo: "Officer Mike Chen",
    },
  ],
  fire: [
    {
      id: "FIRE-001",
      type: "Fire Hazard",
      severity: "high",
      status: "active",
      location: "Backstage Area",
      zone: "backstage",
      description: "Electrical equipment overheating",
      reportedBy: "Stage Crew",
      timeReported: "11:25 AM",
      estimatedTime: "4 min",
      distance: "0.3 km",
      assignedTo: null,
    },
  ],
  technical: [
    {
      id: "TECH-001",
      type: "System Failure",
      severity: "medium",
      status: "active",
      location: "Control Room",
      zone: "control-room",
      description: "CCTV Camera 7 offline",
      reportedBy: "System Monitor",
      timeReported: "11:18 AM",
      estimatedTime: "6 min",
      distance: "0.5 km",
      assignedTo: null,
    },
  ],
}

const responderTypes = {
  medical: { name: "Medical Responder", icon: Heart, color: "text-red-500" },
  security: { name: "Security Responder", icon: ShieldCheck, color: "text-blue-500" },
  fire: { name: "Fire Responder", icon: Flame, color: "text-orange-500" },
  technical: { name: "Technical Responder", icon: Wrench, color: "text-purple-500" },
}

export default function ResponderDashboard() {
  const searchParams = useSearchParams()
  const responderType = (searchParams.get("type") as keyof typeof mockIncidents) || "medical"
  const [selectedIncident, setSelectedIncident] = useState<string | null>(null)
  const [responderStatus, setResponderStatus] = useState("available")
  const [currentLocation, setCurrentLocation] = useState("Base Station")
  const [updateForm, setUpdateForm] = useState({
    status: "",
    notes: "",
    evidence: null as File | null,
  })

  const incidents = mockIncidents[responderType] || []
  const ResponderIcon = responderTypes[responderType]?.icon || Activity
  const responderColor = responderTypes[responderType]?.color || "text-primary"

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-destructive"
      case "claimed":
        return "text-warning"
      case "investigating":
        return "text-primary"
      case "resolved":
        return "text-success"
      default:
        return "text-muted-foreground"
    }
  }

  const handleClaimIncident = (incidentId: string) => {
    setSelectedIncident(incidentId)
    setResponderStatus("responding")
  }

  const handleUpdateIncident = () => {
    // Mock update - in real app, send to backend
    console.log("Updating incident:", selectedIncident, updateForm)
    setUpdateForm({ status: "", notes: "", evidence: null })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Component */}
      <Navigation
        userRole="responder"
        userName="Dr. Sarah Johnson"
        eventName="Summer Music Festival 2025"
        unreadAlerts={5}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Incident Queue */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Active Incidents</span>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <ResponderIcon className={`h-3 w-3 ${responderColor}`} />
                      <span>{responderTypes[responderType]?.name}</span>
                    </Badge>
                  </div>
                  <Badge variant="outline">{incidents.length} incidents</Badge>
                </CardTitle>
                <CardDescription>Priority incidents in your assigned zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {incidents.map((incident) => (
                    <Card
                      key={incident.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedIncident === incident.id ? "ring-2 ring-primary" : ""
                      } ${incident.severity === "high" ? "border-destructive/50" : ""}`}
                      onClick={() => setSelectedIncident(incident.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Badge variant={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                            <Badge variant="outline">{incident.id}</Badge>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">{incident.timeReported}</p>
                            <p className="text-xs text-muted-foreground">
                              {incident.estimatedTime} • {incident.distance}
                            </p>
                          </div>
                        </div>
                        <h3 className="font-semibold mb-1">{incident.type}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{incident.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{incident.location}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{incident.reportedBy}</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {incident.status === "active" && !incident.assignedTo && (
                              <Button size="sm" onClick={() => handleClaimIncident(incident.id)}>
                                Claim
                              </Button>
                            )}
                            {incident.assignedTo && (
                              <Badge className={getStatusColor(incident.status)}>{incident.status}</Badge>
                            )}
                            <Button variant="outline" size="sm">
                              <NavigationIcon className="h-3 w-3 mr-1" />
                              Navigate
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Incident Details */}
            {selectedIncident && (
              <Card>
                <CardHeader>
                  <CardTitle>Incident Details - {selectedIncident}</CardTitle>
                  <CardDescription>Manage and update incident status</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="details" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="update">Update</TabsTrigger>
                      <TabsTrigger value="communication">Communication</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      {(() => {
                        const incident = incidents.find((i) => i.id === selectedIncident)
                        if (!incident) return null
                        return (
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Type</Label>
                                <p className="text-sm">{incident.type}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Location</Label>
                                <p className="text-sm">{incident.location}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Reported By</Label>
                                <p className="text-sm">{incident.reportedBy}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Time Reported</Label>
                                <p className="text-sm">{incident.timeReported}</p>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label className="text-sm font-medium">Severity</Label>
                                <Badge variant={getSeverityColor(incident.severity)} className="ml-2">
                                  {incident.severity}
                                </Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Status</Label>
                                <Badge className={`ml-2 ${getStatusColor(incident.status)}`}>{incident.status}</Badge>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">Assigned To</Label>
                                <p className="text-sm">{incident.assignedTo || "Unassigned"}</p>
                              </div>
                              <div>
                                <Label className="text-sm font-medium">ETA</Label>
                                <p className="text-sm">{incident.estimatedTime}</p>
                              </div>
                            </div>
                            <div className="md:col-span-2">
                              <Label className="text-sm font-medium">Description</Label>
                              <p className="text-sm mt-1">{incident.description}</p>
                            </div>
                          </div>
                        )
                      })()}
                    </TabsContent>

                    <TabsContent value="update" className="space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="status">Update Status</Label>
                          <Select
                            value={updateForm.status}
                            onValueChange={(value) => setUpdateForm({ ...updateForm, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select new status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="investigating">Investigating</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="escalated">Escalated</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Progress Notes</Label>
                          <Textarea
                            id="notes"
                            placeholder="Describe actions taken, current situation, next steps..."
                            value={updateForm.notes}
                            onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="evidence">Upload Evidence</Label>
                          <Input
                            id="evidence"
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => setUpdateForm({ ...updateForm, evidence: e.target.files?.[0] || null })}
                          />
                        </div>
                        <Button onClick={handleUpdateIncident} className="w-full">
                          Submit Update
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="communication" className="space-y-4">
                      <div className="space-y-4">
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Communication Log</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>11:25 AM - Incident claimed by responder</span>
                              <Badge variant="outline">System</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>11:23 AM - Initial report received</span>
                              <Badge variant="outline">Reporter</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Dispatch
                          </Button>
                          <Button variant="outline" className="flex-1 bg-transparent">
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Radio Team
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report New Incident
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Route className="h-4 w-4 mr-2" />
                  Request Backup
                </Button>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <Timer className="h-4 w-4 mr-2" />
                  Break Request
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => window.open('tel:9886744362', '_self')}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contact Dispatch
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* AI Chatbot */}
      <AIChatbot context="responder" />
    </div>
  )
}
