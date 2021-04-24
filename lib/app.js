const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');
// const request = require('superagent');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging


const authRoutes = createAuthRoutes();


app.use('/auth', authRoutes);

app.use('/api', ensureAuth);

// nice work removing comments here :) don't see that very often!
app.get('/api/test', (req, res) => {
  res.json({
    message: `in this proctected route, we get the user's id like so: ${req.userId}`
  });
});



app.get('/playshare', async (req, res) => {
  try {
    const data = await client.query('SELECT * from playshare');

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.post('/api/playshare', async (req, res) => {
  try {
    const { name, uri, playlist_id, owner_name } = req.body;

    const data = await client.query(
      `
    INSERT INTO playshare (
      name,
      uri,
      playlist_id,
      owner_name,
      owner_id
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
`,
      [name, uri, playlist_id, owner_name, req.userId]
    );

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.get('/api/playshare/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT * from playshare WHERE id=$1', [id]);

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// would like to see kabob case here
app.get('/api/my-playlists', async (req, res) => {
  try {
    const id = req.userId;
    const data = await client.query('SELECT * from playshare WHERE owner_id=$1', [id]);

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/my-playlists/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('DELETE from playshare where owner_id=$1 AND id=$2', [req.userId, id]);

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//COMMENTS ===============

// why is this one not protected by auth? seems like a risk to expose a POST endpoint like this
app.post('/comments', async (req, res) => {
  try {
    const { comment_test, user_email, playlistid } = req.body;

    const data = await client.query(
      `
    INSERT INTO comments (
      comment_test,
      user_email,
      playlistid,
      comments_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING * ;
`,
      [comment_test, user_email, playlistid, req.userId]
    );

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//NOT WORKING YET
app.post('/api/comments', async (req, res) => {
  try {
    const { comment_test, user_email, playlistid } = req.body;

    const data = await client.query(
      `
    INSERT INTO comments (
      comment_test,
      user_email,
      playlistid,
      comments_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING * ;
`,
      [comment_test, user_email, playlistid, req.userId]
    );

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/comments/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await client.query('SELECT * from comments WHERE id=$1', [id]);

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/comments', async (req, res) => {
  try {
    const data = await client.query('SELECT * from comments');

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

//not working 
app.get('/api/comments', async (req, res) => {
  try {
    const data = await client.query('SELECT * from comments');

    res.json(data.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


app.use(require('./middleware/error'));

module.exports = app;
