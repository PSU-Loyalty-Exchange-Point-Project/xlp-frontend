const express = require('express');
const axios = require('axios');
// const session = require('express-session');
const cookieParser = require('cookie-parser');
const { Console } = require('console');

const app = express();

// ----------- APP setup ----------- 
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(cookieParser())

// app.use(session({ secret: "very secret key do not lose it" }));
app.set('view engine', 'ejs');

let checkAuthorization = async (request, response, next) => {
    console.log('Check Authorization Triggered');
    let access_token = request.cookies.access_token;

    if (access_token == null) return response.redirect('/account/login')

    let { status } = await sendRequest('post', `/account/check-authorization`, { access_token: access_token });


    if (status != 200) {
        return response.redirect('/account/login');
    }   
    else {
        return next();
    }
}


// ----------- Endpoints ----------- 

app.get('/account/signup', (request, response) => {

    response.render('signup');
});

app.get('/account/dashboard', (request, response) => {

    response.render('dashboard');
});


app.post('/account/signup', (request, response) => {

    response.render('signup');
});

app.get('/account/login', (request, response) => {

    response.render('login');
});

app.post('/account/login', async (request, response) => {
    let { email, password } = request.body;

    let { status, data } = await sendRequest('post', '/account/login', { email: email, password: password });
    
    if (status == 200)
        response
            .redirect('/dashboard'); // Path=/; HttpOnly; Expires=Sat, 04 Nov 2023 23:35:15 GMT;
    else
        response.redirect('/account/login');
});

app.post('/account/logout', checkAuthorization, async (request, response) => {
    let { status, data } = await sendRequest('post', '/account/logout', { access_token: request.cookies.access_token });
    if (status == 200) 
        return response.clearCookie('access_token').clearCookie('connect.sid').redirect('/account/login');
    else
        return response.sendStatus(400);
});

app.get('/dashboard', async (request, response) => {

    // await checkAuthorization(request.cookies.access_token);

    return response.render('dashboard');
});


let sendRequest = async (method, path, body) => {
    return axios({
        method: method,
        url: `http://localhost:8080${path}`,
        data: body
    }).then((response) => {
        console.log(response.headers['set-cookie']['connect.sid']);
        return { status: response.status, data: response.data };
    }).catch((error) => {

        return { status: 400, data: {} };
    });

}



app.use((request, response) => {
    response.status(404).json({error: "Resource not found"});
});

app.listen(8000, "localhost", () => { 
    console.log(`Starting development server at http://localhost:8000`) 
});