require([
  "esri/Camera",
  "esri/WebScene",
  "esri/views/SceneView",
  "esri/layers/FeatureLayer",
  "esri/layers/ElevationLayer",
  "esri/layers/BaseElevationLayer",
  "esri/layers/GraphicsLayer",
  "esri/layers/GeoJSONLayer",

  "polyspline/layers/SplineLayerProxy",
  "animations/layers/LineLayerAnimation",
  "animations/support/interpolate",
], function(
  Camera,
  WebScene,
  SceneView,
  FeatureLayer,
  ElevationLayer,
  BaseElevationLayer,
  GraphicsLayer,
  GeoJSONLayer,
  SplineLayerProxy,
  LineLayerAnimation,
  interpolate,
) {
  const exaggeration = 2;

  // const shoreColor = "#d3a561";
  // const peakColor = "#afa64d"
  const shoreColor = "#F2E6C9";
  const peakColor = "#d3a561";
  //"#d3a561"; //"#5e7b49";

  let r = (Math.random()*0xFFFFFF<<0).toString(16);

  const ExaggeratedElevationLayer = BaseElevationLayer.createSubclass({
    load: function() {
      this._elevation = new ElevationLayer({
        url:
          "//elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer"
      });

      this.addResolvingPromise(this._elevation.load());
    },

    fetchTile: function(level, row, col) {
      // calls fetchTile() on the elevationlayer for the tiles
      // visible in the view
      return this._elevation.fetchTile(level, row, col).then(
        function(data) {
          for (var i = 0; i < data.values.length; i++) {
            if (5 < data.values[i]) {
              data.values[i] = 350 + data.values[i] * exaggeration;
            } else {
              data.values[i] =
                100 +
                Math.max(0, data.values[i]) / 5 * (250 + 5 * exaggeration);
            }
          }

          return data;
        }.bind(this)
      );
    }
  });

  var map = new WebScene({
    portalItem: {
      id: "d6827020c7e3436ca41e85d7ea34d586"
    }
  });

  map
    .when()
    .then(function() {
      map.basemap = null;
      map.ground = {
        opacity: 0,
        layers: [new ExaggeratedElevationLayer()]
      };
    })
    .catch(console.error);

  var spatialReference = { latestWkid: 3857, wkid: 102100 };
  var xmax = 3219733.10185993;
  var xmin = 2469807.4124613777;
  var ymax = 4812658.381941555;
  var ymin = 4093377.112770231;

  // var xmax = 2919733.10185993;
  // var xmin = 2769807.4124613777;
  // var ymax = 4512658.381941555;
  // var ymin = 4393377.112770231;

  var view = new SceneView({
    container: "viewDiv",
    viewingMode: "global",
    map: map,
    qualityProfile: "high",
    environment: {
      background: {
        type: "color",
        color: [255, 255, 255]
      },
      starsEnabled: false,
      atmosphere: {
        quality: "high",
      },
      atmosphereEnabled: false,
      lighting: {
        directShadowsEnabled: true
      }
    },
    ui: {
      components: [ "attribution" ]
    }
  });

  //  ca7b360f05c04427b8f57ccba7e6db0a

  var contours = new FeatureLayer({
    portalItem: {
      id: "91c295366dac4cedacb8427f73d1575c"
    },
    elevationInfo: {
      mode: "absolute-height",
      featureExpressionInfo: {
        expression: "5 + $feature.Contour*1.3*" + exaggeration
      }
    },
    definitionExpression: "MOD(Contour - 50,50) = 0",
    renderer: {
      type: "simple",
      // field: "Contour",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            type: "extrude",
            size: 30 * exaggeration
          }
        ]
      },
      visualVariables: [
        {
          type: "color",
          field: "Contour",
          stops: [
            { value: 450, color: peakColor },
            /* { value: 200, color: "#afa64d" },*/
            { value: 0, color: shoreColor }
          ]
        }
      ]
    }
  });

  var islands = new FeatureLayer({
    portalItem: {
      id: "ca7b360f05c04427b8f57ccba7e6db0a"
    },
    elevationInfo: {
      mode: "absolute-height",
      offset: "0"
    },
    renderer: {
      type: "simple",
      symbol: {
        type: "polygon-3d",
        symbolLayers: [
          {
            material: {
              color: shoreColor
            },
            type: "extrude",
            size: 50
          }
        ]
      }
    },
    labelingInfo: [
      {
        //labelPlacement: "above-center",
        labelExpressionInfo: {
          value: "{NAME}"
        },
        symbol: {
          type: "label-3d",
          symbolLayers: [
            {
              type: "text",
              material: {
                color: [86, 72, 31, 0.6]
              },
              halo: {
                color: [255, 255, 255, 0.5],
                size: 1.5
              },
              font: {
                weight: "bold"
              },
              size: 14
            }
          ],
          verticalOffset: {
            screenLength: 20,
            maxWorldLength: 1000 * exaggeration,
            minWorldLength: 300 * exaggeration
          },
          // callout: {
          //   type: "line",
          //   size: 0,
          //   color: [86, 72, 31, 0.0]
          // }
        }
      }
    ]
  });

  var poiProperties = {
    elevationInfo: {
      mode: "relative-to-ground"
    },
    url: "https://gist.githubusercontent.com/arnofiva/b1fbaea80a8cc459e0d05244f5930d81/raw/cyclades_points_frontconf.geojson?" + r,
    outFields: ["*"],
    renderer: {
      type: "simple",
      symbol: {
        type: "point-3d",
        symbolLayers: [
          {
            type: "icon",
            resource: {
              primitive: "circle"
            },
            material: {
              color: "black"
            },
            size: 4,
          }
        ],
        verticalOffset: {
          screenLength: 50,
          minWorldLength: 300 * exaggeration,
          maxWorldLength: 1500 * exaggeration,
        },
        callout: {
          type: "line",
          size: 1,
          color: [86, 72, 31],
        }
      }
    },
    labelingInfo: [
      {
        labelPlacement: "above-center",
        labelExpressionInfo: {
          value: "{label}"
        },
        symbol: {
          type: "label-3d",
          symbolLayers: [
            {
              type: "text",
              material: {
                color: [86, 72, 31]
              },
              halo: {
                color: [255, 255, 255, 0.75],
                size: 1.5
              },
              font: {
                weight: "bold",
                style: "italic"
              },
              size: 10
            }
          ]
        }
      }
    ]
  };

  var pointsOfInterest = new GeoJSONLayer({
    ...poiProperties,
    definitionExpression: "OBJECTID NOT IN (6, 7, 8, 9, 10)"
  });

  var ocean = new GraphicsLayer({
    elevationInfo: {
      mode: "absolute-height",
      offset: 13200
    }
  });

  var routeProperties = {
    elevationInfo: {
      mode: "on-the-ground"
    },
    url: "https://gist.githubusercontent.com/arnofiva/7f9b30386ba25429070f66cc350b6e2d/raw/cyclades_lines_frontconf.geojson?" + r,
    outFields: ["*"],
    renderer: {
      type: "simple",
      symbol: {
        type: "line-3d", // autocasts as new LineSymbol3D()
        symbolLayers: [
          {
            type: "path", // autocasts as new PathSymbol3DLayer()
            profile: "quad", // creates a rectangular shape
            width: 150, // path width in meters
            height: 0, // path height in meters
            material: { color: "#d42300" },
            cap: "round",
            profileRotation: "heading"
          }
        ]
      }
    }
  };


  map.add(ocean);
  map.add(islands);
  map.add(pointsOfInterest);
  map.add(contours);

  var animatedRoute;
  var splineRoute = new SplineLayerProxy({
    lineLayer: new GeoJSONLayer({
      ...routeProperties,
      // definitionExpression: "OBJECTID NOT IN (6, 7, 10)",
    })
  });

  splineRoute.whenSplineLayer().then(function(layer) {
    animatedRoute = new LineLayerAnimation({
      sourceLayer: layer
    });
    animatedRoute.whenAnimatedLayer().then(function(animatedLayer) {
      map.add(animatedLayer);
    });
  });

  ocean.add({
    geometry: {
      type: "polygon",
      spatialReference,
      rings: [
        [[xmin, ymin], [xmax, ymin], [xmax, ymax], [xmin, ymax], [xmin, ymin]]
      ]
    },
    symbol: {
      type: "polygon-3d",
      symbolLayers: [
        {
          type: "water",
          waveDirection: 180,
          color: "#a1dfed",
          //color: "#7ba5ea",
          // color: "#2a569f",
          // color: "#3374AF",
          waveStrength: "moderate",
          waterbodySize: "large"
        }
      ]
    }
  });

  var cam1 = new Camera({"position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":2834227.263116874,"y":4407959.1320211515,"z":10259.69266181998},"heading":71.47186925713666,"tilt":68.4540696168012});
  var cam2 = new Camera({"position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":2909267.7261782526,"y":4399088.846807993,"z":16805.999082318507},"heading":298.35003357447044,"tilt":63.85292898850031});
  var cam3 = new Camera({"position":{"spatialReference":{"latestWkid":3857,"wkid":102100},"x":2883697.5705055334,"y":4403069.620041345,"z":6904.628980355337},"heading":351.5768300688249,"tilt":55.967438524588125});

  view.when().then(function() {

    view.camera = cam2;


    var slide = 0;
    var cam0 = view.camera.clone();

    var animeProperties = {
      autoplay: false,
      duration: 1000,
      seek: 1,
      // easing: "easeInOutSine",
      easing: "easeInOutQuad",
      update: function() {
        var target = this.animatables[0].target;
        var objectId = target.objectId;
        animatedRoute.seek(target.seek, objectId);
      },
      complete: function() {
        var target = this.animatables[0].target;
        // if (target.filter) {
        //   pointsOfInterest.definitionExpression = target.filter;
        // }
      }
    };

    var antikeriAnimation = anime({
      ...animeProperties,
      duration: 2250,
      targets: {
        seek: 0,
        objectId: 4,
      },
    });

    var katapolaAnimation = anime({
      ...animeProperties,
      duration: 2250,
      targets: {
        seek: 0,
        objectId: 5,
      },
    });

    var monasteryAnimation = anime({
      ...animeProperties,
      targets: {
        seek: 0,
        objectId: 6,
        filter: "OBJECTID NOT IN (7, 9, 10)"
      },
    });

    var kambiBeachAnimation = anime({
      ...animeProperties,
      delay: 750,
      targets: {
        seek: 0,
        objectId: 7,
        filter: "OBJECTID NOT IN (9, 10)"
      },
    });

    var steps = [
      function() {
        view.goTo(cam0);
      },
      function() {
        view.goTo(cam1);
      },
      function() {
        antikeriAnimation.pause();
        antikeriAnimation.seek(0);
        katapolaAnimation.pause();
        katapolaAnimation.seek(0);
        view.goTo(cam2)
          .then(function() {
            antikeriAnimation.play();
            return antikeriAnimation.finished;
          })
          .then(function() {
            katapolaAnimation.play()
          });

      },
      function() {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (7, 8, 9, 10)";
        monasteryAnimation.seek(0);
        monasteryAnimation.pause();
        kambiBeachAnimation.seek(0);
        kambiBeachAnimation.pause();
        view.goTo(cam3)
          .then(function() {
            monasteryAnimation.play();
            return monasteryAnimation.finished;
          })
          .then(function() {
            kambiBeachAnimation.play();
          });
      },
      function() {
        monasteryAnimation.seek(monasteryAnimation.duration);
        monasteryAnimation.pause();
        kambiBeachAnimation.seek(kambiBeachAnimation.duration);
        kambiBeachAnimation.pause();
      },
    ];

    [1, 2, 3, 4].reduce(function(acc, value) {
      return acc.then(function() {
        return animatedRoute.seek(1, value);
      });
    }, view.when());

    view.on("key-down", function(event) {

      var previousSlide = slide;

      if (event.key === "ArrowRight") {
        event.stopPropagation();
        slide = Math.min(slide + 1, steps.length - 1);
      } else if (event.key === "ArrowLeft") {
        event.stopPropagation();
        slide = Math.max(slide - 1, 0);
      }

      if (slide !== previousSlide) {
        steps[slide]();
      }

    });

    function onFadeIn(progress) {
      viewDiv.style.opacity = progress;
    }

    function onFadeOut(progress) {
      viewDiv.style.opacity = 1 - progress;
    }

    function onSail(progress) {
      if (progress < 1) {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (6, 7, 8, 9, 10)";
      } else {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (7, 8, 9, 10)";
      }
      katapolaAnimation.seek(progress * katapolaAnimation.duration);
    }

    function onCamera(progress) {
      var camera = interpolate(cam2, cam3, progress);
      view.goTo(camera, {animate: false});
    }

    function onMonastery(progress) {
      if (progress < 1) {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (7, 8, 9, 10)";
      } else {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (7, 9, 10)";
      }
      monasteryAnimation.seek(progress * monasteryAnimation.duration)
    }

    function onKambiBeach(progress) {
      if (progress < 1) {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (7, 9, 10)";
      } else {
        pointsOfInterest.definitionExpression = "OBJECTID NOT IN (9, 10)";
      }
      kambiBeachAnimation.seek(progress * kambiBeachAnimation.duration);
    }

    var scrollListeners = [{
      element: fadeInSection,
      onscroll: onFadeIn,
    }, {
      element: sailSection,
      onscroll: onSail,
    }, {
      element: fadeOutSection,
      onscroll: onFadeOut,
    }, {
      element: fadeIn2Section,
      onscroll: onFadeIn,
    }, {
      element: cameraSection,
      onscroll: onCamera,
    }, {
      element: monasterySection,
      onscroll: onMonastery,
    }, {
      element: kambiBeachSection,
      onscroll: onKambiBeach,
    }];

    function getScrollProgress(element) {
      var elemRect = element.getBoundingClientRect();
      // return window.pageYOffset || document.documentElement.scrollTop;
      var top = elemRect.top + scrollTopOffset;
      var windowHeight = (window.innerHeight || document.documentElement.clientHeight)
      var progress = Math.min(Math.max(windowHeight - top, 0), elemRect.height);
      return progress / elemRect.height;
    }


    function render() {
      scrollListeners.forEach(function(listener) {
        var progress = getScrollProgress(listener.element);
        if (progress != (listener.lastProgress || 0)) {
          listener.lastProgress = progress;
          listener.onscroll(progress);
        }
      });
    }


    var apparentScrollTop = 0;
    var animating = false;

    function animationLoop() {
      var previousScrollTop = apparentScrollTop;
      var scrollTop = content.scrollTop;
      apparentScrollTop = Math.round(interpolate(apparentScrollTop, scrollTop, 0.2) * 100) / 100;
      console.log("Smooth scroll", scrollTop, apparentScrollTop);
      // Make sure animation loop does not run forever
      if (previousScrollTop === apparentScrollTop) {
        apparentScrollTop = scrollTop;
      }
      scrollTopOffset = Math.round(scrollTop - apparentScrollTop);
      animating = true;
      // udpate view
      render();
      if (scrollTopOffset) {
        requestAnimationFrame(animationLoop);
      } else {
        console.log("Pause animation");
        animating = false;
      }
    }

    content.onscroll = function (e) {
      if (!animating) {
        console.log("Start animation");
        animationLoop();
      }
    }


  });

});