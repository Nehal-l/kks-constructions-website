import { useState } from "react";
import { submitEnquiry } from "../lib/api";

const initial = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

export default function EnquiryForm({ projectName = "", source = "contact", submitLabel = "Send enquiry" }) {
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
        <Field id="name" label="Full name" error={errors.name}>
          <input
            id="name"
            name="name"
            autoComplete="name"
            value={values.name}
            onChange={update}
            className={inputClass}
            placeholder="Your name"
          />
        </Field>
        <Field id="email" label="Email" error={errors.email}>
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
        </Field>
      </div>
      <Field id="phone" label="Phone" error={errors.phone}>
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
      </Field>
      {projectName ? (
        <p className="text-sm text-stone">
          Enquiring about <span className="text-ink">{projectName}</span>
        </p>
      ) : null}
      <Field id="message" label="Message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows="4"
          value={values.message}
          onChange={update}
          className={`${inputClass} resize-none`}
          placeholder="Tell us what you are looking for"
        />
      </Field>
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center justify-center border border-ink bg-ink px-8 py-3 text-[0.7rem] uppercase tracking-[0.28em] text-cream transition hover:bg-gold hover:border-gold hover:text-ink disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : submitLabel}
      </button>
      {status === "success" ? (
        <p className="text-sm text-ink" role="status">
          {serverMessage}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="text-sm text-red-800" role="alert">
          {serverMessage || "Something went wrong. Please try again."}
        </p>
      ) : null}
    </form>
  );
}

function Field({ id, label, error, children }) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-[0.68rem] uppercase tracking-[0.24em] text-stone">{label}</span>
      {children}
      {error ? (
        <span className="mt-2 block text-xs text-red-800">{error}</span>
      ) : null}
    </label>
  );
}
