// The factory for connecting with SQLite database
//
// Advantage of SQLite have no limit ability to store data.
// It will create the sqlite file that store in the application.
// Also can store more complex data such as relation between tables.
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
// The database table of crops will be created in modules.run() method in www/js/app.js file
//
// Variable name db come from initialSQLite() in in www/js/app.js file because we need to initial it before we use.

//AddlandService service
appServices.factory('AddlandService', function ($q, $cordovaSQLite, $http) {

    function getPostCode(lat, lon) {
        return $q(function(resolve, reject) {
            var url = window.globalVariable.geonamesUrl;

            $http({
                url: url,
                method: 'GET',
                params: {
                    lat: lat,
                    lng: lon
                }
            }).then(function(data) {
                resolve(data.data.postalCodes[0].postalCode);
            }, function(err) {
                console.error(err);
                reject(err);
            });
        });
    }

    function getCodProvMuni(postCode) {
        return $q(function(resolve, reject) {
            var url = window.globalVariable.codInePostalUrl;

            $http.get(url).then(function(data) {
                var values = data.data;
                var total = values.length;
                var i, provCode, muniCode;
                for (i = 0; i < total; i++) {
                    var value = values[i];
                    if (value.CodigoPostal == postCode) {
                        provCode = value.CodProvincia;
                        muniCode = value.CodMunicipio;
                        break;
                    }
                }

                if (angular.isDefined(provCode) && angular.isDefined(muniCode)) {
                    resolve({
                        provCode: provCode,
                        muniCode: muniCode
                    });
                } else {
                    reject(postCode + ' not found');
                }
            }, function(err) {
                console.error(err);
                reject(err);
            });
        });
    }

    return {

        // Add land data to sqlite
        addLand: function(newLand) {
            return $q(function(resolve, reject) {
                // Variable for prepare query statement to insert land
                var query = "INSERT INTO lands" +
                            " (land, lat, lon, altitud, codProv, codStation, provCode, muniCode, postCode)" +
                            " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

                getPostCode(newLand.lat, newLand.lon).then(function(postalCode) {
                    newLand.postalCode = postalCode;

                    getCodProvMuni(postalCode).then(function(data) {
                        newLand.provCode = data.provCode;
                        newLand.muniCode = data.muniCode;

                        // Execute query statement from query variable
                        $cordovaSQLite.execute(db, query, [newLand.name, newLand.lat, newLand.lon, newLand.altitud, newLand.codProv, newLand.codStation, newLand.provCode, newLand.muniCode, newLand.postalCode]).then(function (res) {
                            console.log(res);
                            resolve(res.insertId);
                        }, function(err) {
                            console.error(err);
                            reject(err);
                        });
                    }, function(err) {
                        console.error(err);
                        reject(err);
                    });
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End add land data

        // Get stations data from api
        getStations: function() {
            return $q(function(resolve, reject) {
                var url = window.globalVariable.baseProxyUrl;

                url += 'estacion';

                $http.get(url).then(function(data) {
                    resolve(data.data);
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End get stations data

    };
}); //End AddlandService

//AddcropService service
appServices.factory('AddcropService', function ($q, $cordovaSQLite) {
    return {

        // Add crop data to sqlite
        addCrop: function(newCrop) {
            return $q(function(resolve, reject) {
                // Variable for prepare query statement to select all crops.
                var query = "INSERT INTO crops" +
                            " (idLand, idCropType, idIrrigationSystem, date, harvesting)" +
                            " VALUES (?, ?, ?, ?, ?)";

                // Execute query statement from query variable.
                $cordovaSQLite.execute(db, query, [newCrop.idLand, newCrop.idCropType, newCrop.idIrrigationSystem, newCrop.date, false]).then(function (res) {
                    resolve();
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End add crop data

        // Get cropTypes data from sqlite
        getCropTypes: function() {
            return $q(function(resolve, reject) {
                var cropTypesList = [];

                // Variable for prepare query statement to select all cropTypes
                var query = "SELECT ct.idCropType, ct.cropType" +
                            " FROM cropTypes AS ct";

                // Execute query statement from query variable
                $cordovaSQLite.execute(db, query).then(function (res) {
                    if (res.rows.length > 0) {
                        for (var i = 0; i < res.rows.length; i++) {
                            var dataItem = {
                                value : res.rows.item(i).idCropType,
                                label : res.rows.item(i).cropType
                            };
                            cropTypesList.push(dataItem);
                        }
                    }

                    resolve(cropTypesList);
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End get cropTypes data

        // Get irrigationSystems data from sqlite
        getIrrigationSystems: function() {
            return $q(function(resolve, reject) {
                var irrigationSystemsList = [];

                // Variable for prepare query statement to select all irrigationSystems
                var query = "SELECT irs.idIrrigationSystem, irs.irrigationSystem" +
                            " FROM irrigationSystems AS irs";

                // Execute query statement from query variable
                $cordovaSQLite.execute(db, query).then(function (res) {
                    if (res.rows.length > 0) {
                        for (var i = 0; i < res.rows.length; i++) {
                            var dataItem = {
                                value : res.rows.item(i).idIrrigationSystem,
                                label : res.rows.item(i).irrigationSystem
                            };
                            irrigationSystemsList.push(dataItem);
                        }
                    }

                    resolve(irrigationSystemsList);
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End get irrigationSystems data

    };
}); //End AddcropService
