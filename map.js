
// Global variables
var map;
var markerGroup;
var backgroundImage;

var viewingMarker; // is the user currently viewing a marker?

var siteName, siteDescription;

var DEFAULT_ZOOM = 11;


/*
 * Initialize the Leaflet map
 */
function initMap() {

  // init map
  map = new L.map('map', {
    center: [49.8880, -119.4960],
    zoom: DEFAULT_ZOOM,
    maxBoundsViscosity: 1.0 // prevent user from dragging outside bounds
  });

  // temp tile layer for now
  var tileLayer = L.tileLayer('http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg', {
      //attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
      maxZoom: 18
  }).addTo(map);

  // add all sites to the map
  getSites();

  // site background image
  backgroundImage = null;

  viewingMarker = false;

  // markers in a site
  markerGroup = L.layerGroup().addTo(map);

  // log click locations
  map.on("contextmenu", function (event) {
    console.log("Coordinates: " + event.latlng.toString());
  });
}

/*
 * Query database for all sites and add them to the map.
 */
function getSites() {
  $.ajax({
      type: "post",
      url: "db/ajax_requests.php",
      data: {request: "get_sites"},
      success: function(result) {
        console.log(result);

        for (let site of result) {

          let markerImage = new Image();
          let siteIcon;
          markerImage.onload = function() {
            siteIcon = L.icon({
              iconUrl: this.src,
              iconSize: [this.width, this.height]
            });

            let marker = L.marker([site['latitude'], site['longitude']], {icon: siteIcon}).addTo(map);

            marker.on("click", function() {
              map.removeLayer(this);
              loadSite(site['id'], site['longitude'], site['latitude'], site['background_image'], site['name'], site['description']);
            });
          }
          markerImage.src = "images/sites/" + site['marker_image'];

        }

      },
      error: function(jqXHR, textStatus, errorThrown){
        alert(textStatus, errorThrown);
     }
  });
}

function updateContent(title, text, image = null, video = null, date = null) {
  $("#content-title").text(title);
  $("#content-image").attr("src", image);
  $("#content-text").text(text);
  if (date !== null) {
    $("#content-date").text("Date: " + date);
  } else {
    $("#content-date").text("");
  }
}

/*
 * Called when a site is clicked. Loads the site background and all markers at the site.
 */
function loadSite(id, longitude, latitude, background, name, description) {

  siteName = name;
  siteDescription = description;

  updateContent(name, description);

  // add back button
  addBackButton();


  // disableUserControl();
  map.setView([latitude, longitude], DEFAULT_ZOOM, {animate: false}); // set to long and lat of the site
  //map.setZoom(DEFAULT_ZOOM + 1);

  backgroundImage = L.imageOverlay("images/sites/" + background, [map.getBounds().getNorthWest(), map.getBounds().getSouthEast()]);
  backgroundImage.addTo(map); // add custom site background image

  map.setMaxBounds(backgroundImage.getBounds());

  // restrict zooming
  map._layersMaxZoom = 13;
  map._layersMinZoom = DEFAULT_ZOOM;

  // get markers for the site
  $.ajax({
      type: "post",
      url: "db/ajax_requests.php",
      data: {request: "get_markers", arg1: id},
      success: function(result) {

        for (let feature of result) {

          let markerImage = new Image();
          let markerIcon;
          markerImage.onload = function() {
              markerIcon = L.icon({
              iconUrl: this.src,
              iconSize: [this.width, this.height]
            });

            let marker = L.marker([feature['latitude'], feature['longitude']], {icon: markerIcon}).addTo(markerGroup);


            marker.on("click", function() {
              map.setView(this.getLatLng(), DEFAULT_ZOOM + 1); // center and zoom on marker
              updateContent(feature['name'], feature['content_text'],  "images/content/" + feature['content_image'], null, feature['date_added']);
              viewingMarker = true;
            });


          }
          markerImage.src = "images/markers/" + feature['marker_image'];
        }

      },
      error: function(jqXHR, textStatus, errorThrown){
        alert(textStatus, errorThrown);
     }
  });

  addBackButton();

}

function addBackButton() {
  $("#back-button").css("display", "inline");
}

function removeBackButton() {
  $("#back-button").css("display", "none");
}

/*
 * Called when the back button is clicked.
 */
function goBack() {
  map.setZoom(DEFAULT_ZOOM);

  if (viewingMarker) {
    updateContent(siteName, siteDescription);
    viewingMarker = false;
  } else {
    removeBackButton();
    map.removeLayer(backgroundImage);
    markerGroup.clearLayers();
    map.setMaxBounds(null);
    getSites();

    updateContent("Welcome to the BFB Map!", "This map records significant project activities and knowledge that has been produced at major sites of activity. Start by clicking on either Kelowna or Richmond, and then click an image for more information about it.");
  }
}

/*
 * Removes zoom buttons, disables dragging and zooming.
 */
function disableUserControl() {
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  $(".leaflet-control-zoom").css("display", "none");
  map.dragging.disable();
}

/*
 * Adds zoom buttons, enables dragging and zooming
 */
function enableUserControl() {
  map.touchZoom.enable();
  map.doubleClickZoom.enable();
  map.scrollWheelZoom.enable();
  map.boxZoom.enable();
  map.keyboard.enable();
  $(".leaflet-control-zoom").css("display", "block");
  map.dragging.enable();
}
