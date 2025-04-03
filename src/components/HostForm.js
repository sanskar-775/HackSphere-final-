"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, isBefore, isPast } from "date-fns";

const defaultState = {
  opportunityLogo: null,
  opportunityType: "hackathon",
  opportunitySubType: "",
  visibility: "public",
  opportunityTitle: "",
  organization: "",
  websiteUrl: "",
  festival: "",
  startDate: "",
  endDate: "",
  categories: [],
  skills: [],
  aboutOpportunity: "",
};

const requiredFields = [
  "opportunityType",
  "opportunitySubType",
  "visibility",
  "opportunityTitle",
  "organization",
  "startDate",
  "endDate",
  "aboutOpportunity",
];

const categoriesList = ["Tech", "Design", "Business", "AI", "Web", "Mobile"];

export default function HostPage() {
  const { data: session, status } = useSession();
  const [event, setEvent] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      toast.error("You must be logged in to host an event.");
      signIn("google");
    }
  }, [session, status]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name === "opportunityLogo") {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Image size should be less than 2MB");
          return;
        }
        setPreviewImage(URL.createObjectURL(file));
        setEvent({ ...event, opportunityLogo: file });
        clearError(name);
      }
    } else if (name === "skills") {
      setEvent({ ...event, skills: value.split(",").map((s) => s.trim()) });
    } else {
      setEvent({ ...event, [name]: value });
      // On-spot validation
      validateField(name, value);
    }
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    let updated = [...event.categories];
    if (checked) {
      updated.push(value);
    } else {
      updated = updated.filter((cat) => cat !== value);
    }
    setEvent({ ...event, categories: updated });
    validateField("categories", updated);
  };

  const validateField = (name, value) => {
    const newErrors = { ...errors };
    delete newErrors[name];

    if (requiredFields.includes(name) && !value) {
      newErrors[name] = "This field is required";
    }

    if (name === "opportunityTitle" && value && /\d/.test(value)) {
      newErrors[name] = "No numbers allowed in title";
    }

    if (name === "organization" && value && /\d/.test(value)) {
      newErrors[name] = "No numbers allowed in organization";
    }

    if (name === "startDate" && value && isPast(new Date(value))) {
      newErrors[name] = "Start date cannot be in the past";
    }

    if (name === "endDate" && value && event.startDate && isBefore(new Date(value), new Date(event.startDate))) {
      newErrors[name] = "End date must be after start date";
    }

    if (name === "categories" && value.length === 0) {
      newErrors[name] = "Select at least one category";
    }

    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!event[field]) {
        newErrors[field] = "This field is required";
      }
    });

    if (event.categories.length === 0) {
      newErrors.categories = "Select at least one category";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearError = (field) => {
    if (errors[field]) {
      const updated = { ...errors };
      delete updated[field];
      setErrors(updated);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(event).forEach((key) => {
        if (key === "opportunityLogo" && event[key]) {
          formData.append("file", event[key]);
        } else if (Array.isArray(event[key])) {
          formData.append(key, JSON.stringify(event[key]));
        } else {
          formData.append(key, event[key]);
        }
      });

      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to submit");

      toast.success("Hackathon created successfully!", {
        description: "Your hackathon is now live for participants to see!",
        action: {
          label: "View",
          onClick: () => window.location.href = `/events/${data.id}`,
        },
      });

      setEvent(defaultState);
      setPreviewImage("");
    } catch (err) {
      toast.error("Submission failed", {
        description: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Host Your Hackathon</h1>
          <p className="text-xl text-blue-200">Create an amazing experience for developers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 space-y-6 border border-gray-800">
            <h2 className="text-2xl font-semibold text-white mb-6">Event Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200">Logo *</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    name="opportunityLogo" 
                    accept="image/*" 
                    onChange={handleChange}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-800 file:text-white
                      hover:file:bg-blue-700"
                  />
                  {previewImage && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-700">
                      <Image 
                        src={previewImage} 
                        alt="Preview" 
                        width={64} 
                        height={64} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
                {errors.opportunityLogo && (
                  <p className="mt-1 text-sm text-red-400">{errors.opportunityLogo}</p>
                )}
              </div>

              {/* Title & Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">Title *</label>
                  <input
                    name="opportunityTitle"
                    value={event.opportunityTitle}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="HackSphere Challenge"
                  />
                  {errors.opportunityTitle && (
                    <p className="mt-1 text-sm text-red-400">{errors.opportunityTitle}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">Organization *</label>
                  <input
                    name="organization"
                    value={event.organization}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="HackSphere"
                  />
                  {errors.organization && (
                    <p className="mt-1 text-sm text-red-400">{errors.organization}</p>
                  )}
                </div>
              </div>

              {/* Type/Subtype */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">Type *</label>
                  <select 
                    name="opportunityType" 
                    value={event.opportunityType} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="hackathon">Hackathon</option>
                    <option value="workshop">Workshop</option>
                    <option value="webinar">Webinar</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">Sub Type *</label>
                  <input
                    name="opportunitySubType"
                    value={event.opportunitySubType}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Beginner, Online, etc."
                  />
                  {errors.opportunitySubType && (
                    <p className="mt-1 text-sm text-red-400">{errors.opportunitySubType}</p>
                  )}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">Start Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`w-full px-4 py-2 bg-gray-800 border ${errors.startDate ? "border-red-500" : "border-gray-700"} rounded-md text-left text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        {event.startDate ? format(new Date(event.startDate), "PPP") : "Select a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border border-gray-700 rounded-md">
                      <Calendar
                        mode="single"
                        selected={event.startDate ? new Date(event.startDate) : undefined}
                        onSelect={(date) => {
                          if (isPast(date)) {
                            setErrors((prev) => ({ ...prev, startDate: "Start date cannot be in the past" }));
                            return;
                          }
                          setEvent({ ...event, startDate: date.toISOString() });
                          clearError("startDate");
                        }}
                        className="bg-gray-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>
                  )}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-blue-200">End Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={`w-full px-4 py-2 bg-gray-800 border ${errors.endDate ? "border-red-500" : "border-gray-700"} rounded-md text-left text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      >
                        {event.endDate ? format(new Date(event.endDate), "PPP") : "Select a date"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-800 border border-gray-700 rounded-md">
                      <Calendar
                        mode="single"
                        selected={event.endDate ? new Date(event.endDate) : undefined}
                        onSelect={(date) => {
                          if (!event.startDate || isBefore(date, new Date(event.startDate))) {
                            setErrors((prev) => ({ ...prev, endDate: "End date must be after start date" }));
                            return;
                          }
                          setEvent({ ...event, endDate: date.toISOString() });
                          clearError("endDate");
                        }}
                        className="bg-gray-800 text-white"
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && (
                    <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200">Categories *</label>
                <div className="flex flex-wrap gap-3">
                  {categoriesList.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        value={cat}
                        checked={event.categories.includes(cat)}
                        onChange={handleCategoryChange}
                        className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500"
                      />
                      {cat}
                    </label>
                  ))}
                </div>
                {errors.categories && (
                  <p className="mt-1 text-sm text-red-400">{errors.categories}</p>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200">Skills (comma separated)</label>
                <input
                  name="skills"
                  value={event.skills.join(", ")}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="JavaScript, React, Firebase"
                />
              </div>

              {/* About */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200">About Hackathon *</label>
                <textarea
                  name="aboutOpportunity"
                  rows={5}
                  value={event.aboutOpportunity}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.aboutOpportunity && (
                  <p className="mt-1 text-sm text-red-400">{errors.aboutOpportunity}</p>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-blue-200">Website URL</label>
                <input
                  name="websiteUrl"
                  value={event.websiteUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://hackyourfuture.com"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-blue-700 hover:bg-blue-600 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Hackathon...
                    </span>
                  ) : (
                    "Create Hackathon"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 border border-gray-800">
            <h2 className="text-2xl font-semibold text-white mb-6">Mobile Preview</h2>
            <div className="bg-gray-800 rounded-lg overflow-hidden shadow-inner">
              {previewImage ? (
                <div className="relative h-48 w-full">
                  <Image 
                    src={previewImage} 
                    alt="Preview" 
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gray-700 flex items-center justify-center">
                  <span className="text-gray-400">Event logo will appear here</span>
                </div>
              )}
              <div className="p-4 space-y-3">
                <h3 className="text-xl font-bold text-white">
                  {event.opportunityTitle || "Your Hackathon Title"}
                </h3>
                <p className="text-blue-300">
                  {event.organization || "Your Organization"}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {event.startDate && (
                    <span>{format(new Date(event.startDate), "MMM d")}</span>
                  )}
                  {event.startDate && event.endDate && (
                    <span>-</span>
                  )}
                  {event.endDate && (
                    <span>{format(new Date(event.endDate), "MMM d, yyyy")}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {event.categories.map((cat) => (
                    <span key={cat} className="px-3 py-1 bg-blue-900/50 text-blue-200 rounded-full text-xs">
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 line-clamp-3">
                  {event.aboutOpportunity || "Description of your hackathon will appear here..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}