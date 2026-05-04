define([
  "esri/layers/ElevationLayer",
  "esri/layers/BaseElevationLayer"
], function (ElevationLayer, BaseElevationLayer) {

  const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({

    // Add an exaggeration property whose value will be used
    // to multiply the elevations at each tile by a specified
    // factor. In this case terrain will render 100x the actual elevation.

    declaredClass: "ExaggeratedElevationLayer",
    title: "Exaggerated Elevation",

    properties: {
      exaggeration: 10
    },

    // The load() method is called when the layer is added to the map
    // prior to it being rendered in the view.

    load: function () {

      this._elevation = new ElevationLayer({
        url: this.url || "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
      });

      // wait for the elevation layer to load before resolving load()
      this.addResolvingPromise(this._elevation.load());
    },

    // Fetches the tile(s) visible in the view
    fetchTile: function (level, row, col) {
      // calls fetchTile() on the elevationlayer for the tiles
      // visible in the view
      return this._elevation.fetchTile(level, row, col).then((data) => {
        console.info(level, row, col, data);

        //const exaggeration = this.exaggeration;
        // `data` is an object that contains the
        // the width of the tile in pixels,
        // the height of the tile in pixels,
        // and the values of each pixel
        data.values.forEach((value, index, values) => {
          // each value represents an elevation sample for the
          // given pixel position in the tile. Multiply this
          // by the exaggeration value
          values[index] = value * this.exaggeration;
        });

        return data;
      });
    }
  });

  ExaggeratedElevationLayer.version = "0.0.1";

  return ExaggeratedElevationLayer;
});