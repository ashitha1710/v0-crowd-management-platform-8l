"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Shield,
  Heart,
  Wrench,
  Flame,
} from "lucide-react"
import Link from "next/link"
import { Navigation } from "@/components/navigation"

const backupTypes = [
  {
    value: "security",
    label: "Security Personnel",
    icon: Shield,
    description: "Additional security officers for crowd control"
  },
  {
    value: "medical",
    label: "Medical Team",
    icon: Heart,
    description: "Paramedics and medical support personnel"
  },
  {
    value: "technical",
    label: "Technical Support",
    icon: Wrench,
    description: "Technicians for equipment and system issues"
  },
  {
    value: "fire",
    label: "Fire Safety Team",
    icon: Flame,
    description: "Firefighters and fire safety specialists"
  },
]

const urgencyLevels = [
  { value: "low", label: "Low - Can wait", color: "text-blue-600" },
  { value: "medium", label: "Medium - Soon as possible", color: "text-orange-600" },
  { value: "high", label: "High - Needed urgently", color: "text-red-600" },
  { value: "critical", label: "Critical - Emergency situation", color: "text-red-800" },
]

export default function RequestBackupPage() {
  const [formData, setFormData] = useState({
    backupType: "",
    location: "",
    urgency: "",
    reason: "",
    additionalNeeds: "",
    requesterName: "",
    requesterContact: "",
    estimatedDuration: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [requestId, setRequestId] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTypeSelect = (typeValue: string) => {
    setSelectedType(typeValue)
    setFormData(prev => ({ ...prev, backupType: typeValue }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation
    if (!formData.backupType || !formData.location || !formData.urgency || !formData.reason) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    // Mock submission delay
    setTimeout(() => {
      const generatedId = "REQ-" + Math.random().toString(36).substr(2, 9).toUpperCase()
      setRequestId(generatedId)
      setIsSubmitted(true)
      setIsSubmitting(false)
    }, 2000)
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation userRole="user" userName="John Doe" eventName="Summer Music Festival 2025" unreadAlerts={3} />

        <div className="container mx-auto px-4 py-12 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Backup Request Submitted!</CardTitle>
              <CardDescription>
                Your backup request has been received and dispatched to available responders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium">Request Reference ID:</p>
                <p className="text-lg font-mono text-primary">{requestId}</p>
              </div>

              <div className="space-y-2 text-left">
                <h3 className="font-medium">Request Details:</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <p><span className="font-medium">Type:</span> {backupTypes.find(t => t.value === formData.backupType)?.label}</p>
                  <p><span className="font-medium">Urgency:</span> {urgencyLevels.find(u => u.value === formData.urgency)?.label}</p>
                  <p><span className="font-medium">Location:</span> {formData.location}</p>
                  <p><span className="font-medium">Time:</span> {new Date().toLocaleString()}</p>
                </div>
              </div>

              <Alert className="bg-orange-50 border-orange-200">
                <Users className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  The dispatcher has been notified and is coordinating with available {backupTypes.find(t => t.value === formData.backupType)?.label.toLowerCase()}.
                  Track status updates on your dashboard.
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 justify-center">
                <Link href="/dashboard/user">
                  <Button>
                    Return to Dashboard
                  </Button>
                </Link>
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Request More Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation userRole="user" userName="John Doe" eventName="Summer Music Festival 2025" unreadAlerts={3} />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/dashboard/user">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Request Emergency Backup
          </h1>
          <p className="text-muted-foreground mt-2">
            Request immediate assistance from our emergency response teams. Backup requests are prioritized based on urgency.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Backup Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Backup Type *</CardTitle>
              <CardDescription>Choose the type of assistance you need</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {backupTypes.map((type) => {
                  const IconComponent = type.icon
                  return (
                    <Card
                      key={type.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedType === type.value ? "ring-2 ring-primary bg-primary/5" : ""
                      }`}
                      onClick={() => handleTypeSelect(type.value)}
                    >
                      <CardContent className="p-4 text-center">
                        <IconComponent className="h-8 w-8 mx-auto mb-2 text-primary" />
                        <h3 className="font-semibold text-sm mb-1">{type.label}</h3>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level *</Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How urgent is this request?" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          <span className={level.color}>{level.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Main Stage, Food Court, Zone A, etc."
                    value={formData.location}
                    onChange={(e) => handleInputChange("location", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason for Request *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Describe the situation requiring backup assistance..."
                    value={formData.reason}
                    onChange={(e) => handleInputChange("reason", e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additionalNeeds">Additional Needs/Resources</Label>
                  <Textarea
                    id="additionalNeeds"
                    placeholder="Specify any special equipment, number of personnel, or other requirements..."
                    value={formData.additionalNeeds}
                    onChange={(e) => handleInputChange("additionalNeeds", e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedDuration">Estimated Duration</Label>
                  <Select value={formData.estimatedDuration} onValueChange={(value) => handleInputChange("estimatedDuration", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="How long do you expect to need assistance?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutes</SelectItem>
                      <SelectItem value="30min">30 minutes</SelectItem>
                      <SelectItem value="1hour">1 hour</SelectItem>
                      <SelectItem value="2hours">2 hours</SelectItem>
                      <SelectItem value="ongoing">Ongoing situation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Requester Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="requesterName">Your Name</Label>
                  <Input
                    id="requesterName"
                    placeholder="Enter your full name"
                    value={formData.requesterName}
                    onChange={(e) => handleInputChange("requesterName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requesterContact">Contact Information</Label>
                  <Input
                    id="requesterContact"
                    placeholder="Phone number for coordination"
                    value={formData.requesterContact}
                    onChange={(e) => handleInputChange("requesterContact", e.target.value)}
                  />
                </div>

                {/* Available Responders Preview */}
                <div className="space-y-3">
                  <Label>Available Responders</Label>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">Currently Available</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedType === "security" && (
                        <>
                          <Badge variant="outline" className="bg-green-100 text-green-700">Security Team A</Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-700">Security Team B</Badge>
                        </>
                      )}
                      {selectedType === "medical" && (
                        <>
                          <Badge variant="outline" className="bg-green-100 text-green-700">Dr. Johnson</Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-700">EMT Team 1</Badge>
                        </>
                      )}
                      {selectedType === "technical" && (
                        <>
                          <Badge variant="outline" className="bg-green-100 text-green-700">Tech Support A</Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-700">IT Team</Badge>
                        </>
                      )}
                      {selectedType === "fire" && (
                        <>
                          <Badge variant="outline" className="bg-green-100 text-green-700">Fire Station 1</Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-700">Safety Team</Badge>
                        </>
                      )}
                      {!selectedType && <p className="text-muted-foreground col-span-2">Select a backup type to see available responders</p>}
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertTriangle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    Emergency requests (Critical urgency) receive immediate dispatch.
                    All other requests are prioritized by the central dispatcher.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4 justify-end">
                <Link href="/dashboard/user">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Dispatching Backup...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4 mr-2" />
                      Request Backup
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
