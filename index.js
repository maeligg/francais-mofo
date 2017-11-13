const Twit = require('twit');
const anglicismes = require('./anglicismes.json');
const { createServer } = require('http');


// Now cli requires an HTTP server to deploy the app
const server = createServer(() => {});
server.listen(3000);
// Uncomment these lines if running locally (see readme for more details)
// const config = require('./config.js');
// process.env = config;

const T = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
});

let numResults;
let haveWeTweetedAlready;

// Retrieve the last numResults tweets in French
const getTweets = () => {
  T.get('search/tweets', { q: '-filter:nativeretweets', lang: 'fr', count: numResults }, (getErr, getData) => {
    const statuses = getData.statuses;

    // Loop through all tweets
    Object.keys(statuses).forEach((statusKey) => {
      // Loop through all anglicismes
      Object.keys(anglicismes).forEach((anglicismeKey) => {
        const regex = new RegExp(`\\b${anglicismeKey}\\b`, 'g');

        // If the tweet contains a word from the json, we post a tweet with the corresponding translation
        if (regex.test(statuses[statusKey].text) && !haveWeTweetedAlready) {
          const selectedTweet = statuses[statusKey];
          const selectedAnglicisme = anglicismeKey;
          const tweetId = selectedTweet.id_str;
          const username = selectedTweet.user.screen_name;
          const tweetContent = `Plutôt que « ${selectedAnglicisme} », pourquoi ne pas utiliser « ${anglicismes[selectedAnglicisme]} » ?`;

          haveWeTweetedAlready = true;
          // Post the tweet
          T.post('statuses/update', { status: `.@${username} ${tweetContent}`, in_reply_to_status_id: tweetId }, (postErr, postData) => {
            if (postErr) {
              console.log('error: ', postErr);
            } else {
              console.log('response: ', postData);
            }
          });
        }
      });
    });
  });
}

const tweet = () => {
  numResults = 100;
  haveWeTweetedAlready = false;

  getTweets();

  // If no result was found, expand the results and search again (within a limit of 1000)
  if (!haveWeTweetedAlready && numResults <= 1000) {
    numResults += 100;
    getTweets();
  }
};


tweet();
setInterval(tweet, 1000 * 60 * 60); // tweets every hour
