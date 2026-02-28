"use client";

import { useState } from "react";
import { X, AlertCircle, Upload } from "lucide-react";
import { toast } from "sonner";

interface TournamentFormData {
  name: string;
  description: string;
  category: string;
  city: string;
  province: string;
  venue: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  maxTeams: number;
  format: "group_stage" | "knockout" | "hybrid";
  logoFile?: File;
  logoPreview?: string;
}

interface TournamentCreateFormProps {
  onSubmit: (formData: any) => void;
  onClose: () => void;
}

const TournamentCreateForm = ({ onSubmit, onClose }: TournamentCreateFormProps) => {
  const [formData, setFormData] = useState<TournamentFormData>({
    name: "",
    description: "",
    category: "U-16",
    city: "",
    province: "",
    venue: "",
    registrationDeadline: "",
    startDate: "",
    endDate: "",
    maxTeams: 16,
    format: "hybrid",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDragging, setIsDragging] = useState(false);

  const indonesianProvinces = [
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "Jawa Timur",
    "Banten",
    "Yogyakarta",
    "Bali",
    "Sumatera Utara",
    "Sumatera Barat",
    "Riau",
  ];

  const indonesianCities: Record<string, string[]> = {
    "DKI Jakarta": ["Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat"],
    "Jawa Barat": ["Bandung", "Bekasi", "Depok", "Bogor"],
    "Jawa Tengah": ["Semarang", "Solo", "Yogyakarta"],
    "Jawa Timur": ["Surabaya", "Malang", "Sidoarjo"],
    Banten: ["Tangerang", "Serang", "Cilegon"],
    Yogyakarta: ["Yogyakarta"],
    Bali: ["Denpasar", "Ubud"],
    "Sumatera Utara": ["Medan", "Binjai"],
    "Sumatera Barat": ["Padang", "Pariaman"],
    Riau: ["Pekanbaru", "Dumai"],
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = "Tournament name must be at least 3 characters";
    }
    if (formData.name && formData.name.length > 100) {
      newErrors.name = "Tournament name must be less than 100 characters";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.province) {
      newErrors.province = "Province is required";
    }
    if (!formData.city) {
      newErrors.city = "City is required";
    }
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "Registration deadline is required";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }
    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }
    if (formData.maxTeams < 4) {
      newErrors.maxTeams = "Max teams must be at least 4";
    }
    if (formData.maxTeams > 128) {
      newErrors.maxTeams = "Max teams must be 128 or less";
    }

    // Date validations
    if (formData.registrationDeadline && formData.startDate) {
      if (new Date(formData.registrationDeadline) >= new Date(formData.startDate)) {
        newErrors.registrationDeadline = "Registration deadline must be before start date";
      }
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof TournamentFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleProvinceChange = (province: string) => {
    handleChange("province", province);
    handleChange("city", ""); // Reset city when province changes
  };

  const handleLogoUpload = (file: File) => {
    // Validate file type
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Logo must be PNG or JPG format");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Logo must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setFormData((prev) => ({
        ...prev,
        logoFile: file,
        logoPreview: e.target?.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleLogoUpload(files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    onSubmit(formData);
    toast.success("Tournament created successfully!");
    onClose();
  };

  const currentCities = formData.province ? indonesianCities[formData.province] : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="text-lg font-oswald font-bold text-foreground uppercase tracking-wider">Create Tournament</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-muted/30 hover:bg-muted/50 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tournament Name */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
              Tournament Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="e.g., Piala Indonesia U-16 2026"
              className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                errors.name ? "border-destructive/50" : "border-border/50"
              }`}
            />
            {errors.name && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value.slice(0, 500))}
              placeholder="Tournament description and rules..."
              className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground resize-none h-20 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
            <p className="text-[9px] font-montserrat text-muted-foreground mt-1">{formData.description.length}/500</p>
          </div>

          {/* Category and Format Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                Category <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                  errors.category ? "border-destructive/50" : "border-border/50"
                }`}
              >
                <option value="U-12">U-12</option>
                <option value="U-15">U-15</option>
                <option value="U-16">U-16</option>
                <option value="U-17">U-17</option>
                <option value="U-18">U-18</option>
                <option value="Open">Open</option>
              </select>
              {errors.category && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                Format <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.format}
                onChange={(e) => handleChange("format", e.target.value)}
                className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
              >
                <option value="group_stage">Group Stage</option>
                <option value="knockout">Knockout</option>
                <option value="hybrid">Hybrid (Group + Knockout)</option>
              </select>
            </div>
          </div>

          {/* Province and City Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                Province <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.province}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                  errors.province ? "border-destructive/50" : "border-border/50"
                }`}
              >
                <option value="">Select province...</option>
                {indonesianProvinces.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
              {errors.province && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.province}</p>}
            </div>

            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                City <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.city}
                onChange={(e) => handleChange("city", e.target.value)}
                disabled={!formData.province}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.city ? "border-destructive/50" : "border-border/50"
                }`}
              >
                <option value="">Select city...</option>
                {currentCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              {errors.city && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">Venue</label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => handleChange("venue", e.target.value)}
              placeholder="e.g., Stadion Gelora Bung Karno"
              className="w-full bg-muted/20 border border-border/50 rounded-lg px-3 py-2 text-xs font-montserrat text-foreground placeholder:text-muted-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
            />
          </div>

          {/* Dates Row */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                Registration Deadline <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.registrationDeadline}
                onChange={(e) => handleChange("registrationDeadline", e.target.value)}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                  errors.registrationDeadline ? "border-destructive/50" : "border-border/50"
                }`}
              />
              {errors.registrationDeadline && (
                <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.registrationDeadline}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                Start Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                  errors.startDate ? "border-destructive/50" : "border-border/50"
                }`}
              />
              {errors.startDate && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
                End Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                  errors.endDate ? "border-destructive/50" : "border-border/50"
                }`}
              />
              {errors.endDate && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Max Teams */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">
              Max Teams <span className="text-destructive">*</span>
            </label>
            <input
              type="number"
              value={formData.maxTeams}
              onChange={(e) => handleChange("maxTeams", parseInt(e.target.value) || 0)}
              min="4"
              max="128"
              className={`w-full bg-muted/20 border rounded-lg px-3 py-2 text-xs font-montserrat text-foreground outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30 transition-colors ${
                errors.maxTeams ? "border-destructive/50" : "border-border/50"
              }`}
            />
            {errors.maxTeams && <p className="text-[9px] font-montserrat text-destructive mt-1">{errors.maxTeams}</p>}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="text-xs font-montserrat font-medium text-foreground block mb-1">Tournament Logo</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                isDragging ? "border-accent/50 bg-accent/10" : "border-border/50 bg-muted/20 hover:border-border/30"
              }`}
            >
              {formData.logoPreview ? (
                <div className="space-y-2">
                  <img src={formData.logoPreview} alt="Logo preview" className="w-24 h-24 mx-auto rounded-lg object-cover" />
                  <p className="text-[9px] font-montserrat text-muted-foreground">{formData.logoFile?.name}</p>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, logoFile: undefined, logoPreview: undefined }))}
                    className="text-[9px] font-montserrat text-destructive hover:text-destructive/80"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-[9px] font-montserrat font-medium text-foreground">Drag and drop logo here</p>
                  <p className="text-[9px] font-montserrat text-muted-foreground">or click to browse (PNG/JPG, max 5MB)</p>
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleLogoUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="inline-block text-[9px] font-montserrat text-accent cursor-pointer hover:text-accent/80">
                    Browse files
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-[9px] font-montserrat text-blue-500">
                After creating the tournament, you'll be able to: generate brackets, setup province qualifiers, and manage team registrations.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-border/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold text-foreground bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-xs font-montserrat font-bold bg-accent text-background hover:bg-accent/90 transition-colors"
            >
              Create Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentCreateForm;
