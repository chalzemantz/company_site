import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
import { z } from "zod";
import { Resend } from "resend";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().min(1, "Message is required").trim()
});
const handleContact = async (req, res) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY environment variable is not set");
      return res.status(500).json({
        success: false,
        message: "Email service is not configured. Please try again later."
      });
    }
    const resend = new Resend(apiKey);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const data = contactFormSchema.parse(body);
    const adminEmailResult = await resend.emails.send({
      from: "noreply@ventechplus.xyz",
      to: "admin@ventechplus.xyz",
      subject: `New Contact Form Submission from ${data.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(data.email)}</p>
        ${data.phone ? `<p><strong>Phone:</strong> ${escapeHtml(data.phone)}</p>` : ""}
        ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
        <h3>Message:</h3>
        <p>${escapeHtml(data.message).replace(/\n/g, "<br>")}</p>
      `
    });
    if (adminEmailResult.error) {
      console.error("Failed to send admin email:", adminEmailResult.error);
      return res.status(500).json({
        success: false,
        message: "Failed to send email. Please try again later."
      });
    }
    const userEmailResult = await resend.emails.send({
      from: "noreply@ventechplus.xyz",
      to: data.email,
      subject: "We received your message - BlackBugs Technologies",
      html: `
        <h2>Thank You for Contacting Us!</h2>
        <p>Hi ${escapeHtml(data.name)},</p>
        <p>We received your message and appreciate you reaching out to BlackBugs Technologies.</p>
        <p>Our team will review your inquiry and get back to you as soon as possible.</p>
        <p>Best regards,<br>The BlackBugs Technologies Team</p>
      `
    });
    if (userEmailResult.error) {
      console.error(
        "Failed to send confirmation email:",
        userEmailResult.error
      );
    }
    return res.status(200).json({
      success: true,
      message: "Your message has been sent successfully. We'll get back to you soon!"
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return res.status(400).json({
        success: false,
        message: firstError.message
      });
    }
    if (error instanceof Error && error.message.includes("body stream")) {
      console.error("Body stream error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid request format. Please try again."
      });
    }
    if (error instanceof SyntaxError && "body" in error) {
      console.error("JSON parse error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in request. Please try again."
      });
    }
    console.error("Contact form error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request. Please try again later."
    });
  }
};
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json({ limit: "10mb" }));
  app2.use(express__default.urlencoded({ extended: true, limit: "10mb" }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/contact", handleContact);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname$1 = import.meta.dirname;
const distPath = path.join(__dirname$1, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
