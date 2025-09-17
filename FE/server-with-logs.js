// server-with-logs.js
const http = require('http')
const handler = require('./server') // import the generated standalone server

const server = http.createServer((req, res) => {
  const start = Date.now()

  // hook into finish to log status + timing
  res.on('finish', () => {
    const duration = Date.now() - start
    console.log(`${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`)
  })

  handler(req, res)
})

server.listen(process.env.PORT || 4000, process.env.HOST || '127.0.0.1', () => {
  console.log(
    `Server running on http://${process.env.HOST || '127.0.0.1'}:${
      process.env.PORT || 4000
    }`
  )
})
