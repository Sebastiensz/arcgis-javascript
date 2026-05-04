require([
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/core/watchUtils",
  "esri/widgets/Slider",
  "./Clock.js"
], function(
  WebScene,
  SceneView,
  watchUtils,
  Slider,
  Clock
) {

  var map = new WebScene({
    portalItem: {
      id: "4fba26457a3f4a149b899308520ce700"
    }
  });

  var view = new SceneView({
    qualityProfile: "high",
    container: "viewDiv",
    map,
  });

  view.ui.add(["play-button", "water-button"], "top-left");
  view.ui.add("clock", "top-right");
  view.ui.add("menu", "bottom-right");

  view.when().then(() => {

    var waterSlides = view.map.presentation.slides.filter(s => s.title.text === "Water");
    waterSlides.getItemAt(0).applyTo(view, {animate: false});

    var waterLayer = view.map.layers.find(l => l.title === "Water");
    var waterRenderer = waterLayer.renderer;
    waterLayer.renderer = {
      type: "simple",
      symbol: {
        type: "polygon-3d",  // autocasts as new PolygonSymbol3D()
        symbolLayers: [{
          type: "fill",  // autocasts as new FillSymbol3DLayer()
          material: { color: waterRenderer.symbol.symbolLayers.getItemAt(0).color }
        }]
      }
    };

    function showWater() {
      waterSlides.getItemAt(1).applyTo(view, {duration: 2000});

    }

    function showTools() {
      waterLayer.renderer = waterRenderer;


      var clock = new Clock({
        el: "clock",
        width: 220,
        height: 220,
        mode: "manual",
        skin:
          "./clock.svg",
        time: view.environment.lighting.date.getTime()
      });

      // update the time of the view when the clock time changes
      clock.on("time-change", function(time) {
        view.environment.lighting.date = time;
      });

      document.getElementById("menu").classList.remove("hide");
    }


    const slider = new Slider({
      container: "waveSlider",
      min: 0,
      max: 360,
      labelsVisible: true,
      precision: 0,
      values: [260]
    });

    slider.on("thumb-drag", function(event) {
      const value = parseInt(event.value);
      const renderer = waterLayer.renderer.clone();
      renderer.symbol.symbolLayers.getItemAt(0).waveDirection = value;
      waterLayer.renderer = renderer;
    });

    const waveStrengthRadio = document.getElementsByName(
      "waveStrengthRadio"
    );

    for (let i = 0; i < waveStrengthRadio.length; i++) {
      const element = waveStrengthRadio[i];
      element.addEventListener("change", function(event) {
        const renderer = waterLayer.renderer.clone();
        renderer.symbol.symbolLayers.getItemAt(0).waveStrength =
          event.target.value;
        waterLayer.renderer = renderer;
      });
    }

    function setWaterColor(color) {
      const renderer = waterLayer.renderer.clone();
      renderer.symbol.symbolLayers.getItemAt(0).color = color;
      waterLayer.renderer = renderer;
    }

    window.setColor = setWaterColor;

    document.getElementById("navy").addEventListener("click", function() {
      setWaterColor("#00c5ff");
    });
    document.getElementById("green").addEventListener("click", function() {
      setWaterColor("#039962");
    });
    document
      .getElementById("turqoise")
      .addEventListener("click", function() {
        setWaterColor("#d4b882");
      });

    document.getElementById("water-button").addEventListener("click", showTools);
    document.getElementById("play-button").addEventListener("click", showWater);


  }).catch(console.error);



});
