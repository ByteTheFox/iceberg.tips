"use client";

import { useState, useEffect, useRef } from "react";
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
  FormDescription,
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
import { createClient } from "@/lib/supabase/client";
import { useMapboxSearch } from "@/hooks/use-mapbox-search";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import BusinessConfirmationCard from "@/components/business-confirmation-card";
import crypto from "crypto";
import Link from "next/link";
import { tipPracticeOptions } from "@/lib/constants";
import { useDebounce } from "@/hooks/use-debounce";
import { Checkbox } from "@/components/ui/checkbox";
import type { SearchResult } from "@/hooks/use-mapbox-search";

const formSchema = z.object({
  country: z.enum(["US", "CA"], {
    required_error: "Please select a country",
  }),
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  city: z.string().min(2, "City must be at least 2 characters"),
  state: z.string().min(2, "Province/State must be at least 2 characters"),
  zipCode: z
    .string()
    .regex(
      /^(\d{5}|\d{5}-\d{4}|[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d)$/,
      "Invalid ZIP/Postal code"
    ),
  tipPractice: z.string({
    required_error: "Please select a tip practice",
  }),
  tipsGoToStaff: z.boolean().optional().nullable(),
  suggestedTips: z.array(z.number()).optional().nullable(),
  serviceChargePercentage: z.number().optional().nullable(),
  details: z.string().optional().nullable(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export default function ReportPage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const { searchBusiness, searchResults, isSearching, clearResults } =
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
      latitude: undefined,
      longitude: undefined,
      tipsGoToStaff: null,
    },
  });

  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [tipPercentages, setTipPercentages] = useState<number[]>([]);
  const [tipPercentagesModified, setTipPercentagesModified] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [currentCountry, setCurrentCountry] = useState<"US" | "CA" | undefined>(
    undefined
  );
  const [currentTipPractice, setCurrentTipPractice] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value.country !== currentCountry) {
        setCurrentCountry(value.country);
      }
      if (value.tipPractice !== currentTipPractice) {
        setCurrentTipPractice(value.tipPractice);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  useEffect(() => {
    if (currentTipPractice === "tip_requested") {
      setTipPercentages([10, 15, 20]);
      setTipPercentagesModified(false);
    } else {
      setTipPercentages([]);
      setTipPercentagesModified(false);
    }
  }, [currentTipPractice]);

  useEffect(() => {
    if (debouncedSearchTerm.length > 2 && currentCountry) {
      searchBusiness(debouncedSearchTerm, currentCountry);
      setOpen(true);
    } else {
      clearResults();
      setOpen(false);
    }
  }, [debouncedSearchTerm, currentCountry, searchBusiness, clearResults]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Form submitted with values:", values);
    try {
      setIsLoading(true);

      // Validate required fields explicitly
      if (
        !values.businessName ||
        !values.address ||
        !values.city ||
        !values.state ||
        !values.zipCode ||
        !values.tipPractice
      ) {
        throw new Error("Please fill in all required fields");
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Log each step for debugging
      console.log("Creating business hash...");
      const businessString = `${values.businessName
        .toLowerCase()
        .trim()}|${values.address.toLowerCase().trim()}|${values.city
        .toLowerCase()
        .trim()}|${values.state.toUpperCase()}|${values.zipCode}`;
      const businessHash = crypto
        .createHash("sha256")
        .update(businessString)
        .digest("hex");

      console.log("Upserting business...");
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
            latitude: values.latitude || null,
            longitude: values.longitude || null,
          },
          { onConflict: "hash" }
        )
        .select();

      if (businessError) {
        console.error("Business upsert error:", businessError);
        throw businessError;
      }

      console.log("Creating report data...");
      const reportData: any = {
        business_id: business![0].id,
        user_id: user?.id || null,
        tip_practice: values.tipPractice,
        tips_go_to_staff: values.tipsGoToStaff,
        details: values.details || null,
      };

      if (values.tipPractice === "tip_requested" && tipPercentagesModified) {
        reportData.suggested_tips = tipPercentages;
      }

      if (
        values.tipPractice === "service_charge" &&
        values.serviceChargePercentage
      ) {
        reportData.service_charge_percentage = values.serviceChargePercentage;
      }

      console.log("Inserting report...", reportData);
      const { error: reportError } = await supabase
        .from("reports")
        .insert(reportData);

      if (reportError) {
        console.error("Report insert error:", reportError);
        throw reportError;
      }

      toast({
        title: "Success",
        description: "Thank you for contributing to tip transparency!",
      });

      // Reset form and state
      form.reset();
      setSelectedBusiness(null);
      setTipPercentages([]);
      setTipPercentagesModified(false);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSelect = (result: SearchResult) => {
    setSelectedBusiness({
      name: result.properties.name,
      address: result.properties.address,
      city: result.properties.context.place.name,
      state: result.properties.context.region.name,
      zipCode: result.properties.context.postcode.name,
      latitude: result.properties.coordinates.latitude,
      longitude: result.properties.coordinates.longitude,
    });

    form.setValue("businessName", result.properties.name);
    form.setValue("address", result.properties.address);
    form.setValue("city", result.properties.context.place.name);
    form.setValue("state", result.properties.context.region.name);
    form.setValue("zipCode", result.properties.context.postcode.name);
    form.setValue("latitude", result.properties.coordinates.latitude);
    form.setValue("longitude", result.properties.coordinates.longitude);
    setOpen(false);
  };

  const formValues = form.watch();

  const isFormValid = () => {
    const values = form.getValues();

    const hasBusinessInfo =
      values.businessName &&
      values.address &&
      values.city &&
      values.state &&
      values.zipCode;

    const isValid = Boolean(
      values.country && hasBusinessInfo && values.tipPractice
    );

    return isValid;
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
    <div className="w-full max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to home
      </Link>

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

          <FormField
            control={form.control}
            name="businessName"
            render={({ field }) => (
              <FormItem className="flex flex-col relative">
                <FormLabel>Business Name</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={!currentCountry}
                      placeholder={
                        currentCountry
                          ? "Enter business name"
                          : "Please select a country first"
                      }
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setSearchTerm(e.target.value);

                        // Only reset fields if input is cleared
                        if (!e.target.value) {
                          setOpen(false);
                          setSelectedBusiness(null);
                          form.setValue("address", "");
                          form.setValue("city", "");
                          form.setValue("state", "");
                          form.setValue("zipCode", "");
                          form.setValue("latitude", undefined);
                          form.setValue("longitude", undefined);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (searchResults.length > 0) {
                          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                            e.preventDefault();
                            setOpen(true);
                            const commandInput = document.querySelector(
                              "[cmdk-input]"
                            ) as HTMLElement;
                            commandInput?.focus();
                          }
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSelect(searchResults[0]);
                            setOpen(false);
                          }
                        }
                      }}
                    />
                    {open && searchResults.length > 0 && (
                      <div className="absolute w-full z-50 top-[calc(100%+1px)] rounded-md border bg-popover shadow-md overflow-hidden">
                        <Command
                          loop={false}
                          shouldFilter={false}
                          className="border-none"
                          onKeyDown={(e) => {
                            // Handle Enter key on highlighted item
                            if (e.key === "Enter") {
                              const highlightedItem = document.querySelector(
                                '[data-highlighted="true"]'
                              );
                              if (highlightedItem) {
                                const index = parseInt(
                                  highlightedItem.getAttribute("data-index") ||
                                    "0"
                                );
                                handleSelect(searchResults[index]);
                                setOpen(false);
                              }
                            }
                          }}
                        >
                          <CommandList>
                            <CommandEmpty>
                              {isSearching
                                ? "Searching..."
                                : "No results found."}
                            </CommandEmpty>
                            <CommandGroup className="overflow-hidden">
                              {searchResults.map((result, index) => (
                                <CommandItem
                                  key={`${result.properties.mapbox_id}-${index}`}
                                  value={`${result.properties.mapbox_id}-${index}`}
                                  onSelect={() => {
                                    handleSelect(result);
                                    setOpen(false);
                                  }}
                                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                                  data-index={index}
                                >
                                  <div className="flex flex-col py-2 w-full">
                                    <span className="font-medium">
                                      {result.properties.name}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                      {result.properties.full_address}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedBusiness ? (
            <BusinessConfirmationCard business={selectedBusiness} />
          ) : (
            searchTerm.length > 2 &&
            !isSearching &&
            searchResults.length === 0 && (
              <div className="rounded-lg border bg-card text-card-foreground p-4">
                <p className="text-sm text-muted-foreground">
                  No business found. Please try a different search term or
                  ensure the business name is correct.
                </p>
              </div>
            )
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
                    {tipPracticeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {(form.watch("tipPractice") === "tip_requested" ||
            form.watch("tipPractice") === "service_charge") && (
            <FormField
              control={form.control}
              name="tipsGoToStaff"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Tips go to front-of-house staff (Optional)
                    </FormLabel>
                    <FormDescription>
                      Check this box if you can confirm that the tips/service
                      charges go to servers, bartenders, or other front-of-house
                      staff.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}

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
                    onChange={(e) => updateTipPercentage(index, e.target.value)}
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
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
