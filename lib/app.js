const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
const request = require('superagent');


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const { mungePlaylist } = require('./utils.js');

const authRoutes = createAuthRoutes();

// setup authentication routes to give user an auth token
// creates a /auth/signin and a /auth/signup POST route. 
// each requires a POST body with a .email and a .password
app.use('/auth', authRoutes);

// everything that starts with "/api" below here requires an auth token!
app.use('/api', ensureAuth);

// and now every request that has a token in the Authorization header will have a `req.userId` property for us to see who's talking
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/playshare', async(req, res) => {
  try {
    const data = await client.query('SELECT * from playshare');
    
    res.json(data.rows);
  } catch(e) {
    
    res.status(500).json({ error: e.message });
  }
});


// ================== SPOTIFY ==================

// app.get('/playlist', async(req, res) => {

//   try {
//     //GET https://api.spotify.com/v1/me/playlists
//     //=====THIRD PARTY======
//     const playlistData = await request
//       .get('https://api.spotify.com/v1/me/playlists?limit=5&offset=5')
//       // .set('Authorization', `Bearer ${YELP_API_KEY}`)
//       // .set('Accept', 'application/json');
//     const formattedResponse = mungePlaylist(playlistData.body);
//     res.json(formattedResponse);


//   } catch(e) {
//     res.status(500).json({ error: e.message });
//   }

// });

app.use(require('./middleware/error'));

module.exports = app;
