import { buildApp } from './app'

async function startServer() {
  try {
    const app = await buildApp()
    
    // Add debug logging for registered routes
    app.ready(() => {
      console.log('Routes registered:')
      app.printRoutes()
    })
    
    await app.listen({ 
      port: parseInt(app.config.PORT, 10), 
      host: app.config.HOST 
    })
    
    console.log(`Server running at http://${app.config.HOST}:${app.config.PORT}`)
  } catch (err) {
    console.error('Error starting server:', err)
    process.exit(1)
  }
}

startServer()
