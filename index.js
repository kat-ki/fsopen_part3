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

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'})
    }
    next(error)
}
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
    Person.findById(request.params.id).then(person => {
        if (person) {
            response.json(person)
        } else {
            response.status(404).end('PERSON NOT FOUND')
        }
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

/*const generateId = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
}*/

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
//TODO: fix post found person
    /*const foundPerson = response.find(person => person.name.toLowerCase() === request.body.name.toLowerCase());
    if (foundPerson) {
        return response.status(400).json({
            error: 'Name must be unique'
        })
    }*/

    const person = new Person({
        name: body.name,
        number: body.number
    })
    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
})

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})