var yelp = require("yelp").createClient({
	consumer_key: "WfkORSjJeoUt0XCvTEHTFQ",
	consumer_secret: "zISQZDZrVUveQ8qtotJgtytZG9A",
	token: "5f4z1DUDtbGGCdQ_oLUwgGDZzvyaAq80",
	token_secret: "UQj34u7ivKzRVffCsmHAyFMscL0"
});

// Need to change this so parameters passed in are variables
yelp.search({term: "food", location: "Pasadena, CA", cll: "34.139011, -118.124514", radius_filter: "3218", limit: "1"}, function(error, data) {
	$.each(data, function(key, val) {
		console.log(key + " " + val);
	});
});