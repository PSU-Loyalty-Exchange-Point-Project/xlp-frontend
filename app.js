const express = require('express');
const axios = require('axios');
const cookieParser = require('cookie-parser');
const session = require('express-session');

require('dotenv').config();



// ----------- APP setup ----------- 
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true
}));
app.use(cookieParser());
app.set('view engine', 'ejs');


// ----------- Middleware ----------- 

let checkAuthorization = async (request, response, next) => {
    let access_token = request.cookies.access_token;

    if (access_token == null) return response.redirect('/account/login')

    let { statusCode } = await sendPostRequest(`/account/check-authorization`, { access_token: access_token });

    if (statusCode != 200) {
        return response.redirect('/account/login');
    }   
    else {
        return next();
    }
}


// ----------- Endpoints ----------- 

app.get('/account/signup', (request, response) => {

    return response.render('signup');
});

app.post('/account/signup', async (request, response) => {
    let { name, email, password, rePassword, countryCode, phoneNumber } = request.body;
    
    try {
        let { statusCode, data } = await sendPostRequest('/account/register', { name: name, email: email, password: password, rePassword: rePassword, countryCode: countryCode, phoneNumber: phoneNumber });
        
        if (statusCode != 201)
            throw data.message;

        return response.redirect(`/account/verify-otp/${data.uid}`)

    } catch (error) {
        console.error(error);
        return response.redirect(`/account/signup`)
    }
});

app.get('/account/verify-otp/:uid', async (request, response) => {
    let uid = request.params.uid;

    try {
        let { statusCode, data } = await sendGetRequest(`/account/verify-otp/${uid}`);
        if (statusCode != 200)
            throw "Error";

        return response.render('otp', { data: data });
    } catch (error) {

        return response.redirect(`/account/verify-otp/${uid}`);
    }
})

app.post('/account/verify-otp/:uid', async (request, response) => {
    let { code } = request.body;
    let uid = request.params.uid;
    try {
        let { statusCode, data } = await sendPostRequest(`/account/verify-otp/${uid}`, { code: code });

        if (statusCode != 200)
            throw data.message;

        if (data.redirectLocation == "/dashboard") 
            response.cookie("access_token", data.headers.access_token.token, data.headers.access_token.options);

        return response.redirect(data.redirectLocation);
       
    } catch (error) {
        console.error(error);
        return response.redirect(`/account/verify-otp/${uid}`);
    }
})


app.get('/account/login', (request, response) => {

    return response.render('login');
})

app.post('/account/login', async (request, response) => {
    let { email, password } = request.body;
    try {
        let { statusCode, data } = await sendPostRequest('/account/login', { email: email, password: password });
        
        if (statusCode != 200)
            throw data.message;
    
        return response.redirect(`/account/verify-otp/${data.uid}`)
    } catch (error) {

        return response.redirect('/account/login');
    }
})

app.post('/account/logout', checkAuthorization, async (request, response) => {
    let { statusCode, data } = await sendPostRequest('/account/logout', {},  { access_token: request.cookies.access_token });
    if (statusCode == 200) 
        return response.clearCookie('access_token').redirect('/account/login');
    else
        return response.redirect('/dashboard');
});

var moment = require('moment');

app.get('/dashboard', checkAuthorization, async (request, response) => {
    
    
    try { 
        let { statusCode, data } = await sendGetRequest('/dashboard', {}, { access_token: request.cookies.access_token })
        if (!statusCode)
            throw "Error rendering dashboard";
        return response.render('dashboard', { data: data, moment: moment });
    } catch (error) {
        return response.status(400).send(error);
    }
});

app.get('/gift-card/redeem', checkAuthorization, async (request, response) => {
    try { 
        return response.render('add');
    } catch (error) {
        return response.status(400).send(error);
    }
});

app.post('/gift-card/redeem', checkAuthorization, async (request, response) => {
    let { giftCardNumber } = request.body;
    try { 
        let { statusCode, data } = await sendPostRequest('/gift-card/redeem', { giftCardNumber: giftCardNumber },  { access_token: request.cookies.access_token });
        
        if (statusCode != 200)
            throw data.message;

        return response.redirect('/dashboard');
    } catch (error) {
        return response.status(400).send(error);
    }
});


let sendGetRequest = async (path = "", body = {}, headers = {}) => {
    return axios({
        method: 'get',
        headers: headers,
        url: `http://localhost:8080${path}`,
        data: body
    }).then((response) => {
        return { statusCode: response.status, data: response.data };
      }).catch((error) => {
        return { statusCode: error.response.status, data: error.response.data };
    });
    
}

let sendPostRequest = async (path = "", body = {}, headers = {}) => {
    return axios({
        method: 'post',
        headers: headers,
        url: `http://localhost:8080${path}`,
        data: body
    }).then((response) => {
        return { statusCode: response.status, data: response.data };
      }).catch((error) => {
        return { statusCode: error.response.status, data: error.response.data };
    });
    
}

app.use((request, response) => {
    response.status(404).json({error: "Resource not found"});
})

app.listen(8000, "localhost", () => { 
    console.log(`Starting development server at http://localhost:8000`) 
})