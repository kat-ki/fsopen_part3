require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
morgan.token('body', request => JSON.stringify(request.body))
const Person = require('./models/person')

const app = express();
app.use(express.json())
app.use(morgan('tiny'))
app.use(morgan(':method :url :body'))
app.use(express.static('dist'))
const errorHandler = (error, request, response, next) => {
    if (error.name === 'CastError') {
        return response.status(400).send({error: 'malformatted id'});
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error: error.message});
    }
    next(error)
}
app.use(errorHandler)

app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
        response.json(persons)
    })
})
app.get('/info', (request, response) => {
    let newDate = new Date()
    Person.find({}).then(persons => {
        response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${newDate}</p>`)
    })
})
app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end('PERSON NOT FOUND')
            }
        })
        .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body;
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
    person.save()
        .then(savedPerson => {
            response.json(savedPerson)
        })
        .catch(error => {
            next(error)
        })

})

app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body

    const person = {
        name: body.name,
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, {new: true})
        .then(updated => {
            response.json(updated)
        })
        .catch(error => next(error))
})


const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})