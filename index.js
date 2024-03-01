const express = require('express')
const morgan = require('morgan')
require('dotenv').config()
morgan.token('body', request => JSON.stringify(request.body))

const app = express();
const Person = require('./models/person')

app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :body'))
app.use(express.static('dist'))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})

app.get('/info', (request, response) => {
    let newDate = new Date()
    response.send(`
<p>Phonebook has info for ${persons.length} people</p>
<p>${newDate}</p>
`)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(note => note.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end('PERSON NOT FOUND')
    }
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(p => p.id !== id)
    response.status(204).end()
})

const generateId = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}

//TODO: fix post found person
app.post('/api/persons', (request, response) => {
    const body = request.body
    if (body.name === undefined) {
        return response.status(400).json({
            error: 'Name is missing'
        })
    }
    if (body.number === undefined) {
        return response.status(400).json({
            error: 'Number is missing'
        })
    }

    const foundPerson = persons.find(person => person.name.toLowerCase() === request.body.name.toLowerCase());
    if (foundPerson) {
        return response.status(400).json({
            error: 'Name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})