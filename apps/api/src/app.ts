import { Hono } from 'hono'
const app = new Hono()

app.get('/', (c) => c.body('Hono!'))

export default app