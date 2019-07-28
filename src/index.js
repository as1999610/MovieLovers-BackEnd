import express from 'express';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import bird from 'bluebird';

import auth from './routes/auth';
import users from './routes/users';
import movies from './routes/movies';

dotenv.config();
const app = express();
app.use(bodyParser.json());
mongoose.bird = Promise;
mongoose.connect(process.env.MONGODB_URL, {useMongoClient: true});

app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/movies', movies);

app.get('/*', (req, res) => {
    res.send(path.join(__dirname, 'index.html'));
});

app.listen(8080, () => console.log("The MovieLovers Server is running!"));