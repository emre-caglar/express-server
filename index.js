
// Downloaded nodemon globally. Nodemon monitors the file and restarts it upon change/save.
// Instead of running the application using node command, use nodemon

const express = require('express');
const app = express();
const packageJson = require('./package.json');
const Joi = require('joi');

const apiVersion = packageJson.version.substr(0 , packageJson.version.lastIndexOf('.'));

//This allows the application to accept json format in the post request body.
// content-type = application/json
app.use(express.json());

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


app.listen(port, () => {
    console.log(`Listening on port  ${port}...`);
});