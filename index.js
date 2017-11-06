const Twit = require('twit');
const anglicismes = require('./anglicismes.json');
// Uncomment these lines if running locally (see readme for more details)
const config = require('./config.js');
process.env = config;


// Utils
const randomItem = array => array[Math.floor(Math.random() * array.length)];

const T = new Twit({
  consumer_key: process.env.consumer_key,
  consumer_secret: process.env.consumer_secret,
  access_token: process.env.access_token,
  access_token_secret: process.env.access_token_secret,
});


// Build and post the tweet
let numResults = 100;
const tweet = () => {
  // Retrieve the last 100 tweets in French
  T.get('search/tweets', { q: '-filter:nativeretweets', lang: 'fr', count: numResults }, (getErr, getData) => {
    const statuses = getData.statuses;
    let selectedTweet;
    let selectedAnglicisme;
    let regex;

    // Loop through all tweets
    Object.keys(statuses).forEach((statusKey) => {
      // Loop through all anglicismes
      Object.keys(anglicismes).forEach((anglicismeKey) => {
        // If the tweet contains an anglicisme, save it along with the anglicisme in an array
        // @TODO avoid overwriting regex, selectedTweet and selectedAnglicisme on each new match.
        regex = new RegExp(`\\b${anglicismeKey}\\b`, 'g');

        if(regex.test(statuses[statusKey].text)) {
          selectedTweet = statuses[statusKey];
          selectedAnglicisme = anglicismeKey;

          const tweetId = selectedTweet.id_str;
          const username = selectedTweet.user.screen_name;
          const tweetContent = `Plutôt que « ${selectedAnglicisme} », pourquoi ne pas utiliser « ${anglicismes[selectedAnglicisme]} » ?`;
          console.log(selectedTweet.text, tweetContent);

          // T.post('statuses/update', { status: `@${username} ${tweetContent}`, in_reply_to_status_id: tweetId }, (postErr, postData) => {
          //   if (postErr) {
          //     console.log('error: ', postErr);
          //   } else {
          //     console.log('response: ', postData);
          //   }
          // });
        }
      });
    });

    // If no result was found, expand the results and search again (within a limit of 1000)
    if (!selectedTweet && numResults <= 1000) {
      console.log(numResults)
      numResults +=100;
      tweet();
    }
  });
};

tweet();

setInterval(() => {
  try {
    tweet();
  } catch (e) {
    console.log(e);
  }
}, 1000 * 60 * 60 * 2); // tweets every 2 hours
