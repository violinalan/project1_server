const fs = require("fs")
const bodyParser = require("body-parser")
const db = require('./queries')

const express = require('express')
const app = express()
const cors = require('cors');

const port = 8080

app.use(cors())
app.options('*', cors())
app.use(bodyParser.json())

app.get('/tickets', db.getTickets)
app.delete('/ticket/:id', db.deleteTicket);
app.post('/ticket/recurring', db.createRecurringTicket);
app.post('/ticket/update/:id', db.editTicket);
app.get('/tailnums', db.getTailNumbers);
app.get('/components', db.getComponents);


app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))