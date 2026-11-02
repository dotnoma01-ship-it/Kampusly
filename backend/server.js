const dns = require("node:dns");
const path = require("node:path");

require("dotenv").config({ path: path.join(__dirname, ".env") });

const dnsServers = String(process.env.MONGODB_DNS_SERVERS || "")
  .split(",")
  .map(server => server.trim())
  .filter(Boolean);

if (dnsServers.length > 0) {
  dns.setServers(dnsServers);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const postRoutes = require("./routes/posts");
const productRoutes = require("./routes/products");
const messageRoutes = require("./routes/messages");
const notificationRoutes = require("./routes/notifications");
const walletRoutes = require("./routes/wallet");
const adminRoutes = require("./routes/admin");

const app = express();

app.disable("x-powered-by");
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          "http://localhost:5001",
          "http://127.0.0.1:5001",
        ],
      },
    },
  })
);

const allowedOrigins = String(
  process.env.CLIENT_URL || "http://localhost:5173"
)
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

function isLocalDevelopmentOrigin(origin) {
  if (process.env.NODE_ENV === "production") return false;

  try {
    const { hostname, protocol } = new URL(origin);
    return protocol === "http:" && ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
  } catch {
    return false;
  }
}

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || isLocalDevelopmentOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("This origin is not allowed by CORS."));
  },
  credentials: true
}));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  }
});

app.use("/api", apiLimiter);
app.use("/uploads", express.static(
  path.join(__dirname, "uploads"),
  {
    dotfiles: "deny",
    index: false,
    maxAge: "7d"
  }
));


app.get("/api/health", (req, res) => {
  const mongoose = require("mongoose");

  res.json({
    success: true,
    service: "Kampusly API",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/products", productRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5001;

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Kampusly API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Allowed frontend origins: ${allowedOrigins.join(", ")}`);
    });
  } catch (error) {
    console.error("Failed to start Kampusly API:", error.message);
    process.exit(1);
  }
}

startServer();

