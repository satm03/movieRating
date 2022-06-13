import { app } from './src/app.js'
import chalk from 'chalk'
import { createWebSocketServer } from './src/websockets.js'

const port = 3000


const server = app.listen(port, () => {
    console.log(chalk.green(`Server listening at http://localhost:${port}`))
})

createWebSocketServer(server)