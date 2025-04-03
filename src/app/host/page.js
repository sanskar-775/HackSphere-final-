"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react"; // useSession hook from next-auth for session management
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
  const { data: session, status } = useSession(); // Get session data using useSession
  const [event, setEvent] = useState(defaultState);
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect to login if no session
  useEffect(() => {
    if (status === "loading") return; // Wait for session loading
    if (!session) {
      toast.error("You must be logged in to host an event.");
      signIn("google"); // Redirect to login page
    }
  }, [session, status]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    if (name === "opportunityLogo") {
      const file = e.target.files[0];
      if (file) {
        setPreviewImage(URL.createObjectURL(file));
        setEvent({ ...event, opportunityLogo: file });
        clearError(name);
      }
    } else if (name === "skills") {
      setEvent({ ...event, skills: value.split(",").map((s) => s.trim()) });
    } else {
      setEvent({ ...event, [name]: value });
    }
    clearError(name);
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
  };

  const validate = () => {
    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!event[field]) {
        newErrors[field] = "Required";
      }
    });

    if (event.opportunityTitle && /\d/.test(event.opportunityTitle)) {
      newErrors.opportunityTitle = "No numbers allowed";
    }
    if (event.organization && /\d/.test(event.organization)) {
      newErrors.organization = "No numbers allowed";
    }

    if (event.startDate && event.endDate && new Date(event.startDate) > new Date(event.endDate)) {
      newErrors.endDate = "End date must be after start date";
    }

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
    if (!validate()) return;

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

      toast.success("🎉 Hackathon submitted successfully!");

      setSuccess(true);
      setEvent(defaultState);
      setPreviewImage("");
    } catch (err) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") return null; // Wait for session to load

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <h1 className="text-3xl font-bold text-center mb-6">Host Your Hackathon</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 bg-base-100 p-6 rounded-xl shadow-md">
        {/* Logo Upload */}
        <div>
          <label className="label">Logo *</label>
          <input type="file" name="opportunityLogo" accept="image/*" onChange={handleChange} className="file-input w-full" />
          {errors.opportunityLogo && <p className="text-error">{errors.opportunityLogo}</p>}
        </div>

        {/* Title & Org */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Title *</label>
            <input
              name="opportunityTitle"
              value={event.opportunityTitle}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="HackSphere Challenge"
            />
            {errors.opportunityTitle && <p className="text-error">{errors.opportunityTitle}</p>}
          </div>
          <div>
            <label className="label">Organization *</label>
            <input
              name="organization"
              value={event.organization}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="HackSphere"
            />
            {errors.organization && <p className="text-error">{errors.organization}</p>}
          </div>
        </div>

        {/* Type/Subtype */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Type *</label>
            <select name="opportunityType" value={event.opportunityType} onChange={handleChange} className="select w-full">
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="webinar">Webinar</option>
            </select>
          </div>
          <div>
            <label className="label">Sub Type *</label>
            <input
              name="opportunitySubType"
              value={event.opportunitySubType}
              onChange={handleChange}
              className="input input-bordered w-full"
              placeholder="Beginner, Online, etc."
            />
            {errors.opportunitySubType && <p className="text-error">{errors.opportunitySubType}</p>}
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Start Date */}
          <div>
            <label className="label">Start Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="input input-bordered w-full text-left">
                  {event.startDate ? format(new Date(event.startDate), "PPP") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
                />
              </PopoverContent>
            </Popover>
            {errors.startDate && <p className="text-error">{errors.startDate}</p>}
          </div>

          {/* End Date */}
          <div>
            <label className="label">End Date *</label>
            <Popover>
              <PopoverTrigger asChild>
                <button type="button" className="input input-bordered w-full text-left">
                  {event.endDate ? format(new Date(event.endDate), "PPP") : "Pick a date"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
                />
              </PopoverContent>
            </Popover>
            {errors.endDate && <p className="text-error">{errors.endDate}</p>}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="label">Categories *</label>
          <div className="flex flex-wrap gap-3">
            {categoriesList.map((cat) => (
              <label key={cat} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  value={cat}
                  checked={event.categories.includes(cat)}
                  onChange={handleCategoryChange}
                  className="checkbox checkbox-sm"
                />
                {cat}
              </label>
            ))}
          </div>
          {errors.categories && <p className="text-error">{errors.categories}</p>}
        </div>

        {/* Skills */}
        <div>
          <label className="label">Skills (comma separated)</label>
          <input
            name="skills"
            value={event.skills.join(", ")}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="JavaScript, React, Firebase"
          />
        </div>

        {/* About */}
        <div>
          <label className="label">About Hackathon *</label>
          <textarea
            name="aboutOpportunity"
            rows={5}
            value={event.aboutOpportunity}
            onChange={handleChange}
            className="textarea textarea-bordered w-full"
          />
          {errors.aboutOpportunity && <p className="text-error">{errors.aboutOpportunity}</p>}
        </div>

        {/* Website */}
        <div>
          <label className="label">Website URL</label>
          <input
            name="websiteUrl"
            value={event.websiteUrl}
            onChange={handleChange}
            className="input input-bordered w-full"
            placeholder="https://hackyourfuture.com"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button type="submit" className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}>
            {isSubmitting ? "Submitting..." : "Submit Hackathon"}
          </button>
        </div>
      </form>

      {/* 📱 Mobile Preview */}
      <div className="max-w-xl mx-auto mt-10">
        <h3 className="text-xl font-semibold text-center mb-4">📱 Preview</h3>
        <div className="card bg-base-100 shadow-xl">
          {previewImage && (
            <figure>
              <Image src={previewImage} alt="Preview" width={600} height={300} className="w-full h-52 object-cover" />
            </figure>
          )}
          <div className="card-body">
            <h2 className="card-title">{event.opportunityTitle || "Hackathon Title"}</h2>
            <p>{event.organization || "Organization"}</p>
            <p className="text-sm text-gray-400">
              {event.startDate} - {event.endDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
