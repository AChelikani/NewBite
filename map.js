// Mapbox and Firebase setup
L.mapbox.accessToken = 'pk.eyJ1Ijoic29jYWxkZXYiLCJhIjoiZDY2MGE5NWZhM2I0MTljODEyYTQxMzhmYmI5ODljNDUifQ.zRANwM_bBUoK33R0VGRPHw';
var map = L.mapbox.map('map', 'mapbox.streets');
var myFirebase = new Firebase("https://glaring-torch-6121.firebaseio.com/");

// (lat, long) -> concatenation makes for a unique id
function markVisited(markerId) {
  // Generates unique ID within database on creation
  myFirebase.push({
      id: markerId,
      visited: "yes"
    });
};

// Add element to database
function addToDatabase(markerId) {
  myFirebase.set({
    id: markerId,
    visited: "no"
  });
};

// Find position of restaurant (by buttonId) in current map features array
function restaurantIndex(buttonId, json) {
  for(i = 0; i < LIMIT; i ++) {
    var temp = String(json[i].geometry.coordinates[0]) + " " + String(json[i].geometry.coordinates[1]);
    if (temp == buttonId) {
      return i;
    }
  }
  return -1;
};

// Visited
function visited() {
  var e = window.event,
    btn = e.target || e.srcElement;
  geojson[restaurantIndex(btn.id, geojson)].properties["marker-color"] = "#5151FC";
  featureLayer.setGeoJSON(geojson);
  markVisited(btn.id);
};

var visitedArr = [];
// Read from database
myFirebase.on("child_added", function(snapshot, prevChildKey) {
  var newPost = snapshot.val();
  var temp = newPost.id;
  visitedArr.push(temp);
});

// Default start value is Pasadena, CA
var latVal = "#{user.customData.latitude}";
var longVal = "#{user.customData.longitude}";

// Constants
var LIMIT = 50;
var RADIUS = 2000;

var newURL = "http://api.v3.factual.com/t/restaurants-us?geo={%22$circle%22:{%22$center%22:[" + latVal + "," + longVal + "],%22$meters%22:%20" + RADIUS + "}}" + "&limit=" + LIMIT + "&KEY=OGuAUQmSvTSqP5Jv6PJqn0UZ0bXEtHbOlOKcwVcR";
// Initializing constants
var factualData = "";
var longArr = [];
var latArr = [];
var nameArr = [];

// Makes function call synchronous
$.ajaxSetup({"async": false});

$.getJSON(newURL, function(data) {
  factualData = JSON.stringify(data);
});

// Manipulating Factual API data in order to create markers
var latPos = factualData.indexOf("latitude");
var longPos = factualData.indexOf("longitude");
var namePos = factualData.indexOf('"name"');
var counter = 0;
while (counter < LIMIT) {
  var lat = factualData.substring(latPos+10, factualData.indexOf(",", latPos));
  var long = factualData.substring(longPos+11, factualData.indexOf(",", longPos));
  var name = factualData.substring(namePos+7, factualData.indexOf(",", namePos)-1);
  longArr.push(long);
  latArr.push(lat);
  nameArr.push(name.replace('"', ''));

  latPos = factualData.indexOf("latitude", latPos+2);
  longPos = factualData.indexOf("longitude", longPos+2);
  namePos = factualData.indexOf('"name"', namePos+2);

  counter ++;
}

var locations = '[ ';
var visitedPoints = visitedArr;

for(i = 0; i < LIMIT; i ++) {
  var bId = String(longArr[i]) + " " + String(latArr[i]);
  if (visitedPoints.indexOf(bId) == -1) {
    var temp = '{ "type": "Feature", "geometry": { "type" : "Point", "coordinates" : [' + String(longArr[i]) + ', ' + String(latArr[i]) + '] }, "properties": { "title": "' + String(nameArr[i]) + '", "marker-color": "#000000", "marker-size": "large", "marker-symbol": "restaurant"} }, ';
    if (i == LIMIT-1) {
      var temp = '{ "type": "Feature", "geometry": { "type" : "Point", "coordinates" : [' + String(longArr[i]) + ', ' + String(latArr[i]) + '] }, "properties": { "title": "' + String(nameArr[i]) + '", "marker-color": "#000000", "marker-size": "large", "marker-symbol": "restaurant"} } ';
    }
  }
  else {
    if (i == LIMIT-1) {
      var temp = '{ "type": "Feature", "geometry": { "type" : "Point", "coordinates" : [' + String(longArr[i]) + ', ' + String(latArr[i]) + '] }, "properties": { "title": "' + String(nameArr[i]) + '", "marker-color": "#000000", "marker-size": "large", "marker-symbol": "restaurant"} } ';
    }   
    var temp = '{ "type": "Feature", "geometry": { "type" : "Point", "coordinates" : [' + String(longArr[i]) + ', ' + String(latArr[i]) + '] }, "properties": { "title": "' + String(nameArr[i]) + '", "marker-color": "#5151FC", "marker-size": "large", "marker-symbol": "restaurant"} }, ';
  }
  locations = locations + temp;
}
locations = locations + ' ]'

var geojson = JSON.parse(locations);

// Renders map
map.addControl(L.mapbox.geocoderControl('mapbox.places'));
map.setView([latVal, longVal], 17);

// Add layer of markers to map
var featureLayer = L.mapbox.featureLayer()
  .addTo(map);

// Runs when featureLayer is added to the map
featureLayer.on("layeradd", function(e) {
  var marker = e.layer;
  var markerTitle = e.layer.feature.properties.title;
  var buttonId = String(e.layer.feature.geometry.coordinates[0]) + " " + String(e.layer.feature.geometry.coordinates[1]);

  // Content that appears when each marker is clicked
  var popupContent = "<h2>" + markerTitle + "</h2>" + 
                     "<button id=\"" + buttonId + "\" onclick='visited()'>Visited!</button";

  // Binds a popup with content to the marker
  marker.bindPopup(popupContent, {
    closeButton: false
    });
});



featureLayer.setGeoJSON(geojson);