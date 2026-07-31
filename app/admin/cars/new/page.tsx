

/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
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
  Upload,
  Trash2,
  Plus,
  Camera,
  Star,
  CheckSquare,
  Check,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
} from "lucide-react";
import {
  FormSection,
  InputField,
  PageHeader,
  StatusBadge,
  FormActions,
} from "@/components/ui/form-controls";

interface MasterOption {
  id: string;
  name: string;
}

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  isMain?: boolean;
  uploadProgress?: number;
}

export default function AddCarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingFeatures, setFetchingFeatures] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  // Master Data States
  const [categories, setCategories] = useState<MasterOption[]>([]);
  const [fuelTypes, setFuelTypes] = useState<MasterOption[]>([]);
  const [transmissions, setTransmissions] = useState<MasterOption[]>([]);
  const [availableFeatures, setAvailableFeatures] = useState<MasterOption[]>([]);

  // Selection States
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

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

  // Fetch Master Data from API
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
    // Clear validation error for this field
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

  const handleImageUpload = (files: FileList) => {
    const newImages: ImageFile[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      preview: URL.createObjectURL(file),
      isMain: images.length === 0,
    }));

    setImages((prev) => [...prev, ...newImages]);

    newImages.forEach((img) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        setImages((prev) =>
          prev.map((im) =>
            im.id === img.id
              ? { ...im, uploadProgress: Math.min(progress, 100) }
              : im
          )
        );
      }, 150);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files.length > 0) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const removeImage = (id: string) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      const removedImg = prev.find((img) => img.id === id);
      if (removedImg?.isMain && filtered.length > 0) {
        filtered[0].isMain = true;
      }
      return filtered;
    });
  };

  const setMainImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isMain: img.id === id,
      }))
    );
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageUpload(e.target.files);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.manufacturer.trim()) {
      errors.manufacturer = "Manufacturer is required";
    }
    if (!formData.model.trim()) {
      errors.model = "Model is required";
    }
    if (!formData.licensePlate.trim()) {
      errors.licensePlate = "License plate is required";
    }
    if (!formData.pricePerDay || formData.pricePerDay <= 0) {
      errors.pricePerDay = "Valid price per day is required";
    }
    if (images.length === 0) {
      errors.images = "At least one image is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const imageUrls = images.map((img) => img.preview);

      const payload = {
        ...formData,
        imageMain: images.find((img) => img.isMain)?.preview || images[0]?.preview || "",
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
        // Handle specific error messages
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

        {/* Notifications */}
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
          <div className="mb-6 p-4 bg-green-50/80 border border-green-200 rounded-2xl flex items-start gap-3 text-green-800 text-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-green-600">Vehicle created. Redirecting...</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Vehicle Details */}
          <FormSection
            icon={Car}
            title="Vehicle Details"
            description="Basic information about the vehicle"
          >
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

          {/* Section 2: Specifications */}
          <FormSection
            icon={Settings2}
            title="Specifications"
            description="Technical specifications and classifications"
            collapsible
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Category"
                icon={Tag}
                isSelect
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </InputField>
              <InputField
                label="Fuel Type"
                icon={Fuel}
                isSelect
                name="fuelTypeId"
                value={formData.fuelTypeId}
                onChange={handleChange}
              >
                <option value="">Select Fuel Type</option>
                {fuelTypes.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </InputField>
              <InputField
                label="Transmission"
                icon={Settings2}
                isSelect
                name="transmissionId"
                value={formData.transmissionId}
                onChange={handleChange}
              >
                <option value="">Select Transmission</option>
                {transmissions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </InputField>
              <InputField
                label="Seats"
                icon={Users}
                type="number"
                name="seats"
                value={formData.seats}
                onChange={handleChange}
              />
              <InputField
                label="Luggage Capacity"
                icon={Briefcase}
                type="number"
                name="luggageCapacity"
                value={formData.luggageCapacity}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Section 3: Car Features */}
          <FormSection
            icon={CheckSquare}
            title="Vehicle Features"
            description="Select all features available on this vehicle"
          >
            {fetchingFeatures ? (
              <div className="flex items-center gap-2 py-4 text-xs text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin text-black" />
                <span>Loading available features...</span>
              </div>
            ) : availableFeatures.length === 0 ? (
              <p className="text-xs text-gray-400 py-2 italic">
                No vehicle features found.
              </p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableFeatures.map((feature) => {
                  const isChecked = selectedFeatures.includes(feature.name);
                  return (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => handleFeatureToggle(feature.name)}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer select-none ${
                        isChecked
                          ? "bg-black text-white border-black shadow-sm"
                          : "bg-gray-50/50 text-gray-700 border-gray-200 hover:bg-gray-100/80 hover:border-gray-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          isChecked
                            ? "bg-white border-white text-black"
                            : "bg-white border-gray-300"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-3" />}
                      </div>
                      <span className="text-xs font-medium tracking-wide truncate">
                        {feature.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </FormSection>

          {/* Section 4: Pricing */}
          <FormSection
            icon={DollarSign}
            title="Pricing & Rates"
            description="Set rental rates and deposit"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <InputField
                label="Price / Day"
                icon={DollarSign}
                type="number"
                name="pricePerDay"
                required
                value={formData.pricePerDay}
                onChange={handleChange}
                error={validationErrors.pricePerDay}
              />
              <InputField
                label="Price / Week"
                icon={DollarSign}
                type="number"
                name="pricePerWeek"
                value={formData.pricePerWeek}
                onChange={handleChange}
              />
              <InputField
                label="Price / Month"
                icon={DollarSign}
                type="number"
                name="pricePerMonth"
                value={formData.pricePerMonth}
                onChange={handleChange}
              />
              <InputField
                label="Security Deposit"
                icon={Shield}
                type="number"
                name="securityDeposit"
                value={formData.securityDeposit}
                onChange={handleChange}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200/60">
              <InputField
                label="Mileage Free (km)"
                icon={Gauge}
                type="number"
                name="mileageFree"
                value={formData.mileageFree}
                onChange={handleChange}
              />
              <InputField
                label="Extra Mileage Fee"
                icon={DollarSign}
                type="number"
                name="mileageExtraFee"
                step="0.01"
                value={formData.mileageExtraFee}
                onChange={handleChange}
              />
            </div>
          </FormSection>

          {/* Section 5: Image Gallery */}
          <FormSection
            icon={ImageIcon}
            title="Image Gallery"
            description="Upload vehicle images (drag & drop or click to browse)"
          >
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                isDragging
                  ? "border-black bg-black/5 scale-[1.01]"
                  : validationErrors.images
                  ? "border-red-300 bg-red-50/30"
                  : "border-gray-300 hover:border-gray-400 bg-gray-50/30"
              }`}
              onDrop={handleDrop}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />

              <div className="flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-black rounded-2xl mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Drop your images here
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  or click to browse • PNG, JPG, WEBP up to 10MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 inline mr-1.5" />
                  Add Images
                </button>
                <p className="text-[10px] text-gray-400 mt-3">
                  {images.length > 0
                    ? `${images.length} image(s) uploaded`
                    : "No images uploaded yet"}
                </p>
                {validationErrors.images && (
                  <p className="text-xs text-red-500 mt-2">{validationErrors.images}</p>
                )}
              </div>
            </div>

            {images.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Gallery ({images.length} images)
                  </p>
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-[10px] text-gray-500">
                      Click ★ to set as main
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border-2 transition-all duration-200 hover:shadow-lg"
                      style={{
                        borderColor: image.isMain ? "#000" : "transparent",
                      }}
                    >
                      <img
                        src={image.preview}
                        alt="Vehicle preview"
                        className="w-full h-full object-cover"
                      />

                      {image.uploadProgress !== undefined &&
                        image.uploadProgress < 100 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-12 h-12 rounded-full border-4 border-white/30 border-t-white animate-spin mx-auto mb-2" />
                              <p className="text-xs text-white font-medium">
                                {Math.round(image.uploadProgress)}%
                              </p>
                            </div>
                          </div>
                        )}

                      {image.isMain && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/90 backdrop-blur-sm rounded-lg">
                          <span className="text-[10px] font-medium text-white">
                            ★ Main
                          </span>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                        {!image.isMain && (
                          <button
                            type="button"
                            onClick={() => setMainImage(image.id)}
                            className="p-1.5 bg-white/90 hover:bg-white rounded-lg transition-colors duration-200"
                            title="Set as main image"
                          >
                            <Star className="w-4 h-4 text-gray-700" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="p-1.5 bg-red-500/90 hover:bg-red-500 rounded-lg transition-colors duration-200"
                          title="Remove image"
                        >
                          <Trash2 className="w-4 h-4 text-white" />
                        </button>
                      </div>

                      <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-lg">
                        <span className="text-[10px] font-medium text-white">
                          #{images.indexOf(image) + 1}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FormSection>

          {/* Section 6: Location */}
          <FormSection
            icon={MapPin}
            title="Location"
            description="Vehicle pickup location"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="City"
                icon={MapPin}
                type="text"
                name="locationCity"
                placeholder="e.g. Los Angeles"
                value={formData.locationCity}
                onChange={handleChange}
              />
              <InputField
                label="Address"
                icon={MapPin}
                type="text"
                name="locationAddress"
                placeholder="e.g. 123 Main St"
                value={formData.locationAddress}
                onChange={handleChange}
              />
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