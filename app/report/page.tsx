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
import { createClient } from "@/lib/supabase/client";
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
import Link from "next/link";
import { tipPracticeOptions } from "@/lib/constants";

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
      latitude: undefined,
      longitude: undefined,
    },
  });

  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [tipPercentages, setTipPercentages] = useState<number[]>([]);
  const [tipPercentagesModified, setTipPercentagesModified] = useState(false);

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
    <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8">
      <Link
        href="/"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        ← Back to home
      </Link>

      <h1 className="text-2xl font-bold mb-12">Report Business Tip Practice</h1>

      {!form.formState.isValid && (
        <div className="bg-red-100 p-4 rounded-lg mb-6">
          <p className="text-red-500">Please fill in all required fields.</p>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(form.formState.errors, null, 2)}
          </pre>
        </div>
      )}

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
                      value={field.value || ""}
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
