"use client"

import { useEffect, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import Image from "next/image"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { format, isBefore, isPast } from "date-fns"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"

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
}

const requiredFields = [
  "opportunityType",
  "opportunitySubType",
  "visibility",
  "opportunityTitle",
  "organization",
  "startDate",
  "endDate",
  "aboutOpportunity",
]

const categoriesList = ["Tech", "Design", "Business", "AI", "Web", "Mobile"]

export default function HostPage() {
  const { data: session, status } = useSession()
  const [event, setEvent] = useState(defaultState)
  const [errors, setErrors] = useState({})
  const [previewImage, setPreviewImage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      toast.error("You must be logged in to host an event.")
      signIn("google")
    }
  }, [session, status])

  const handleChange = (e) => {
    const { name, value, type } = e.target

    if (name === "opportunityLogo") {
      const file = e.target.files[0]
      if (file) {
        if (file.size > 2 * 1024 * 1024) {
          toast.error("Image size should be less than 2MB")
          return
        }
        setPreviewImage(URL.createObjectURL(file))
        setEvent({ ...event, opportunityLogo: file })
        clearError(name)
      }
    } else if (name === "skills") {
      setEvent({ ...event, skills: value.split(",").map((s) => s.trim()) })
    } else {
      setEvent({ ...event, [name]: value })
      validateField(name, value)
    }
  }

  const handleSelectChange = (name, value) => {
    setEvent({ ...event, [name]: value })
    validateField(name, value)
  }

  const handleCategoryChange = (category, checked) => {
    let updated = [...event.categories]
    if (checked) {
      updated.push(category)
    } else {
      updated = updated.filter((cat) => cat !== category)
    }
    setEvent({ ...event, categories: updated })
    validateField("categories", updated)
  }

  const validateField = (name, value) => {
    const newErrors = { ...errors }
    delete newErrors[name]

    if (requiredFields.includes(name) && !value) {
      newErrors[name] = "This field is required"
    }

    if (name === "opportunityTitle" && value && /\d/.test(value)) {
      newErrors[name] = "No numbers allowed in title"
    }

    if (name === "organization" && value && /\d/.test(value)) {
      newErrors[name] = "No numbers allowed in organization"
    }

    if (name === "startDate" && value && isPast(new Date(value))) {
      newErrors[name] = "Start date cannot be in the past"
    }

    if (name === "endDate" && value && event.startDate && isBefore(new Date(value), new Date(event.startDate))) {
      newErrors[name] = "End date must be after start date"
    }

    if (name === "categories" && value.length === 0) {
      newErrors[name] = "Select at least one category"
    }

    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors = {}
    requiredFields.forEach((field) => {
      if (!event[field]) {
        newErrors[field] = "This field is required"
      }
    })

    if (event.categories.length === 0) {
      newErrors.categories = "Select at least one category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const clearError = (field) => {
    if (errors[field]) {
      const updated = { ...errors }
      delete updated[field]
      setErrors(updated)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fix all errors before submitting")
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.keys(event).forEach((key) => {
        if (key === "opportunityLogo" && event[key]) {
          formData.append("file", event[key])
        } else if (Array.isArray(event[key])) {
          formData.append(key, JSON.stringify(event[key]))
        } else {
          formData.append(key, event[key])
        }
      })

      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message || "Failed to submit")

      toast.success("Hackathon created successfully! Your hackathon is now live for participants to see!", {
        onClick: () => (window.location.href = `/events/${data.id}`),
        closeButton: true,
        closeOnClick: true,
      })

      setEvent(defaultState)
      setPreviewImage("")
    } catch (err) {
      toast.error(`Submission failed: ${err.message || "Something went wrong. Please try again."}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "loading") return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-blue-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* Toast Container with dark theme */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="bg-gray-800 text-white"
      />

      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Registration Details</h1>
          <p className="text-xl text-blue-300">Create an amazing experience for developers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-gray-900/80 rounded-xl shadow-2xl p-6 space-y-6 border border-gray-800 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Event Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-blue-300">Logo *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    name="opportunityLogo"
                    accept="image/*"
                    onChange={handleChange}
                    className="bg-gray-800/70 border-gray-700 text-white file:bg-blue-900/50 file:text-blue-200 file:border-0 hover:file:bg-blue-800/70"
                  />
                  {previewImage && (
                    <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-700">
                      <Image
                        src={previewImage || "/placeholder.svg"}
                        alt="Preview"
                        width={64}
                        height={64}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                </div>
                {errors.opportunityLogo && <p className="mt-1 text-sm text-red-400">{errors.opportunityLogo}</p>}
              </div>

              {/* Title & Organization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-blue-300">Title *</Label>
                  <Input
                    name="opportunityTitle"
                    value={event.opportunityTitle}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600 placeholder:text-gray-500"
                    placeholder="HackSphere Challenge"
                  />
                  {errors.opportunityTitle && <p className="mt-1 text-sm text-red-400">{errors.opportunityTitle}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-300">Organization *</Label>
                  <Input
                    name="organization"
                    value={event.organization}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600 placeholder:text-gray-500"
                    placeholder="HackSphere"
                  />
                  {errors.organization && <p className="mt-1 text-sm text-red-400">{errors.organization}</p>}
                </div>
              </div>

              {/* Type/Subtype */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-blue-300">Type *</Label>
                  <Select
                    value={event.opportunityType}
                    onValueChange={(value) => handleSelectChange("opportunityType", value)}
                  >
                    <SelectTrigger className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="hackathon">Hackathon</SelectItem>
                      <SelectItem value="workshop">Workshop</SelectItem>
                      <SelectItem value="webinar">Webinar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-300">Sub Type *</Label>
                  <Input
                    name="opportunitySubType"
                    value={event.opportunitySubType}
                    onChange={handleChange}
                    onBlur={(e) => validateField(e.target.name, e.target.value)}
                    className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600 placeholder:text-gray-500"
                    placeholder="Beginner, Online, etc."
                  />
                  {errors.opportunitySubType && (
                    <p className="mt-1 text-sm text-red-400">{errors.opportunitySubType}</p>
                  )}
                </div>
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Start Date */}
                <div className="space-y-2">
                  <Label className="text-blue-300">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800/70 hover:bg-gray-800 border border-gray-700",
                          !event.startDate && "text-gray-400",
                          errors.startDate && "border-red-500",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-300" />
                        {event.startDate ? format(event.startDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
                      <Calendar
                        mode="single"
                        selected={event.startDate}
                        onSelect={(date) => {
                          if (!date) return
                          if (isPast(date)) {
                            setErrors((prev) => ({ ...prev, startDate: "Start date cannot be in the past" }))
                            return
                          }
                          setEvent((prev) => ({ ...prev, startDate: date }))
                          setErrors((prev) => ({ ...prev, startDate: "" }))
                        }}
                        className="bg-gray-900 text-white"
                        styles={{
                          head_cell: {
                            width: "100%",
                            textAlign: "center",
                            padding: "0.5rem 0",
                          },
                        }}
                        classNames={{
                          head_cell: "text-center w-9 font-normal text-sm text-blue-300",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          day_selected:
                            "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
                          day_today: "bg-gray-800 text-white",
                          day_outside: "text-gray-500 opacity-50",
                          table: "border-collapse space-y-1",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.startDate && <p className="mt-1 text-sm text-red-400">{errors.startDate}</p>}
                </div>

                {/* End Date */}
                <div className="space-y-2">
                  <Label className="text-blue-300">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-800/70 hover:bg-gray-800 border border-gray-700",
                          !event.endDate && "text-gray-400",
                          errors.endDate && "border-red-500",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-blue-300" />
                        {event.endDate ? format(event.endDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-gray-900 border border-gray-700 rounded-md shadow-lg">
                      <Calendar
                        mode="single"
                        selected={event.endDate}
                        onSelect={(date) => {
                          if (!date) return
                          if (!event.startDate) {
                            setErrors((prev) => ({ ...prev, endDate: "Select start date first" }))
                            return
                          }
                          if (isBefore(date, event.startDate)) {
                            setErrors((prev) => ({ ...prev, endDate: "End date must be after start date" }))
                            return
                          }
                          setEvent((prev) => ({ ...prev, endDate: date }))
                          setErrors((prev) => ({ ...prev, endDate: "" }))
                        }}
                        className="bg-gray-900 text-white"
                        styles={{
                          head_cell: {
                            width: "100%",
                            textAlign: "center",
                            padding: "0.5rem 0",
                          },
                        }}
                        classNames={{
                          head_cell: "text-center w-9 font-normal text-sm text-blue-300",
                          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                          day_selected:
                            "bg-blue-600 text-white hover:bg-blue-700 hover:text-white focus:bg-blue-700 focus:text-white",
                          day_today: "bg-gray-800 text-white",
                          day_outside: "text-gray-500 opacity-50",
                          table: "border-collapse space-y-1",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.endDate && <p className="mt-1 text-sm text-red-400">{errors.endDate}</p>}
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <Label className="text-blue-300">Categories *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                  {categoriesList.map((cat) => (
                    <div key={cat} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${cat}`}
                        checked={event.categories.includes(cat)}
                        onCheckedChange={(checked) => handleCategoryChange(cat, checked)}
                        className="border-gray-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                      />
                      <label
                        htmlFor={`category-${cat}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                      >
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
                {errors.categories && <p className="mt-1 text-sm text-red-400">{errors.categories}</p>}
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label className="text-blue-300">Skills (comma separated)</Label>
                <Input
                  name="skills"
                  value={event.skills.join(", ")}
                  onChange={handleChange}
                  className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600 placeholder:text-gray-500"
                  placeholder="JavaScript, React, Firebase"
                />
              </div>

              {/* About */}
              <div className="space-y-2">
                <Label className="text-blue-300">About Hackathon *</Label>
                <Textarea
                  name="aboutOpportunity"
                  rows={5}
                  value={event.aboutOpportunity}
                  onChange={handleChange}
                  onBlur={(e) => validateField(e.target.name, e.target.value)}
                  className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600 placeholder:text-gray-500 min-h-[120px]"
                  placeholder="Describe your hackathon in detail..."
                />
                {errors.aboutOpportunity && <p className="mt-1 text-sm text-red-400">{errors.aboutOpportunity}</p>}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <Label className="text-blue-300">Website URL</Label>
                <Input
                  name="websiteUrl"
                  value={event.websiteUrl}
                  onChange={handleChange}
                  className="bg-gray-800/70 border-gray-700 text-white focus:ring-blue-600 placeholder:text-gray-500"
                  placeholder="https://hackyourfuture.com"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-6 bg-blue-800 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating Hackathon...
                    </span>
                  ) : (
                    "Create Hackathon"
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Preview Section */}
          <div className="bg-gray-900/80 rounded-xl shadow-2xl p-6 border border-gray-800 backdrop-blur-sm">
            <h2 className="text-2xl font-semibold text-white mb-6">Mobile Preview</h2>
            <Card className="bg-gray-800/70 border-gray-700 overflow-hidden shadow-inner">
              {previewImage ? (
                <div className="relative h-48 w-full">
                  <Image src={previewImage || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="h-48 bg-gray-700/50 flex items-center justify-center border-b border-gray-700">
                  <span className="text-gray-400">Event logo will appear here</span>
                </div>
              )}
              <CardContent className="p-4 space-y-3">
                <h3 className="text-xl font-bold text-white">{event.opportunityTitle || "Your Hackathon Title"}</h3>
                <p className="text-blue-300">{event.organization || "Your Organization"}</p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  {event.startDate && <span>{format(new Date(event.startDate), "MMM d")}</span>}
                  {event.startDate && event.endDate && <span>-</span>}
                  {event.endDate && <span>{format(new Date(event.endDate), "MMM d, yyyy")}</span>}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

