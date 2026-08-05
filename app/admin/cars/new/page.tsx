/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Car,
  Calendar,
  MapPin,
  DollarSign,
  Image as ImageIcon,
  Settings,
  Tag,
  Gauge,
  Users,
  Briefcase,
  Fuel,
  Settings2,
  CheckSquare,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  Star,
} from "lucide-react";
import {
  FormSection,
  InputField,
  PageHeader,
  StatusBadge,
  FormActions,
} from "@/components/ui/form-controls";
import { ImageUploader } from "@/components/ui/ImageUploader";

interface MasterOption {
  id: string;
  name: string;
}

export default function AddCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingFeatures, setFetchingFeatures] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Master Data States
  const [categories, setCategories] = useState<MasterOption[]>([]);
  const [fuelTypes, setFuelTypes] = useState<MasterOption[]>([]);
  const [transmissions, setTransmissions] = useState<MasterOption[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<MasterOption[]>([]);

  // Selection States
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [mainImageUrl, setMainImageUrl] = useState<string>("");

  const [formData, setFormData] = useState({
    manufacturer: "",
    model: "",
    year: new Date().getFullYear(),
    licensePlate: "",
    color: "",
    seats: 5,
    luggageCapacity: 2,
    pricePerDay: 50,
    pricePerWeek: 300,
    pricePerMonth: 1000,
    securityDeposit: 200,
    mileageFree: 200,
    mileageExtraFee: 0.25,
    locationAddress: "",
    locationCity: "",
    locationState: "",
    locationZipCode: "",
    categoryId: "",
    fuelTypeId: "",
    transmissionId: "",
    status: "AVAILABLE",
  });

  // Load Master Data
  useEffect(() => {
    async function loadMasterData() {
      try {
        setFetchingFeatures(true);
        const [catRes, fuelRes, transRes, featRes] = await Promise.all([
          fetch("/api/admin/categories"),
          fetch("/api/admin/fuel-types"),
          fetch("/api/admin/transmission-types"),
          fetch("/api/admin/car-features"),
        ]);

        const extractData = async (res: Response) => {
          if (!res.ok) return [];
          const json = await res.json();
          return Array.isArray(json) ? json : json.data || [];
        };

        const [catData, fuelData, transData, featData] = await Promise.all([
          extractData(catRes),
          extractData(fuelRes),
          extractData(transRes),
          extractData(featRes),
        ]);

        setCategories(catData);
        setFuelTypes(fuelData);
        setTransmissions(transData);
        setAvailableFeatures(featData);
      } catch (err) {
        console.error("Failed to load form options:", err);
        setError("Failed to load form data. Please refresh the page.");
      } finally {
        setFetchingFeatures(false);
      }
    }
    loadMasterData();
  }, []);

  // Update Main Image when images change
  useEffect(() => {
    if (imageUrls.length > 0) {
      if (!mainImageUrl || !imageUrls.includes(mainImageUrl)) {
        setMainImageUrl(imageUrls[0]);
      }
    } else {
      setMainImageUrl("");
    }
  }, [imageUrls, mainImageUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFeatureToggle = (featureName: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(featureName)
        ? prev.filter((item) => item !== featureName)
        : [...prev, featureName]
    );
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.manufacturer.trim()) errors.manufacturer = "Manufacturer is required";
    if (!formData.model.trim()) errors.model = "Model is required";
    if (!formData.licensePlate.trim()) errors.licensePlate = "License plate is required";
    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      errors.pricePerDay = "Valid price per day is required";
    }
    if (imageUrls.length === 0) {
      errors.images = "At least one image is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const payload = {
        ...formData,
        imageMain: mainImageUrl || imageUrls[0] || "",
        imageGallery: imageUrls,
        features: selectedFeatures,
      };

      const res = await fetch("/api/admin/cars", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        if (res.status === 409) {
          setError(result.message || "A vehicle with this license plate already exists.");
        } else if (res.status === 400) {
          setError(result.message || "Invalid data provided. Please check your inputs.");
        } else {
          setError(result.message || "Failed to create car. Please try again.");
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/cars"), 1500);
    } catch (err: any) {
      console.error("Submit error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Add New Vehicle"
          description="Add a new car to your fleet inventory"
          icon={Car}
          badge={<StatusBadge status="draft" />}
          actions={
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
              <Clock className="w-3.5 h-3.5 text-gray-600" />
              <span className="text-xs font-medium text-gray-600">Draft</span>
            </div>
          }
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50/80 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-red-600">{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-2xl flex items-start gap-3 text-green-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-green-600">Vehicle created. Redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/*  Vehicle Details */}
          <FormSection icon={Car} title="Vehicle Details" description="Basic information about the vehicle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <InputField
                label="Manufacturer"
                icon={Tag}
                type="text"
                name="manufacturer"
                required
                placeholder="e.g. Toyota"
                value={formData.manufacturer}
                onChange={handleChange}
                error={validationErrors.manufacturer}
              />
              <InputField
                label="Model"
                icon={Car}
                type="text"
                name="model"
                required
                placeholder="e.g. Camry"
                value={formData.model}
                onChange={handleChange}
                error={validationErrors.model}
              />
              <InputField
                label="Year"
                icon={Calendar}
                type="number"
                name="year"
                required
                value={formData.year}
                onChange={handleChange}
              />
              <InputField
                label="License Plate"
                icon={Tag}
                type="text"
                name="licensePlate"
                required
                placeholder="ABC-1234"
                value={formData.licensePlate}
                onChange={handleChange}
                error={validationErrors.licensePlate}
              />
              <InputField
                label="Color"
                type="text"
                name="color"
                placeholder="e.g. Silver"
                value={formData.color}
                onChange={handleChange}
              />
              <InputField
                label="Status"
                icon={Settings}
                isSelect
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="AVAILABLE">✓ Available</option>
                <option value="MAINTENANCE">🔧 In Maintenance</option>
                <option value="RESERVED">📅 Reserved</option>
              </InputField>
            </div>
          </FormSection>

          {/*  Specifications */}
          <FormSection icon={Settings2} title="Specifications" description="Technical specifications" collapsible>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField label="Category" icon={Tag} isSelect name="categoryId" value={formData.categoryId} onChange={handleChange}>
                <option value="">Select Category</option>
                {categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
              </InputField>
              <InputField label="Fuel Type" icon={Fuel} isSelect name="fuelTypeId" value={formData.fuelTypeId} onChange={handleChange}>
                <option value="">Select Fuel Type</option>
                {fuelTypes.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
              </InputField>
              <InputField label="Transmission" icon={Settings2} isSelect name="transmissionId" value={formData.transmissionId} onChange={handleChange}>
                <option value="">Select Transmission</option>
                {transmissions.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
              </InputField>
              <InputField label="Seats" icon={Users} type="number" name="seats" value={formData.seats} onChange={handleChange} />
              <InputField label="Luggage Capacity" icon={Briefcase} type="number" name="luggageCapacity" value={formData.luggageCapacity} onChange={handleChange} />
            </div>
          </FormSection>

          {/*  Car Features */}
          <FormSection icon={CheckSquare} title="Vehicle Features" description="Select all features available on this vehicle">
            {fetchingFeatures ? (
              <div className="flex items-center gap-2 py-4 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Loading available features...</span>
              </div>
            ) : availableFeatures.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 italic">No vehicle features found.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableFeatures.map((feature) => {
                  const isChecked = selectedFeatures.includes(feature.name);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => handleFeatureToggle(feature.name)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked ? "bg-black text-white border-black" : "bg-gray-50/50 text-gray-700 border-gray-200"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? "bg-white text-black" : "bg-white"}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                      <span className="text-xs font-medium truncate">{feature.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </FormSection>

          {/*  Pricing */}
          <FormSection icon={DollarSign} title="Pricing & Rates" description="Set rental rates and deposit">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField label="Price / Day" icon={DollarSign} type="number" name="pricePerDay" required value={formData.pricePerDay} onChange={handleChange} error={validationErrors.pricePerDay} />
              <InputField label="Price / Week" icon={DollarSign} type="number" name="pricePerWeek" value={formData.pricePerWeek} onChange={handleChange} />
              <InputField label="Price / Month" icon={DollarSign} type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} />
              <InputField label="Security Deposit" icon={Shield} type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200/60">
              <InputField label="Mileage Free (km)" icon={Gauge} type="number" name="mileageFree" value={formData.mileageFree} onChange={handleChange} />
              <InputField label="Extra Mileage Fee" icon={DollarSign} type="number" name="mileageExtraFee" step="0.01" value={formData.mileageExtraFee} onChange={handleChange} />
            </div>
          </FormSection>

          {/*  Image Gallery */}
          <FormSection icon={ImageIcon} title="Image Gallery" description="Upload vehicle images directly to Cloudinary">
            <ImageUploader
              value={imageUrls}
              onChange={(urls) => {
                setImageUrls(urls);
                if (validationErrors.images) {
                  setValidationErrors((prev) => ({ ...prev, images: "" }));
                }
              }}
              multiple={true}
              folder="cars"
            />
            {validationErrors.images && (
              <p className="text-xs text-red-500 mt-2">{validationErrors.images}</p>
            )}

            {imageUrls.length > 1 && (
              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="text-xs text-gray-500">
                  Select main thumbnail image:
                </span>
                <div className="flex flex-wrap gap-2 ml-2">
                  {imageUrls.map((url, idx) => (
                    <button
                      key={url}
                      type="button"
                      onClick={() => setMainImageUrl(url)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        mainImageUrl === url
                          ? "bg-black text-white border-black font-semibold"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      Img #{idx + 1} {mainImageUrl === url && "★"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </FormSection>

          {/*  Location */}
          <FormSection icon={MapPin} title="Location" description="Vehicle pickup location">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="City" icon={MapPin} type="text" name="locationCity" placeholder="e.g. Los Angeles" value={formData.locationCity} onChange={handleChange} />
              <InputField label="Address" icon={MapPin} type="text" name="locationAddress" placeholder="e.g. 123 Main St" value={formData.locationAddress} onChange={handleChange} />
            </div>
          </FormSection>

          {/* Actions */}
          <FormActions
            onCancel={() => router.back()}
            isSubmitting={loading}
            submitLabel="Save & Publish"
            cancelLabel="Cancel"
          />
        </form>
      </div>
    </div>
  );
}