import { app } from './src/app.js'
import chalk from 'chalk'

const port = 3000


app.listen(port, () => {
    console.log(chalk.green(`Server listening at http://localhost:${port}`))
})