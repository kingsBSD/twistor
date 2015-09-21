#[twistor]()

a small program for archiving tweets and deletion notices. I intend to use it to replace politwoops for american politicians, and I hope to develop it into a reasonably easy way for others to do the same in their own locales. there is nothing that restricts it to politicians, however, so people may point it at arbitrary twitter timelines as they see fit.

at this moment (2015/9/21) it is probably too unfinished for anyone to really want to use it, and every commit in the near future will include breaking changes. but the actual database/twitter stuff does work, so.

if you do want to use it at this very moment, you need a postgres db somewhere. installation guides [here](https://wiki.postgresql.org/wiki/Detailed_installation_guides), but it doesn't matter if it's local or remote. you also need a `config.json` file the project root, of the form:

```
{
	"db": "postgres://uname:pw@host:port/dbname",
	"tw": {
		"consumer_key": "stuff",
		"consumer_secret": "stuff",
		"access_token": "stuff",
		"access_token_secret": "stuff"
	}
}
```

postgres port defaults to 5432 everywhere afaik.

twitter credentials you need to tie a phone number to your account, I just use google voice, but if anonymity is a major concern there are places to buy numbers with bitcoin. go to [apps.twitter.com](https://apps.twitter.com) and create a new app. be aware name and description are public. website can be anything, it doesn't matter. permissions can be read-only if you want (note to self, actually check to make sure this is true lol). generate an access token and you now have all the credentials you need.

`node index.js` and as long as it's all set up right it will archive every tweet by everyone you follow, excluding protected accounts, retweets, and tweets from... from my test account actually, note to self un-hardcode that number lol. it's (as of 2015/9/21) line 52 if you want to change the exclusions though. it will archive the user on first tweet and deletion messages so long as the deleted tweet has been archived. I'm only storing fields I think are vital (tho I'm open to suggestions on what else may be important). index.js and db.js are the only files that really matter atm. follow.js is just a script I was using to follow everyone on given lists, webserver.js isn't anything yet but it does show how to use the prewritten select in my pg wrapper to get deletions joined with relevant tweets and users.

this is reasonably safe to use on any account, from twitter's perspective you are one of likely hundreds of thousands generic user streams, they can't actually see what you're doing with the data they send. it is entirely possible you may draw their ire if you start, say, posting politicians' deleted tweets on a public website, so unless you don't tell anyone what you're doing, it would be prudent to use a throwaway account. use at your own risk not responsible if b& etc.

as for my instance of the bot, I intend to make it a non-trivial amount of work for twitter to find if they really care to kill it, but it's not going to be like, super secret. anyway the easist way for them would probably be to analyze following lists of open streams. I am kind of banking on the free speech contingent in the company sympathizing with the aim, and I have a pet theory that they caved to pressure on politwoops because it was operating with their knowledge and under their aegis. perhaps a semi-anon bot will give them enough to say "oh well what can ya do". but this is just for my convenience (ie, build something simple first and go complicated iff they do actually really want to kill it), and I do have plans for a v2 that would be virtually impossible to shut down if they really are serious about this ~right to be forgotten~ style nonsense.

##short term plans
* webserver.js becomes the backend for a site exposing deletions. this is seperate from the twitter part because archiving deleted tweets is something they would possibly revoke api access over, so I would like to make it at least a bit more work for them to find the bot than just "the one on the same ip as that site we don't like"
* simple frontend for said site, obv
* tests, simplified deploy, etc
* table for orphan deletion notices, currently just prints an error to stdout if it doesn't have the original tweet

##longer term plans
* fetch tweets after n days to see favs/rts/replies so we can sort deletions by how much ppl cared about the tweet
* option of sqlite, lower the barrier of entry for ppl who just want to run it on their laptop or w/e
* host images on imgur or something
* user categories eg congressperson senator bureaucrat (not necessarily hardcoded ofc) for filtering on that
* archive embedded tweets maybe
