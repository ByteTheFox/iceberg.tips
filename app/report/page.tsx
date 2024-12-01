"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().length(2, "Please use 2-letter state code"),
  zipCode: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  tipPractice: z.string({
    required_error: "Please select a tip practice",
  }),
  details: z.string().optional(),
})

export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      tipPractice: "",
      details: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      
      // TODO: Implement geocoding to get lat/lng from address
      const mockLatitude = 37.7749
      const mockLongitude = -122.4194

      const { error } = await supabase.from("business_reports").insert({
        business_name: values.businessName,
        address: values.address,
        city: values.city,
        state: values.state,
        zip_code: values.zipCode,
        tip_practice: values.tipPractice,
        details: values.details,
        latitude: mockLatitude,
        longitude: mockLongitude,
        reported_by: "anonymous", // TODO: Implement auth
      })

      if (error) throw error

      toast({
        title: "Report submitted",
        description: "Thank you for contributing to tip transparency!",
      })

      form.reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Report Business Tip Practice</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter business name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter street address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>City</FormLabel>
                  <FormControl>
                    <Input placeholder="City" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>State</FormLabel>
                  <FormControl>
                    <Input placeholder="ST" maxLength={2} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="zipCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ZIP Code</FormLabel>
                  <FormControl>
                    <Input placeholder="12345" maxLength={5} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="tipPractice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tip Practice</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tip practice" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="no_tipping">No Tipping Allowed</SelectItem>
                    <SelectItem value="living_wage">Living Wage (No Tips Needed)</SelectItem>
                    <SelectItem value="traditional">Traditional Tipping</SelectItem>
                    <SelectItem value="service_charge">Mandatory Service Charge</SelectItem>
                    <SelectItem value="tip_pooling">Tip Pooling</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Details (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Share more details about the tipping practice..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  )
}