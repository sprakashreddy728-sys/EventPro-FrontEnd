import { useState, useEffect, useCallback } from "react";

// ----------------- STEP COMPONENTS (moved outside) -----------------

function Step1({ form, setForm, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-red-600">Step 1: Create Event</h3>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Title
        </label>
        <input
          type="text"
          value={form.title}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Enter event title"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {errors.title && (
          <div className="text-xs text-red-600 mt-1">{errors.title}</div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
          {form.image ? (
            <div className="space-y-3">
              <img
                src={form.image}
                alt="Event preview"
                className="w-full h-48 object-cover rounded"
              />
              <button
                onClick={() => setForm((prev) => ({ ...prev, image: "" }))}
                type="button"
                className="px-3 py-1 bg-red-100 text-red-600 rounded text-sm hover:bg-red-200"
              >
                Remove Image
              </button>
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center gap-2">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-700">
                Click to upload event image
              </span>
              <span className="text-xs text-gray-500">PNG, JPG up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setForm((prev) => ({
                        ...prev,
                        image: event.target?.result,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Event description"
          rows={4}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {errors.description && (
          <div className="text-xs text-red-600 mt-1">{errors.description}</div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Date
          </label>
          <input
            type="date"
            value={form.date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.date && (
            <div className="text-xs text-red-600 mt-1">{errors.date}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Time
          </label>
          <input
            type="time"
            value={form.time}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, time: e.target.value }))
            }
            className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          {errors.time && (
            <div className="text-xs text-red-600 mt-1">{errors.time}</div>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Venue Name
        </label>
        <input
          type="text"
          value={form.venue}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, venue: e.target.value }))
          }
          placeholder="Enter venue name"
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        {errors.venue && (
          <div className="text-xs text-red-600 mt-1">{errors.venue}</div>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Event Genre/Category
        </label>
        <select
          value={form.category || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, category: e.target.value }))
          }
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="">Select a category</option>
          <option value="Music">Music</option>
          <option value="Conference">Conference</option>
          <option value="Theater">Theater</option>
        </select>
        {errors.category && (
          <div className="text-xs text-red-600 mt-1">{errors.category}</div>
        )}
      </div>
    </div>
  );
}

function Step2({ form, setForm, uploadError, handleFileUpload }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-red-600">
        Step 2: Upload Venue Layout
      </h3>
      <p className="text-sm text-gray-600">
        Upload a JSON file containing your venue's seating structure
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          type="file"
          accept="application/json"
          onChange={(e) => handleFileUpload(e.target.files?.[0])}
          className="hidden"
          id="layout-upload"
        />

        <label
          htmlFor="layout-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="text-sm font-semibold text-gray-700">
            Click to upload JSON file
          </span>
        </label>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          ⚠ {uploadError}
        </div>
      )}

      {form.layout && (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-sm text-green-700 font-semibold">
            ✓ Layout uploaded successfully
          </p>
          <p className="text-xs text-green-600 mt-1">
            Capacity: {form.capacity} seats
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded border border-gray-200">
        <p className="text-xs text-gray-600 mb-2">
          <strong>Expected JSON format:</strong>
        </p>
        <pre className="text-xs bg-white p-2 rounded overflow-auto border border-gray-200">
          {`{
  "rows": 10,
  "cols": 12,
  "seats": [
    { "id": "A1", "row": "A", "col": 1, "type": "normal", "taken": false }
  ]
}`}
        </pre>
      </div>
    </div>
  );
}

function Step3({ form, setForm }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-red-600">
        Step 3: Set Pricing Per Section
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {["vip", "normal", "balcony"].map((section) => (
          <div key={section}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {section.toUpperCase()} Section Price
            </label>

            <div className="flex items-center">
              <span className="text-lg text-gray-500">₹</span>
              <input
                type="text"
                value={form.prices[section]}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    prices: {
                      ...prev.prices,
                      [section]: e.target.value,
                    },
                  }))
                }
                placeholder="Enter price"
                className="w-full border border-gray-300 p-3 rounded ml-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-red-600">
        Step 5: Manage Refunds/Cancellations
      </h3>

      <div className="space-y-3">
        <div className="p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 cursor-pointer transition">
          <div className="flex items-center gap-3">
            <input type="radio" name="refund-policy" id="full-refund" />
            <label htmlFor="full-refund" className="flex-1 cursor-pointer">
              <p className="font-semibold text-gray-900">Full Refund</p>
              <p className="text-xs text-gray-600">
                100% refund up to 7 days before event
              </p>
            </label>
          </div>
        </div>

        <div className="p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 cursor-pointer transition">
          <div className="flex items-center gap-3">
            <input type="radio" name="refund-policy" id="partial-refund" />
            <label htmlFor="partial-refund" className="flex-1 cursor-pointer">
              <p className="font-semibold text-gray-900">Partial Refund</p>
              <p className="text-xs text-gray-600">50% refund before 3 days</p>
            </label>
          </div>
        </div>

        <div className="p-4 border-2 border-gray-300 rounded-lg hover:border-red-500 cursor-pointer transition">
          <div className="flex items-center gap-3">
            <input type="radio" name="refund-policy" id="no-refund" />
            <label htmlFor="no-refund" className="flex-1 cursor-pointer">
              <p className="font-semibold text-gray-900">No Refund</p>
              <p className="text-xs text-gray-600">No refund within 3 days</p>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------- MAIN COMPONENT -----------------

export default function EventFormFlow({ ev = null, onCancel, onSave }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() =>
    ev
      ? { ...ev }
      : {
          title: "",
          description: "",
          date: "",
          time: "",
          venue: "",
          category: "", // Added category field
          image: "",
          capacity: 100,
          layout: null,
          prices: { vip: 0, normal: 0, balcony: 0 },
          ticketsSold: 0,
          totalPrice: 0,
          status: "pending", // pending, approved, rejected
        }
  );
  const [uploadError, setUploadError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (ev) {
      setForm({ ...ev });
      setStep(1);
    }
  }, [ev]);

  const handleFileUpload = useCallback((file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        setForm((f) => ({
          ...f,
          layout: json,
          capacity: json.rows * json.cols || json.seats?.length || f.capacity,
          prices: json.prices || f.prices,
        }));
        setUploadError("");
      } catch (err) {
        setUploadError(
          "Invalid JSON file. Please upload a valid seating layout."
        );
      }
    };
    reader.readAsText(file);
  }, []);

  // Validation for Step 1
  const validateStep1 = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = "Event title is required";
    if (!form.description.trim())
      newErrors.description = "Description is required";
    if (!form.date.trim()) newErrors.date = "Date is required";
    if (!form.time.trim()) newErrors.time = "Time is required";
    if (!form.venue.trim()) newErrors.venue = "Venue is required";
    if (!form.category.trim()) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Only 2 steps: 1-Create, 2-Refunds
  const totalSteps = 2;

  const handleNext = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    }
    setStep((s) => Math.min(totalSteps, s + 1));
  };

  const handlePrev = () => setStep((s) => Math.max(1, s - 1));
  const handleSave = () => onSave(form);
  // Combine date and time into ISO string for backend
  const handleSaveWithDateTime = () => {
    let combined = { ...form };

    if (form.date && form.time) {
      const localDateTime = new Date(`${form.date}T${form.time}`);
      const utcDateTime = new Date(
        localDateTime.getTime() - localDateTime.getTimezoneOffset() * 60000
      );

      combined.date = utcDateTime.toISOString().slice(0, 19); // remove timezone Z
      combined.time = form.time; // keep as reference if needed
    }

    onSave(combined);
  };

  return (
    <div>
      {/* progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full mx-1 transition ${
                s <= step ? "bg-red-600" : "bg-gray-300"
              }`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>Create Event</span>
          <span>Refunds</span>
        </div>
      </div>

      {/* step content */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 min-h-[400px]">
        {step === 1 && <Step1 form={form} setForm={setForm} errors={errors} />}
        {step === 2 && <Step5 />}
      </div>

      {/* nav buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={handlePrev}
          disabled={step === 1}
          className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          ← Previous
        </button>

        {step < totalSteps ? (
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
          >
            Next →
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveWithDateTime}
              className="px-6 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700 transition"
            >
              Create Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
