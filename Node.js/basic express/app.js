
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');
const Joi = require('joi')
const app = express();

app.use('/public', express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname, 'static', 'index.html'))
})
.get('/example', (req, resp) => {
    resp.send('hitting example route')
})
.get('/example/:name/:age', (req, resp) => {
    console.log(req.query)
    resp.send(`${req.params.name}: ${req.params.age}`)
})
.post('/', (req, resp) => {
    console.log(req.body);
    
    const schema = Joi.object().keys({
        email: Joi.string().trim().email().required(),
        password: Joi.string().trim().min(5).max(10).required()
    });

    Joi.validate(req.body, schema, (err, result) => {
        if(err) {
            // console.log(err.details)
            const errMessage = err.details[0].message;
            return resp.json({ status: 'an error has occurred', message: errMessage })
        }
        console.log(result)
        resp.json({ success: true });
    });
})
.listen(3000, () => {
    console.log('listening on port 3000')
})


// ==================================

// Validation on nested objects

const arrayOfStrings = ['banana', 'bacon', 'cheese'];
const arrayOfObjects = [{example: 'example1' }, {example: 'example2'}, {example: 'example3'}];

const userInput = {
    personalInfo: {
        streetAddress: '12345638',
        city: 'targoviste',
        state: 'fr',
    },
    preferences: arrayOfObjects
}

const personalInfoSchema = Joi.object().keys({
    streetAddress: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    state: Joi.string().regex(/^[a-z]+$/).trim().length(2).required()
});

// Make sure that all items are string
const preferencesSchema = Joi.array().items(Joi.string());
const preferencesObj = Joi.array().items(Joi.object().keys({
    example: Joi.string().trim().required()
}));

const finalSchema = Joi.object().keys({
    personalInfo: personalInfoSchema,
    preferences: preferencesObj
});

Joi.validate(userInput, finalSchema, (err, result) => {
    if (err) {
        console.log(err)
    } else {
        console.log(result)
    }
});