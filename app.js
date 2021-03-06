require("dotenv").config()
require("express-async-errors")
const express = require("express")
const cookieParser = require("cookie-parser")
const app = express()

const helmet = require("helmet")
const cors = require("cors")
const xss = require("xss-clean")
const rateLimiter = require("express-rate-limit")

// connectDB
const connectDB = require("./db/connect")
const authMiddleware = require("./middleware/authentication")
//routers
const itemsRouter = require("./routes/items")
const authRouter = require("./routes/auth")

// error handler
const notFoundMiddleware = require("./middleware/not-found")
const errorHandlerMiddleware = require("./middleware/error-handler")

app.set("trust proxy", 1)
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
)
app.use(express.json())
app.use(cookieParser())
app.use(helmet())
app.use(cors())
app.use(xss())

// extra packages

app.get("/", (req, res) => {
  res.send("items api")
})
// routes
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/items", authMiddleware, itemsRouter)

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
