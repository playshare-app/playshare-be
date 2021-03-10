require('dotenv').config();

const { execSync } = require('child_process');

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

    //GET
    test('returns shared playlists', async () => {
      const expectation = [
        {
          id: 1,
          name: 'Lo-Fi Beats',
          uri: 'spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c',
          playlist_id: '09850394',
          owner_name: 'Zina',
          owner_id: 1
        },
        {
          id: 2,
          name: 'Africano Beats',
          uri: 'spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c',
          playlist_id: '798435',
          owner_name: 'Cierra',
          owner_id: 1
        },
        {
          id: 3,
          name: 'Smooth Jazz',
          uri: 'spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c',
          playlist_id: '974835',
          owner_name: 'Claudia',
          owner_id: 1
        },
        {
          id: 4,
          name: 'Hip hop',
          uri: 'spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c',
          playlist_id: '97384775',
          owner_name: 'Katilyn',
          owner_id: 1
        }
      ];

      const data = await fakeRequest(app)
        .get('/playshare')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(expectation);
    });

    //POST
    test('adds a new playlist to shared playlist page', async () => {
      const newPlaylist = {
        name: 'New Algorhythm Playlist',
        uri: 'spotify:user:wizzler:playlist:53Y8wT46QIMz5H4WQ8O22c',
        playlist_id: '09850394',
        owner_name: 'Larry'
      };

      const addedPlaylist = [
        {
          ...newPlaylist,
          id: 5,
          owner_id: 2
        }
      ];

      const data = await fakeRequest(app)
        .post('/api/playshare')
        .send(newPlaylist)
        .set('Authorization', token)
        // .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual(addedPlaylist);
    });
    //POST
    test('deletes specified playlist given a playlist id (in this case, 5)', async () => {
      const data = await fakeRequest(app)
        .delete('/api/playshare/5')
        .set('Authorization', token)
        // .expect('Content-Type', /json/)
        .expect(200);

      expect(data.body).toEqual([]);
    });
  });
});
