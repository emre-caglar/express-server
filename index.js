
// Downloaded nodemon globally. Nodemon monitors the file and restarts it upon change/save.
// Instead of running the application using node command, use nodemon

const express = require('express');
const app = express();
const packageJson = require('./package.json');
const Joi = require('joi');
const logger = require('./logger');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('config');

//stored in config/production.json which matches the NODE_ENV variable
console.log(config.get('mail.host'));

//stored in app_password environment variable, which is mapped to mail.password in config/custom-environment-variables file
console.log(config.get('mail.password'));

const apiVersion = packageJson.version.substr(0 , packageJson.version.lastIndexOf('.'));

// This middleware puts the json object in body to req.body
// There's another middleware option to parse encoded url (key value pairs) - express.urlencoded
app.use(express.json());

// static middleware allows you to serve static files (txt, pdf, images).
// Put a file in public folder and localhost:3000/filename.pdf
app.use(express.static('public'));

// Third party middlewares - go to Express.JS to find out
app.use(helmet());

// Backtick for template string. 
// process.env.NODE_ENV gets the environment (DEV, TEST, PROD) from environment. App.get defaults undefined to dev
console.log(`Process.env: ${process.env.NODE_ENV} \n\rApp: ${app.get('env')}`);
if(app.get('env')==='development') 
{
    app.use(morgan('dev'));
    console.log('Morgan enabled.');
}
// Passing the middleware function to the express app.
// Each middleware function gets executed in sequence in the request / response pipeline
// After execution, middleware functions give the control to the next() middleware
// until a middleware ends the pipeline with res.send
app.use(logger);

const courses = [{id: 1, name: "course1"},
                 {id: 2, name: "course2"},
                 {id: 3, name: "course3"} ];

// It is better to set the port in an environment variable and read it, rather than hardode.
// To set an environment variable, use powershell command $Env:port += "8080"
//Cloud foundry does the same.

const port = process.env.port || 3000;

app.get('/', (req, res) => {

    res.send('Hello World!');
});

app.get('/api/v' + apiVersion + '/courses', (req,res) => {
    res.send([1,2,3]);
});

// Year and month are parameters and saved in req.params JSON object.
// They can be accessed as req.params.year and req.params.month

// Query strings, such as ?sortBy=name is any optional query parameters which come after ?
// They can be accessed through req.query
app.get('/api/posts/:year/:month', (req, res) => {
    res.send(JSON.stringify(req.params) + "\r\n" + JSON.stringify(req.query));
});

app.get('/api/v' + apiVersion + '/courses/:id', (req, res)=> {
    let course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) res.status('404').send('404 Course Not Found. ');
    res.send(course);
});

app.post('/api/v' + apiVersion + '/courses', (req, res) => {
    const schema = { name: Joi.string().min(3).required()};
    
    const result = Joi.validate(req.body,schema);

    if(result.error)
    {
        res.status(400).send(result.error.details[0].message);
        return;
    }
    const course = {
        id: courses.length + 1,
        name: req.body.name
    };
    courses.push(course);
    res.send(course);
});

app.put('/api/v' + apiVersion + '/courses/:id', (req, res) => {

    let course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status('404').send('404 Course Not Found. ');

    //Object destructuring syntax. I'm interested in result.error object. 
    // { error } means take the error property from the returned object
    const { esrror } = validateCourse(req.body);

    if(error)
        return res.status(400).send(result.error.details[0].message);


    course.name = req.body.name;
    res.send(course);

});

app.delete('/api/v' + apiVersion + '/courses/:id', (req, res) => {

    let course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status('404').send('404 Course Not Found. ');

    //Object destructuring syntax. I'm interested in result.error object. 
    // { error } means take the error property from the returned object
    const { error } = validateCourse(req.body);

    if(error)
        return res.status(400).send(result.error.details[0].message);
    
    const index = courses.indexOf(course);
    courses.splice(index,1);
    res.send(course);

});


function validateCourse(course){
    const schema = { name: Joi.string().min(3).required()};
    
    return result = Joi.validate(course,schema);
 
}

app.listen(port, () => {
    console.log(`Listening on port  ${port}...`);
});