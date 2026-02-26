"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Loading() {
  return (
    <div className="min-h-screen pt-20 p-6">
      {/* Status Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-md animate-pulse bg-muted" />
                <div className="space-y-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Panels Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-md animate-pulse bg-muted" />
              ))}
            </div>
            <div className="h-4 w-20 animate-pulse rounded bg-muted mt-4" />
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-md animate-pulse bg-muted" />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">
              <div className="h-6 w-32 animate-pulse rounded bg-muted" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <div className="h-8 w-16 rounded animate-pulse bg-muted" />
              <div className="h-8 w-16 rounded animate-pulse bg-muted" />
              <div className="h-8 w-16 rounded animate-pulse bg-muted" />
            </div>
            <div className="h-64 rounded-md animate-pulse bg-muted" />
          </CardContent>
        </Card>
      </div>

      {/* Loading Indicator */}
      <motion.div
        className="fixed bottom-8 right-8"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-8 h-8 border-2 border-[var(--hw-success)] border-t-transparent rounded-full" />
      </motion.div>
    </div>
  );
}
