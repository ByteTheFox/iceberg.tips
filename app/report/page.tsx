"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";
import { useMapboxSearch } from "@/hooks/use-mapbox-search";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BusinessConfirmationCard from "@/components/business-confirmation-card";

const formSchema = z.object({
  country: z.enum(["US", "CA"], {
    required_error: "Please select a country",
  }),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().length(2, "Please use 2-letter state/province code"),
  zipCode: z
    .string()
    .regex(
      /^(\d{5}|\d{5}-\d{4}|[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d)$/,
      "Invalid ZIP/Postal code"
    ),
  tipPractice: z.string({
    required_error: "Please select a tip practice",
  }),
  details: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function ReportPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { searchAddress, searchResults, isSearching, clearResults } =
    useMapboxSearch();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      country: undefined,
      businessName: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      tipPractice: "",
      details: "",
    },
  });

  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);

  useEffect(() => {
    const businessName = form.watch("businessName");
    const country = form.watch("country");
    if (businessName.length > 2 && country) {
      const timer = setTimeout(() => {
        searchAddress(businessName, country);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [form.watch("businessName"), form.watch("country")]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // TODO: Implement geocoding to get lat/lng from address
      const mockLatitude = 37.7749;
      const mockLongitude = -122.4194;

      const { error } = await supabase.from("business_reports").insert({
        country: values.country,
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
      });

      if (error) throw error;

      toast({
        title: "Report submitted",
        description: "Thank you for contributing to tip transparency!",
      });

      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelect = (result: any) => {
    setSelectedBusiness({
      name: result.place_name.split(",")[0],
      address: result.properties.address || "",
      city: result.properties.city || "",
      state: result.properties.state || "",
      zipCode: result.properties.postcode || "",
      latitude: result.center[1],
      longitude: result.center[0],
    });

    form.setValue("businessName", result.place_name.split(",")[0]);
    form.setValue("address", result.properties.address || "");
    form.setValue("city", result.properties.city || "");
    form.setValue("state", result.properties.state || "");
    form.setValue("zipCode", result.properties.postcode || "");
    form.setValue("latitude", result.center[1]);
    form.setValue("longitude", result.center[0]);
    setOpen(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-12">Report Business Tip Practice</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div
            className={`space-y-6 ${
              !form.watch("country") ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Business Name</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Input
                          disabled={!form.watch("country")}
                          placeholder="Enter business name"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            if (e.target.value.length > 2) {
                              setOpen(true);
                              searchAddress(
                                e.target.value,
                                form.watch("country")
                              );
                            } else {
                              clearResults();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (
                              e.key === "ArrowDown" &&
                              searchResults.length > 0
                            ) {
                              e.preventDefault();
                              setOpen(true);
                              const commandInput =
                                document.querySelector("[cmdk-input]");
                              commandInput?.focus();
                            }
                          }}
                        />
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="start">
                      <Command
                        loop={false}
                        shouldFilter={false}
                        value={searchResults[0]?.place_name}
                      >
                        <CommandInput
                          placeholder="Search for a business..."
                          value={field.value}
                          onValueChange={(value) => {
                            field.onChange(value);
                            if (value.length > 2) {
                              setOpen(true);
                              searchAddress(value, form.watch("country"));
                            } else {
                              clearResults();
                            }
                          }}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSearching ? "Searching..." : "No results found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {searchResults.map((result, index) => (
                              <CommandItem
                                key={result.place_name}
                                value={result.place_name}
                                onSelect={() => handleSelect(result)}
                                className="cursor-pointer"
                                data-highlighted={index === 0}
                              >
                                {result.place_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedBusiness && (
              <BusinessConfirmationCard business={selectedBusiness} />
            )}

            <FormField
              control={form.control}
              name="tipPractice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tip Practice</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!form.watch("country")}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select tip practice" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="no_tipping">
                        No Tipping Allowed
                      </SelectItem>
                      <SelectItem value="living_wage">
                        Living Wage (No Tips Needed)
                      </SelectItem>
                      <SelectItem value="traditional">
                        Traditional Tipping
                      </SelectItem>
                      <SelectItem value="service_charge">
                        Mandatory Service Charge
                      </SelectItem>
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
                      disabled={!form.watch("country")}
                      placeholder="Share more details about the tipping practice..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full mt-12"
            disabled={isLoading || !form.watch("country")}
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
