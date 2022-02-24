require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer"
  ],
  function(
    Map, MapView,
    FeatureLayer
  ) {

    var map = new Map({
      basemap: "hybrid"
    });

    var view = new MapView({
      container: "viewDiv",
      map: map,

      extent: { // autocasts as new Extent()
        xmin: -9177811,
        ymin: 4247000,
        xmax: -9176791,
        ymax: 4247784,
        spatialReference: 102100
      }
    });

    /********************
     * Add feature layer
     ********************/

    // Carbon storage of trees in Warren Wilson College.
    var featureLayer = new FeatureLayer({
      url: "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/arcgis/rest/services/Landscape_Trees/FeatureServer/0"
    });

    map.add(featureLayer);

  });
