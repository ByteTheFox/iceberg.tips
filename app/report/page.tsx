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
import crypto from "crypto";
import { useUser } from "@supabase/auth-helpers-react";

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
  suggestedTips: z.array(z.number()).optional(),
  serviceChargePercentage: z.number().nullable(),
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
      suggestedTips: [],
      serviceChargePercentage: null,
    },
  });

  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [tipPercentages, setTipPercentages] = useState<number[]>([]);
  const [tipPercentagesModified, setTipPercentagesModified] = useState(false);

  const { user } = useUser();

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

  useEffect(() => {
    const tipPractice = form.watch("tipPractice");

    // Reset UI state
    setTipPercentages([]);
    setTipPercentagesModified(false);

    // Set default percentages in UI only if tip requested
    if (tipPractice === "tip_requested") {
      const defaultPercentages = [10, 15, 20];
      setTipPercentages(defaultPercentages);
    }
  }, [form.watch("tipPractice")]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      // Create a hash of the business details for deduplication
      const businessString = `${values.businessName
        .toLowerCase()
        .trim()}|${values.address.toLowerCase().trim()}|${values.city
        .toLowerCase()
        .trim()}|${values.state.toUpperCase()}|${values.zipCode}`;
      const businessHash = crypto
        .createHash("sha256")
        .update(businessString)
        .digest("hex");

      // First, upsert the business
      const { data: business, error: businessError } = await supabase
        .from("businesses")
        .upsert(
          {
            hash: businessHash,
            name: values.businessName,
            address: values.address,
            city: values.city,
            state: values.state,
            zip_code: values.zipCode,
            country: values.country,
            latitude: values.latitude,
            longitude: values.longitude,
          },
          { onConflict: "hash", returning: true }
        );

      if (businessError) throw businessError;

      // Then create the report
      const reportData = {
        business_id: business![0].id,
        user_id: user?.id || null,
        tip_practice: values.tipPractice,
        details: values.details || null,
      };

      // Add optional fields based on tip practice
      if (values.tipPractice === "tip_requested" && tipPercentagesModified) {
        Object.assign(reportData, { suggested_tips: values.suggestedTips });
      }

      if (
        values.tipPractice === "service_charge" &&
        values.serviceChargePercentage !== null
      ) {
        Object.assign(reportData, {
          service_charge_percentage: values.serviceChargePercentage,
        });
      }

      const { error: reportError } = await supabase
        .from("reports")
        .insert(reportData);

      if (reportError) throw reportError;

      toast({
        title: "Report submitted",
        description: "Thank you for contributing to tip transparency!",
      });

      form.reset();
      setSelectedBusiness(null);
      setTipPercentages([]);
      setTipPercentagesModified(false);
    } catch (error) {
      console.error("Error submitting report:", error);
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

  const formValues = form.watch();

  const isFormValid = () => {
    const values = form.getValues();
    const hasBusinessInfo =
      selectedBusiness &&
      values.businessName &&
      values.address &&
      values.city &&
      values.state &&
      values.zipCode;
    return values.country && hasBusinessInfo && values.tipPractice;
  };

  const addTipPercentage = () => {
    setTipPercentagesModified(true);
    setTipPercentages([...tipPercentages, 0]);
    form.setValue("suggestedTips", [...tipPercentages, 0]);
  };

  const updateTipPercentage = (index: number, value: string) => {
    setTipPercentagesModified(true);
    const newValue = parseInt(value) || 0;
    const newTipPercentages = [...tipPercentages];
    newTipPercentages[index] = newValue;
    setTipPercentages(newTipPercentages);
    form.setValue("suggestedTips", newTipPercentages);
  };

  const removeTipPercentage = (index: number) => {
    setTipPercentagesModified(true);
    const newTipPercentages = tipPercentages.filter((_, i) => i !== index);
    setTipPercentages(newTipPercentages);
    form.setValue("suggestedTips", newTipPercentages);
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
                              const commandInput = document.querySelector(
                                "[cmdk-input]"
                              ) as HTMLElement;
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
                      <SelectItem value="no_tipping">No Tipping</SelectItem>
                      <SelectItem value="tip_requested">
                        Tip Requested
                      </SelectItem>
                      <SelectItem value="service_charge">
                        Mandatory Service Charge
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("tipPractice") === "tip_requested" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Suggested Tip Percentages (Optional)</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTipPercentage}
                  >
                    Add Percentage
                  </Button>
                </div>
                {tipPercentages.map((percentage, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={percentage}
                      onChange={(e) =>
                        updateTipPercentage(index, e.target.value)
                      }
                      className="w-24"
                    />
                    <span>%</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTipPercentage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {form.watch("tipPractice") === "service_charge" && (
              <FormField
                control={form.control}
                name="serviceChargePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Charge Percentage (Optional)</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value ? Number(value) : null);
                          }}
                          className="w-24"
                        />
                      </FormControl>
                      <span>%</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

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
            disabled={isLoading || !isFormValid()}
          >
            {isLoading ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </Form>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg relative">
          <div className="absolute -top-3 right-2 bg-red-300 text-black text-xs px-2 py-1 rounded-full font-semibold">
            DEV ONLY
          </div>
          <h2 className="text-sm font-semibold mb-2">Form Values (Debug):</h2>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(formValues, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
