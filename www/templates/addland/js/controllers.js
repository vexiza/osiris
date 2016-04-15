// Controller will call DBService Services to present data to html view.
//
// For using sqlite you have to install $cordovaSQLite by running the following
// command in your cmd.exe for windows or terminal for mac:
// $ cd your_project_path
// $ ionic plugin remove io.litehelpers.cordova.sqlite
// $ ionic plugin add https://github.com/litehelpers/Cordova-sqlite-storage.git
//
// For install $cordovaSQLite plugin you also have to install this following plugin to get $cordovaSQLite work :
// $ ionic plugin add com.ionic.keyboard
//
// Learn more about $cordovaSQLite :
// http://ngcordova.com/docs/plugins/sqlite/
//
// Controller of addland
appControllers.controller('addlandCtrl', function ($scope, $q, $mdDialog, $state, $ionicHistory, AddlandService, leafletData, AddcropService, $cordovaDatePicker) {

    var stations;

    // Go to mycrops and not store on history
    function goToMyCrops() {
        $ionicHistory.goBack();
    }

    // initialForm is the first activity in the controller.
    // It will initial all variable data and let the function works when page load.
    $scope.initialForm = function () {

        $scope.inputData = {};

        loadStations();
        $scope.newCrop = {};
        $scope.cropTypes = [];
    	$scope.irrigationSystems = [];

        // Get cropTypes from database
    	AddcropService.getCropTypes().then(function(data) {
    		$scope.cropTypes = data;
    		if (data.length > 0) {
    			$scope.newCrop.idCropType = data[0].value;
    		}
    	});
        // Get irrigationSystems from database
    	AddcropService.getIrrigationSystems().then(function(data) {
    		$scope.irrigationSystems = data;
    		if (data.length > 0) {
    			$scope.newCrop.idIrrigationSystem = data[0].value;
    		}
    	});

        $scope.newCrop.date = new Date();
    };// End initialForm.

    // Once state loaded, get put map on scope
    $scope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {

    	if (angular.isUndefined($scope.map)) {
    		console.log('Initialize map...');

            $scope.map = {
                defaults: {
                    maxZoom: 18,
                    zoomControl: false
                },
                center: {
                    lat : 41.65,
    				lng : -4.72,
                    focus: false,
                    draggable: false,
                    zoom : 6
                },
                markers: {
                    here: {
                        lat : 41.65,
                        lng : -4.72,
                    }
                },
                layers: {
                    baselayers: {
                        def: {
                            id:'map1',
                            name: 'OpenStreetMap',
                            url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                            type: 'xyz',
                            layerOptions: {
                                attribution: '&copy; OpenStreetMap contributors'
                            }
                        },
                        sat: {
                            id:'map2',
                            name: 'Satellite',
                            url: 'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                            type: 'xyz',
                            layerOptions: {
                                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                            }
                        }
                    }
                }
            };
            leafletData.getMap('map').then(
                function (map) {
                    map.on('move', function(e) {
                        $scope.map.markers.here.lat = map.getCenter().lat;
                        $scope.map.markers.here.lng = map.getCenter().lng;
                    });
                }
            );
    	}

    });

    function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
        var R = 6371000; // Radius of the earth in m
        var dLat = deg2rad(lat2-lat1);  // deg2rad below
        var dLon = deg2rad(lon2-lon1);
        var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        var d = R * c; // Distance in m
        return d;
    }

    function deg2rad(deg) {
        return deg * (Math.PI/180)
    }

    function loadStations() {
        stations = [];
        AddlandService.getStations().then(function(data) {
            stations = data;
        });
    }

    function getNearestStation(lat, lon) {
        return $q(function(resolve, reject) {
            if (angular.isDefined(stations) || stations.length == 0) {
                var minDistance = Number.MAX_SAFE_INTEGER;
                var nearestStation;
                angular.forEach(stations, function(station, key) {
                    var latStation = station.LATITUD;
                    var lonStation = station.LONGITUD;

                    if (angular.isDefined(latStation) && latStation != null && angular.isDefined(lonStation) && lonStation != null) {
                        // TODO Is this conversion correct????
                        latStation = parseFloat(latStation.substring(0, latStation.length-1))/10000000;
                        lonStation = -parseFloat(lonStation.substring(0, lonStation.length-1))/10000000;

                        var distance = getDistanceFromLatLonInM(lat, lon, latStation, lonStation);
                        console.log('distance in m to ' + station.ESTACIONCORTO, distance);
                        if (distance < minDistance) {
                            minDistance = distance;
                            nearestStation = station;
                        }
                    }
                });

                if (angular.isDefined(nearestStation)) {
                    nearestStation.distance = minDistance;
                }

                resolve(nearestStation);
            } else {
                reject('No se han podido descargar las estaciones');
            }
            resolve(stations[0]);
        });
    }

    function showErrorDialog($event, message) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Error",
                    content: message,
                    ok: "OK"
                }
            }
        });
    }

    function addLand () {
      return $q(function(resolve, reject) {
    		var lat = $scope.map.markers.here.lat;
    		var lon = $scope.map.markers.here.lng;

            getNearestStation(lat, lon).then(function(data) {
                if (data.distance < 100000) { // Distance to station less than 100km
                    var newLand = {
                        name: $scope.inputData.name,
                        lat: lat,
                        lon: lon,
                        altitud: data.ALTITUD,
                        codProv: data.IDPROVINCIA,
                        codStation: data.IDESTACION
                    };

                    AddlandService.addLand(newLand).then(function(id) {
                        console.log('land added');

                        resolve(id);
                    }, function(err) {
                        reject(err);
                    });
                } else {
                    reject('La distancia a la estación más cercana es demasiado alejada');
                }
            }, function (error) {
                reject(error);
            });
        });
    }

    $scope.showDatePicker = function() {
        var options = {
                    date: $scope.newCrop.date,
                    mode: 'date', // or 'time'
                    allowOldDates: true,
                    allowFutureDates: false,
                    doneButtonLabel: 'DONE',
                    doneButtonColor: '#F2F3F4',
                    cancelButtonLabel: 'CANCEL',
                    cancelButtonColor: '#000000'
                };
        $cordovaDatePicker.show(options).then(function(date) {
            $scope.newCrop.date = date;
        });
    }

    $scope.addCrop = function($event) {
    	if (angular.isUndefined($scope.inputData.name) || $scope.inputData.name.length == 0) {
            showErrorDialog($event, 'Por favor, inserte un nombre');
    	} else if (angular.isUndefined($scope.map) || angular.isUndefined($scope.map.markers.here)) {
            showErrorDialog($event, 'Por favor, seleccione una localización');
    	} else if (angular.isUndefined($scope.newCrop)) {
            showErrorDialog($event, 'Ha ocurrido un error añadiendo la siembra');
        } /*else if (angular.isUndefined($scope.newCrop.idLand)) {
            showErrorDialog($event, 'Seleccione una tierra');
        } */else if (angular.isUndefined($scope.newCrop.idCropType)) {
            showErrorDialog($event, 'Seleccione un tipo de sembrado correcto');
        } else if (angular.isUndefined($scope.newCrop.idIrrigationSystem)) {
            showErrorDialog($event, 'Seleccione un sistema de riego correcto');
        } else if (angular.isUndefined($scope.newCrop.date)) {
            showErrorDialog($event, 'Seleccione una fecha de siembra');
    	} else {
            addLand().then(function(id) {
                console.log('Tierra añadida correctamente con id: ' + id);
                $scope.newCrop.idLand = id;

                AddcropService.addCrop($scope.newCrop).then(function() {
          			console.log('crop added');

                    goToMyCrops();
          		}, function(err) {
                    console.error(err);
                });
            }, function(err) {
                showErrorDialog($event, err);
            });
        }
    }

    $scope.initialForm();

}); // End of addland controller
