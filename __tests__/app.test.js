require('dotenv').config();

const {execSync} = require('child_process');

const fakeRequest = require('supertest');
const app = require('../lib/app');
const client = require('../lib/client');

describe('app routes', () => {
  describe('routes', () => {
    let token;

    beforeAll(async (done) => {
      execSync('npm run setup-db');

      client.connect();

      const signInData = await fakeRequest(app).post('/auth/signup').send({
        email: 'jon@user.com',
        password: '1234'
      });

      token = signInData.body.token; // eslint-disable-line

      return done();
    });

    afterAll((done) => {
      return client.end(done);
    });

    //Personal Page Testing 
    //POST 
    test('adds a new playlist from your private list to the shared playlist page (in this case also adds to your private playlists)', async () => {
      const newPlaylist = {
        name: 'New Algorhythm Playlist',
        uri: 'spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c',
        playlist_id: '09850394',
        owner_name: 'Larry'
      };

      const addedPlaylist = [
        {
          ...newPlaylist,
          id: 3,
          owner_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .post('/api/playshare')
        .send(newPlaylist)
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(addedPlaylist);
    });

    //GET
    test('returns your private playlists', async () => {
      const expectation = [
        {
          "id": 1,
          "name": "Lo-Fi Beats",
          "uri": "spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c",
          "playlist_id": "09850394",
          "owner_name": "Zina",
          "owner_id": 1
        },
        {
          "id": 2,
          "name": "Africano Beats",
          "uri": "spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c",
          "playlist_id": "798435",
          "owner_name": "Cierra",
          "owner_id": 1
        },
        {
          "id": 3,
          "name": "New Algorhythm Playlist",
          "uri": "spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c",
          "playlist_id": "09850394",
          "owner_name": "Larry",
          "owner_id": 2
        }

      ];

      const data = await fakeRequest(app)
        .get('/playshare')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    //Public Page Testing 
    //GET
    test('returns public playlists that match your id', async () => {
      const expectation = [
        {
          "id": 3,
          "name": "New Algorhythm Playlist",
          "uri": "spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c",
          "playlist_id": "09850394",
          "owner_name": "Larry",
          "owner_id": 2
        }
      ];

      const data = await fakeRequest(app)
        .get('/api/myplaylists')
        .expect('Content-Type', /json/)
        .set('Authorization', token)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });


    //DELETE
    test('deletes specified shared playlist given an id (in this case, 3)', async () => {
      const data = await fakeRequest(app)
        .delete('/api/myplaylists/3')
        .set('Authorization', token)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([]);
    });
  });
});
