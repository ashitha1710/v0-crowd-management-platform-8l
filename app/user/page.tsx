"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, ExternalLink, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function UserVerificationPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CrowdGuard</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Event Access Verification</h1>
          <p className="text-muted-foreground">Please verify your event ticket before proceeding</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ExternalLink className="h-5 w-5" />
              <span>Blockchain Ticket Verification</span>
            </CardTitle>
            <CardDescription>
              Access your blockchain-secured event ticket to verify your attendance authorization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-white">
                <iframe
                  src="https://blockchainticket.vercel.app/"
                  className="w-full h-96"
                  title="Blockchain Ticket Verification"
                  allowFullScreen
                />
              </div>

              <div className="flex justify-center">
                <Link href="/dashboard/user">
                  <Button size="lg" className="flex items-center space-x-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Proceed to Dashboard</span>
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
