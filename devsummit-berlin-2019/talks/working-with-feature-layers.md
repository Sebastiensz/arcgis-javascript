<!-- .slide: data-background="./images/working-with-feature-layers/bg-1.png" -->

<h1 style="text-align: left; font-size: 80px;">Working with Feature Layers</h1>
<h2 style="text-align: left; font-size: 60px;">in the ArcGIS API for JavaScript</h2>
</br>
<p style="text-align: left; font-size: 30px;">Julie Powell | Arno Fiva</p>

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-2.png" -->

## Agenda

</br>

* Bringing in your data
* Rendering
* Labeling
* Querying
* Building an interactive experience

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Feature Layers 101

* Rendered in 2D or 3D
* Limited to one geometry type per layer
* Geometries & attributes on client
* Loads only the attributes needed for rendering
* Can be created from a feature service or client-side graphics
* Used for editing

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Feature Layer powered by:

* [Feature Services](https://developers.arcgis.com/javascript/latest/sample-code/layers-featurelayer/index.html)
* [Portal Item](https://developers.arcgis.com/javascript/latest/sample-code/layers-portal/index.html)
* [Feature Collections](https://developers.arcgis.com/javascript/latest/sample-code/layers-featurelayer-collection/index.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## FeatureLayer by URL

```ts
const layer = new FeatureLayer({
  url: "https://<url to my server>/FeatureServer",
  layerId: 0,
  renderer: { ... },
  popupTemplate: { ... },
});

map.add(layer);
```

[Demo: Layer with a popup](./samples/working-with-feature-layers/1_bringing_data/1_byUrl_with_popup.html) | [Demo: Layer with LayerList](./samples/working-with-feature-layers/1_bringing_data/1_byUrl.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## FeatureLayer by URL

Restrict data retrieved from the feature service

* to work with a subset of features
* to remove features with `null` attributes.

```ts
layer.definitionExpression = "STATE_NAME = 'California'";
```

[Demo](./samples/working-with-feature-layers/1_bringing_data/2_byUrl_definitionExpression.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## FeatureLayer by portalItem

```ts
const portal = new Portal({
  url: "https://jsapi.maps.argis.com"
});

const layer = new FeatureLayer({
  portalItem: {
    id: "bca022ee5d9440c9b60399ee4d809d9b",
    portal
  }
});

map.add(layer);
```

[Demo: from a layer item](./samples/working-with-feature-layers/1_bringing_data/3_byPortalItem.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## FeatureLayer by Layer.fromPortalItem()

```ts
Layer.fromPortalItem({
  portalItem: {
    id: "82d8d8213afc4bb380bb16083735f573"
  }
})
.then((layer) => {
  map.add(layer);
});
```

[Demo](https://codepen.io/julie_powell/pen/yLLomyK)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## FeatureLayer by WebMap

Load a web map, then find the feature layer:
```ts
var webmap = new WebMap({
  portalItem: {
    id: "6b45a53c27034003aee8825550abf749"
  }
});

webmap.when(function () {
  treesLayer = webmap.layers.find(layer => layer.title === "Berlin Trees");
  ...
```

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## FeatureLayer by client-side graphics

1. Set the source (array of graphics).

2. Specify schema (name, alias, and type) of attributes.

3. Set the objectID field property to a field containing unique IDs

[Demo](./samples/working-with-feature-layers/1_bringing_data/5_byClientsideGraphics.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Rendering

A renderer defines how the `FeatureLayer` is drawn.

* SimpleRenderer
* ClassBreaksRenderer
* UniqueValueRenderer
* HeatmapRenderer
* DotDensityRenderer
* DictionaryRenderer

Guides are available in the API:

* [Visualization Overview guide](https://developers.arcgis.com/javascript/latest/guide/visualization-overview/)
* [Renderer API reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-renderers-Renderer.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Building a renderer

* [simple renderer](./samples/working-with-feature-layers/2_visualization/1_simple-renderer.html)
* [visual variables](./samples/working-with-feature-layers/2_visualization/2_visual-variables.html)
* [extrude in 3D](./samples/working-with-feature-layers/2_visualization/2_visual-variables.html)
* [smart mapping APIs](./samples/working-with-feature-layers/2_visualization/3_smart-mapping.html)
* [smart mapping sliders](./samples/working-with-feature-layers/2_visualization/4_slider.html)
<!-- * [loading from portal](./samples/working-with-feature-layers/2_visualization/5_portal-item.html) -->

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Labeling

</br>

Label features to show relevant information at a glance

</br>

* [simple labels](./samples/working-with-feature-layers/3_labeling/1_simple_label.html)
* [where clause](./samples/working-with-feature-layers/3_labeling/2_where_label.html)
* [multiple labels classes](./samples/working-with-feature-layers/3_labeling/3_multiple_label_classes.html)
* [min/max scale ranges](./samples/working-with-feature-layers/3_labeling/4_scaled_labels.html)
* [labels in 3D scenes](./samples/working-with-feature-layers/3_labeling/3d_labels.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Query the data from the server

Bring features from your data to the web browsers.

* <h4>Attribute queries</h4><small>select only features passing a WHERE SQL clause</small>
* <h4>Spatial queries</h4><small>select only features passing a spatial filter</small>
* <h4>Statistic queries</h4><small>returns statistics about the selected features</small>

[API Reference](https://developers.arcgis.com/javascript/latest/api-reference/esri-tasks-support-Query.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Query the data from the server

* [queryFeatures()](./samples/working-with-feature-layers/5_query/1_query_features.html)
* [queryFeatures() - by distance](./samples/working-with-feature-layers/5_query/2_query_features_by_distance.html)
* [queryFeatures() - pagination](./samples/working-with-feature-layers/5_query/3_query_features_pagination.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Query the data client-side

Query data already in the web browser

* really fast queries
* avoid round-trips to server
* only works with what is available

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Query the data client-side
<ul>
  <li>

  `LayerView` are created automatically, but _asynchronously_

  </li>
  <li>

  Use [`view.whenLayerView()`](https://jscore.esri.com/javascript/latest/api-reference/esri-views-SceneView.html#whenLayerView) to obtain the LayerView for a layer

  </li>
</ul>

```ts
var layer = new FeatureLayer({ ... });
view.map.add(layer);

// API will now create LayerView (async)

view
  .whenLayerView(layer)
  .then((layerView) => {
    // do something with the LayerView
    layerView.filter = { ... };
  });
```
<!-- .element: style="width: 50%; left: 50%; " -->

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Building an interactive experience

* Client-side filter & querying
* Filter & effects
* Time
* Editing

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Client-side capabilities on `Layerview`

</br>

* [Filter features by geometry](https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=layers-scenelayer-feature-masking)
* [Query features by geometry](https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=layers-scenelayerview-query-stats)

</br>

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Filter & effects

* Define filter criteria
* Emphasize features, and/or
* Deemphasize features

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Time

* Time slider widget
* Data must have a date field
* Control the view's time extent
* Can filter or just apply an effect

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Editing

</br>

Updating features directly in the web browser
</br>
</br>

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Editing

</br>

How do I know if I can edit features?
</br>
</br>
* [REST Supported Operations](https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/Thrift_Shops/FeatureServer/0)
* [ArcGIS Online / Portal Settings](https://jsapi.maps.arcgis.com/home/item.html?id=104c2a112e2242f69ac6bf5fb636cf04)
* ArcGIS Server Manager

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Editing

</br>

Two ways to edit features:

</br>

* [applyEdits()](https://developers.arcgis.com/javascript/latest/sample-code/editing-applyedits/live/index.html)

</br>
</br>

* [Editor widget](https://developers.arcgis.com/javascript/latest/sample-code/widgets-editor-basic/live/index.html)

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-3.png" -->

## Editor widget

</br>

<img style="float:bottom;" src="./images/working-with-feature-layers/editorWidget.png" alt="editorWidget">

</br>
</br>

[sample](https://developers.arcgis.com/javascript/latest/sample-code/popup-editaction/live/index.html)

</br>
</br>

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-2.png" -->

# Questions?

---

<!-- .slide: data-background="./images/working-with-feature-layers/alias_slide.png" -->

---

<!-- .slide: data-background="./images/working-with-feature-layers/bg-5.png" -->
