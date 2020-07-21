const Twit = require('twit');
const anglicismes = require('./anglicismes.json');

// Uncomment these lines if running locally (see readme for more details)
// const config = require('./config.js');
// process.env = config;

const T = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
});

// Build and post the tweet
const tweet = () => {
  // Retrieve the last 100 tweets in French
  T.get(
    'search/tweets',
    { q: '-filter:nativeretweets', lang: 'fr', count: 100 },
    (getErr, getData) => {
      const statuses = getData.statuses;

      // Loop through all tweets
      Object.keys(statuses).forEach((statusKey) => {
        // Loop through all anglicismes
        Object.keys(anglicismes).forEach((anglicismeKey) => {
          const regex = new RegExp(`(^|\\s)${anglicismeKey}($|[\\s.!?\\-])`, 'g');

          // If the tweet contains a word from the json,
          // we post a tweet with the corresponding translation
          if (regex.test(statuses[statusKey].text)) {
            const selectedTweet = statuses[statusKey];
            const selectedAnglicisme = anglicismeKey;
            const tweetId = selectedTweet.id_str;
            const username = selectedTweet.user.screen_name;
            const tweetContent = `Plutôt que « ${selectedAnglicisme} », pourquoi ne pas utiliser « ${
              anglicismes[selectedAnglicisme]
            } » ?`;

            T.post(
              'statuses/update',
              {
                status: `.@${username} ${tweetContent}`,
                in_reply_to_status_id: tweetId,
              },
              (postErr, postData) => {
                if (postErr) {
                  return console.log('error: ', postErr);
                } else {
                  return console.log('response: ', postData);
                }
              },
            );
          }
        });
      });
    },
  );
};

tweet();

