import DirectContactSection from "./DirectContactSection";

/**
 * EnquiryForm (Temporary direct contact replacement mode)
 *
 * The enquiry form is temporarily disabled.
 * Renders DirectContactSection with Phone, WhatsApp, and Instagram direct links.
 * Original form implementation is archived below for instant restoration.
 */
export default function EnquiryForm({ projectName = "" }) {
  return (
    <DirectContactSection
      title={projectName ? `Inquire About ${projectName}` : "Direct Advisory Desk"}
    />
  );
}

/* =========================================================================
   PREVIOUS ENQUIRY FORM IMPLEMENTATION (UNCOMMENT TO RESTORE)
   =========================================================================

import { useState } from "react";
import { submitEnquiry } from "../lib/api";

const initial = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export function ActiveEnquiryForm({ projectName = "", source = "contact", submitLabel = "Send enquiry" }) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");
  const [serverMessage, setServerMessage] = useState("");

  function validate(next = values) {
    const nextErrors = {};
    if (next.name.trim().length < 2) nextErrors.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email.trim())) {
      nextErrors.email = "Please enter a valid email.";
    }
    if (!/^[0-9+\-\s()]{8,20}$/.test(next.phone.trim())) {
      nextErrors.phone = "Please enter a valid phone number.";
    }
    if (next.message.trim().length < 12) {
      nextErrors.message = "Please share a little more detail.";
    }
    return nextErrors;
  }

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setStatus("loading");
    setServerMessage("");
    try {
      const data = await submitEnquiry({
        ...values,
        project: projectName,
        source,
      });
      setStatus("success");
      setServerMessage(data.message);
      setValues(initial);
    } catch (error) {
      setStatus("error");
      setErrors(error.fields || {});
      setServerMessage(error.message);
    }
  }

  const inputClass =
    "w-full bg-transparent border-0 border-b border-sand/80 px-0 py-3 text-ink placeholder:text-stone/70 focus:border-gold focus:ring-0";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <label htmlFor="name" className="block">
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Full name</span>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={update}
            className={inputClass}
            placeholder="Your name"
          />
          {errors.name && <span className="mt-2 block text-xs text-red-800">{errors.name}</span>}
        </label>
        <label htmlFor="email" className="block">
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Email</span>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update}
            className={inputClass}
            placeholder="you@email.com"
          />
          {errors.email && <span className="mt-2 block text-xs text-red-800">{errors.email}</span>}
        </label>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <label htmlFor="phone" className="block">
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Phone</span>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={update}
            className={inputClass}
            placeholder="+91 XXXXX XXXXX"
          />
          {errors.phone && <span className="mt-2 block text-xs text-red-800">{errors.phone}</span>}
        </label>
        <label htmlFor="subject" className="block">
          <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Subject</span>
          <input
            id="subject"
            name="subject"
            value={values.subject}
            onChange={update}
            className={inputClass}
            placeholder="How can we help you?"
          />
          {errors.subject && <span className="mt-2 block text-xs text-red-800">{errors.subject}</span>}
        </label>
      </div>
      {projectName ? (
        <p className="text-sm text-stone">
          Enquiring about <span className="text-ink">{projectName}</span>
        </p>
      ) : null}
      <label htmlFor="message" className="block">
        <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">Message</span>
        <textarea
          id="message"
          name="message"
          rows="4"
          value={values.message}
          onChange={update}
          className={`${inputClass} resize-none`}
          placeholder="Tell us what you are looking for"
        />
        {errors.message && <span className="mt-2 block text-xs text-red-800">{errors.message}</span>}
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center border border-ink bg-ink px-8 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-cream transition hover:bg-gold hover:border-gold hover:text-ink disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : submitLabel}
      </button>
      {status === "success" && (
        <p className="text-sm text-ink" role="status">{serverMessage}</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-800" role="alert">{serverMessage || "Something went wrong. Please try again."}</p>
      )}
    </form>
  );
}
========================================================================= */
