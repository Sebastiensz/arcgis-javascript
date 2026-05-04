<!-- .slide: data-background="images/bg-1.png" data-title="add-scene-layer" class="title" -->

# <span style="font-size: 0.8em;">ArcGIS API for JavaScript</span><br>Building Interactive 3D Web Apps Using Open Data


Jochen Manegold, Esri Germany \
Arno Fiva, Esri R&D Center Zürich

ESRI EUROPEAN DEVELOPER SUMMIT​

![Logo](images/esri-logo.png)

---

<!-- .slide: data-background="images/bg-4.png"  data-background-size="cover" data-title="earthquakes-intro" -->


## Earthquakes

<iframe data-src="./samples/3d-dashboard-earthquake/" style="width: 50%"></iframe>


---

<!-- .slide: data-background="images/bg-2.png" data-background-size="cover" -->

## Basemap

<iframe data-src="http://www.arcgis.com/home/item.html?id=a66bfb7dd3b14228bf7ba42b138fe2ea"></iframe>

[http://www.arcgis.com/home/item.html?id=a66bfb7dd3b14228bf7ba42b138fe2ea](http://www.arcgis.com/home/item.html?id=a66bfb7dd3b14228bf7ba42b138fe2ea)


---

<!-- .slide: data-background="images/bg-2.png" data-background-size="cover" -->

## Basemap

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<pre><code class="lang-html">&lt;!-- Use dark theme --&gt;
&lt;link rel="stylesheet"
  href="https://js.arcgis.com/4.13/esri/themes/dark/main.css"
&gt;
</code></pre>
</div>

<div class="code-snippet">
<pre><code class="lang-ts">// Add Firefly basemap
Layer.fromPortalItem({
  portalItem: {
    id: "a66bfb7dd3b14228bf7ba42b138fe2ea"
  }
}).then(function(layer) {
  map.add(layer);
});</code></pre>
</div>

<div class="code-snippet">
<pre><code class="lang-ts">// Enable stars
map.basemap = null;
view.environment.lighting.starsEnabled = true;</code></pre>
</div>


  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-dashboard-earthquake/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" -->

## Visualize Data

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="addFeatureLayer"></button>
<pre><code class="lang-ts">// Feature Layer URL
var url =
  "https://services1.arcgis.com/wdMHWK8xfn32LjIy/...";
// Add FeatureLayer to scene
const earthquakesLayer = new FeatureLayer({
  url,
  outFields: ["dateTime", "mag", "depth",
    "latitude", "longitude"],
  screenSizePerspectiveEnabled: false
});</code></pre>
</div>

<div class="code-snippet">
<button class="play" id="addElevationInfo"></button>
<pre><code class="lang-ts">// Invert and exeggerate earthquake depths
earthquakesLayer.elevationInfo = {
  mode: "absolute-height",
  featureExpressionInfo: {
    expression: "$feature.depth * 2"
  },
  unit: "kilometers"
};
</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-dashboard-earthquake/" ></iframe>
  </div>
</div>

---

<!-- .slide: data-background="images/bg-2.png" data-title="earthquakes-renderer" -->

## Visualize Data

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="addRenderer"></button>
<pre><code class="lang-ts" style="max-height: 450px; overflow: scroll;">// Color points according to magnitude
var magValues = {
  min: {
    value: 4,
    size: 1,
    color: [255, 221, 48]
  },
  max: {
    value: 7,
    size: 8,
    color: [255, 58, 48]
  }
};
// Use visualVariables on SimpleRenderer
earthquakesLayer.renderer = {
  type: "simple",
  symbol: {
    type: "point-3d",
    symbolLayers: [{
      type: "icon",
      resource: { primitive: "circle" }
    }]
  },
  visualVariables: [
    {
      type: "size",
      field: "mag",
      stops: [{
        value: magValues.min.value,
        size: magValues.min.size+"px"
      }, {
        value: magValues.max.value,
        size: magValues.max.size+"px"
      }]
    },
    {
      type: "color",
      field: "mag",
      stops: [{
        value: magValues.min.value,
        color: magValues.min.color,
      }, {
        value: magValues.max.value,
        color: magValues.max.color
      }]
    }
  ]
}
</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-dashboard-earthquake/" ></iframe>
  </div>
</div>

---

<!-- .slide: data-background="images/bg-2.png" data-title="earthquakes-highlight" -->

## Interactions

Client-side Queries

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="addHighlights"></button>
<pre><code class="lang-ts">// Highlight earthquakes near pointer
view.on("pointer-move", function (event) {

  // Query features on layer view
  view.whenLayerView(earthquakesLayer)
    .then(layerView => {
      var query = layerView.createQuery();
      query.geometry = view.toMap(event);
      query.distance = 500;
      query.units = "kilometers";
      return layerView.queryFeatures(query)
        .then(results => {
          layerView.highlight(results.features)
        });
    });

});</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-dashboard-earthquake/" ></iframe>
  </div>
</div>

---

<!-- .slide: data-background="images/bg-2.png" data-title="earthquakes-stats" -->

## Interactions

Dashboard using [Chart.js](https://www.chartjs.org/)

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="addStats"></button>
<pre><code class="lang-ts">// Highlight earthquakes near pointer
return layerView.queryFeatures(query).then(results => {
  layerView.highlight(results.features)</code></pre>
</div>

<div class="code-snippet fragment">
<pre><code class="lang-ts">  // All magnitudes
  var magValues = results.features.map(
    e => e.attributes.mag
  );</code></pre>
</div>

<div class="code-snippet fragment">
<pre><code class="lang-ts">  // Average magnitude
  var avg = magValues.reduce((a,b) => a + b, 0)
            / magValues.length;</code></pre>
</div>

<div class="code-snippet fragment">
<pre><code class="lang-ts">  // Max magnitude
  var max = Math.max(...magValues);</code></pre>
</div>

<div class="code-snippet">
<pre><code class="lang-ts">});</code></pre>
</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-dashboard-earthquake/" ></iframe>
  </div>
</div>

---

<!-- .slide: data-background="images/bg-4.png"  data-background-size="cover" -->

## City Visualizations

---

<!-- .slide: data-background="images/bg-2.png" -->

## City Visualizations

Add 2D Data

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="add2DData"></button>

```ts
var osmBuildings = new FeatureLayer({
  url: "https://.../osm_buildings_berlin/...",
});

var trees = new FeatureLayer({
  url: "https://.../open_data_trees_berlin/...",

});

map.add(osmBuildings);
map.add(trees);
```

</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-berlin/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" data-title="extrudeOSMBuildings" -->

## City Visualizations

Extrude Buildings

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="extrudeOSMBuildings"></button>

```ts
osmBuildings.renderer = new SimpleRenderer({
  symbol: new PolygonSymbol3D({
    symbolLayers: [
      new ExtrudeSymbol3DLayer({
        material: {
          color: "#FC921F"
        },
        edges: {
          type: "solid",
          color: "#AF6515"
        },
        size: 10,
      })
    ]
  })
});
```

</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-berlin/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" data-title="extrudeBuildingHeights" -->

## City Visualizations

Extrude Building Heights

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="extrudeBuildingHeights"></button>

```ts
// Layer containing building heights
var buildings = new FeatureLayer({
  url: "https://.../osm_buildings_berlin/...",
});
map.add(buildings);

buildings.renderer = new SimpleRenderer({
  ...

  visualVariables: [{
    type: "size",
    valueExpression: "$feature.AnzahlDerO * 3",
    valueUnit: "meters"
  }]
});
```

</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-berlin/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" data-title="placeTrees" -->

## City Visualizations

Use `WebStyleSymbol` for Trees

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="placeTrees"></button>

```ts
var trees = new FeatureLayer({
  url: "https://.../open_data_trees_berlin/...",
});

trees.renderer = new SimpleRenderer({
  symbol: new WebStyleSymbol({
    styleName: "esriRealisticTreesStyle",
    name: "Acer",
  }),
  visualVariables: [{
    type: "size",
    axis: "height",
    field: "BaumHoehe",
    valueUnit: "meters"
  }]
}
```

</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-berlin/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" data-title="tempelhof" -->

## City Visualizations

3D Buildings

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">
<button class="play" id="addTempelhof"></button>

```ts
const tempelhof = new SceneLayer({
  url: "https://.../airport_tempelhof/...",
});

map.add(tempelhof);
```

</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-berlin/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" data-title="sketch" -->

## City Visualizations

Sketch Tools

<div class="two-columns">
  <div class="left-column">

<div class="code-snippet">

```ts
new SketchViewModel({
  layer: graphicsLayer,
  view: view,
  pointSymbol: new WebStyleSymbol({
    name: "Airplane_Large_Passenger_With_Wheels",
    styleName: "EsriRealisticTransportationStyle"
  }),
  polygonSymbol: new PolygonSymbol3D({
    symbolLayers: [
      new ExtrudeSymbol3DLayer({
        material: {
          color: "lemonchiffon"
        },
        edges: {
            type: "sketch",
            size: "3px",
            color: "gray"
          },
        size: 25,
      })
    ]
  }),
});
```

</div>

  </div>
  <div class="right-column">
    <iframe data-src="./samples/3d-berlin/" ></iframe>
  </div>
</div>


---

<!-- .slide: data-background="images/bg-2.png" data-title="sketch" -->

## Summary

For this session we used data from

* USGS (https://earthquake.usgs.gov/earthquakes)
* OpenStreetMap (http://download.geofabrik.de/europe.html)
* Esri Deutschland Open Data Portal (https://opendata-esri-de.opendata.arcgis.com)
* Open Data Berlin Portal (https://daten.berlin.de)


<blockquote>

Check [https://github.com/arnofiva](http://github.com/arnofiva) for slides and source code after DevSummit

</blockquote>

---

<!-- .slide: data-background="images/bg-3.png" -->

Please Take Our Survey on the App

![images/survey.png](images/survey.png)

---

<!-- .slide: data-background="images/bg-final.png" -->



