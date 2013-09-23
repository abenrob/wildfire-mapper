var geojsonlayer;
var terrain = L.tileLayer(
  'http://api.tiles.mapbox.com/v3/grafa.map-8cndm7h3/{z}/{x}/{y}.png', {
    attribution: "<a href='http://mapbox.com'>Mapbox</a>"
    });

var streets = L.tileLayer(
  'http://api.tiles.mapbox.com/v3/grafa.map-omtiruqb/{z}/{x}/{y}.png', {
    attribution: "<a href='http://mapbox.com'>Mapbox</a>"
    });
function addCommas(nStr){
  nStr += '';
  x = nStr.split('.');
  x1 = x[0];
  x2 = x.length > 1 ? '.' + x[1] : '';
  var rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1' + ',' + '$2');
  }
  return x1 + x2;
}
function getRadius(n) {
    return n > 200000 ? 24 :
    n > 100000 ? 20 :
    n > 50000 ? 16 :
    n > 25000 ? 12 :
    n > 15000 ? 8 :
    n > 5000 ? 4 :
      2;
}
function geojsonMarkerOptions(feature) {
    return {
        radius: getRadius(feature.properties.area),
        color: '#990000',
        fillColor: "#990000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.7
    }
};
function onEachFeature(feature, layer) {
  layer.bindPopup('<h2>' + feature.properties.fire_name + '</h2>'+ 
    '<strong>Fire Number: </strong>' + feature.properties.fire_number + '<br />' + 
    '<strong>Acres Burned: </strong>' + addCommas(feature.properties.area) + '<br />' + 
    '<strong>Report Date: </strong>' + feature.properties.report_date);
} 
var USBounds = [[24, -125],[50, -66]]
var map = L.map('map');
terrain.addTo(map);
map.fitBounds(USBounds);
L.control.layers({
    "Darkness (default)": terrain,
    "Mapbox Streets": streets
}).addTo(map);

function dateFormat(date) {
  var day = date.getDate();
  if (day < 10) {
    day = '0'+day.toString();
  }
  else {
    day = day.toString();
  }
  var mo = date.getMonth()+1;
  if (mo < 10) {
    mo = '0'+mo.toString();
  }
  else {
    mo = mo.toString();
  }
  var yr = date.getFullYear().toString();
  var dateSt = yr+'-'+mo+'-'+day;
  return dateSt;
}

var picker = new Pikaday({
  field: $('#datepicker')[0],
  defaultDate: new Date(),
  minDate: new Date(2009,04,20),
  maxDate: new Date(),
  onSelect: function(date) {
    var pikDateSt = dateFormat(date);
    $('#msg').text('');
    getFires(pikDateSt);
  }
});
picker.setDate(new Date());
getFires(dateFormat(new Date()));

function getFires(datestring){
  $.ajax({
        url: "http://fire-api.herokuapp.com/api/v1.0/"+datestring,
        // jsonp for x-domain calls
        dataType: "jsonp",
        cache: true,
        success: function (data) {
          if (data.geojson) {
            if (map.hasLayer(geojsonlayer)) {
                map.removeLayer(geojsonlayer);
            };
            geojsonlayer = L.geoJson(data.geojson, {
              onEachFeature: onEachFeature,
              pointToLayer: function (feature, latlng) {
                  return L.circleMarker(latlng, geojsonMarkerOptions(feature));
              }
            });
            geojsonlayer.addTo(map);
            map.fitBounds(geojsonlayer.getBounds());
          }
          else {
            $('#msg').text('No fires found on this date.');
          }
        }
  });
}