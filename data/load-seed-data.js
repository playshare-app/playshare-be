const client = require('../lib/client');
// import our seed data:
const playshare = require('./playshare.js');
const usersData = require('./users.js');
const { getEmoji } = require('../lib/emoji.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      playshare.map(share => {
        return client.query(`
                    INSERT INTO playshare (name, uri, playlist_id, owner_name, owner_id)
                    VALUES ($1, $2, $3, $4, $5);
                `,
        [share.name, share.uri, share.playlist_id, share.owner_name, user.id]);
      })
    );
    

    console.log('seed data load complete', getEmoji(), getEmoji(), getEmoji());
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
