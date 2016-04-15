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

//MycropsService service
appServices.factory('MycropsService', function ($q, $cordovaSQLite, $http, kcData, eficienciaData) {

    // Calculate ET0
    function getET0(latitud, altitud, tMin, tMax, radiacionSolar, hRelativaMin, hRelativaMax, viento, diaDelAnio) {
        var et0;

        var F4 = parseFloat(latitud);
        var B4 = parseInt(altitud);
        var B5 = parseFloat(tMin);
        var B7 = parseFloat(tMax);
        var B8 = parseFloat(radiacionSolar);
        var B9 = parseFloat(hRelativaMin);
        var B11 = parseFloat(hRelativaMax);
        var B12 = parseFloat(viento);
        //var C1 = parseInt(dia);
        //var E1 = parseInt(mes);
        var B38 = diaDelAnio;

        var B6 = (B7+B5)/2;
        var B10 = (B11+B9)/2;

        var B16 = 101.3*(Math.pow(((293-0.0065*B4)/293), 5.26));
        var B17 = 0.665*B16/1000;

        var B23 = 0.6108*Math.exp(17.27*B5/(B5+237.3));
        var B24 = 0.6108*Math.exp(17.27*B6/(B6+237.3));
        var B25 = 0.6108*Math.exp(17.27*B7/(B7+237.3));
        var B26 = (B23+B25)/2;

        var B30 = ((B23*B11/100)+(B25*B9/100))/2;

        var B34 = (4098*(0.6108*Math.exp(17.27*B6/(B6+237.3))))/Math.pow((B6+237.3), 2);

        /*var B38;
        if (E1>2) {
            B38 = Math.floor((275*E1/9-30+C1)-2)
        } else {
            B38 = Math.floor(275*E1/9-30+C1)
        }*/

        var B42 = Math.PI/180*F4;
        var B43 = 1+(0.033*Math.cos(2*Math.PI*B38/365));
        var B44 = 0.409*Math.sin(2*Math.PI*B38/365-1.39);
        var B45 = Math.acos(-Math.tan(B42)*Math.tan(B44));
        var B46 = 0.082;
        var B49 = 24*60/Math.PI*B46*B43*(B45*Math.sin(B42)*Math.sin(B44)+Math.cos(B42)*Math.cos(B44)*Math.sin(B45));

        var B53 = (0.75+2*B4/100000)*B49;

        var B57 = (1-0.23)*B8;

        var B61 = 4.903/1000000000;
        var B62 = B61*(((Math.pow(B7+273.16, 4)+Math.pow(B5+273.16, 4))/2)*(0.34-0.14*Math.sqrt(B30))*((1.35*B8/B53)-0.35));

        var B66 = B57-B62;

        et0 = (0.408*B34*(B66)+(B17*(900/(B6+273))*B12*(B26-B30)))/(B34+(B17*(1+0.34*B12)));

        // TEST console.log('ET0: ' + et0 + ' - with - latitud: ' + latitud + ' - altitud: ' + altitud + ' - tMin: ' + tMin + ' - tMax: ' + tMax + ' - radiacionSolar: ' + radiacionSolar + ' - hRelativaMin: ' + hRelativaMin + ' - hRelativaMax: ' + hRelativaMax + ' - viento: ' + viento + ' - dia: ' + dia + ' - mes: ' + mes);

        return et0;
    }

    function getKc(nombreCultivo, diasDesdeSiembra) {
        var value;
        angular.forEach(kcData, function(kcCrop, kcCropKey) {
            if (kcCrop.name == nombreCultivo) {
                var lastValue;
                angular.forEach(kcCrop.ranges, function(range, rangeKey) {
                    if (range.initDay >= diasDesdeSiembra && value == undefined) {
                        if (lastValue == undefined) {
                            value = range.value;
                        } else {
                            value = lastValue;
                        }
                    }

                    lastValue = range.value;
                });

                if (value == undefined) {
                    value = lastValue;
                }
            }
        });

        return value;
    }

    function getEficienciaRiego(nombreRiego) {
        var value;

        angular.forEach(eficienciaData, function(eficienciaValue, key) {
            if (eficienciaValue.name == nombreRiego) {
                value = eficienciaValue.value;
            }
        });

        return value;
    }

    function getEtc(et0, kc) {
        return (et0 * kc);
    }

    function getPrecipitacionEfectiva(precipitacionMedia, etc) {
        var pEfectiva;

        var A2 = precipitacionMedia;
        var D2 = etc;

        pEfectiva = 1.033*(1.252474*Math.pow(A2, 0.82416)-2.9335224)*Math.pow(10, 0.000955*D2);

        return pEfectiva;
    }

    function getNecesidadHidrica(latitud, altitud, tMin, tMax, radiacionSolar, hRelativaMin, hRelativaMax, viento, diaDelAnio, nombreCultivo, diasDesdeSiembra, precipitacionMedia, nombreRiego) {
        var necesidadHidrica;

        var et0 = getET0(latitud, altitud, tMin, tMax, radiacionSolar, hRelativaMin, hRelativaMax, viento, diaDelAnio);
        var kc = getKc(nombreCultivo, diasDesdeSiembra);
        var etc = getEtc(et0, kc);
        var precipitacionEfectiva = getPrecipitacionEfectiva(precipitacionMedia, etc);
        var eficienciaRiego = getEficienciaRiego(nombreRiego);

        var A2 = et0;
        var B2 = kc;
        var C2 = precipitacionEfectiva;
        var D2 = eficienciaRiego;

        necesidadHidrica = (A2*B2-C2)/D2;

        return necesidadHidrica;
    }

    // Get all the irrigate suggestion
    function getNecesidadesHidricas(nombreCultivo, nombreRiego, anioSiembra, diaSiembra, latitud, altitud, data) {
        var necesidadesHidricas = [];

        for (var i = 0; i < data.length; i++) {
            var day = data[i];

            var tMin = day.TEMPMIN;
            var tMax = day.TEMPMAX;
            var radiacionSolar = day.RADIACION;
            var hRelativaMin = day.HUMEDADMIN;
            var hRelativaMax = day.HUMEDADMAX;
            var viento = day.VELVIENTO;
            var diaDelAnio = day.DIA;
            var precipitacionMedia = day.PRECIPITACION;

            // Calculate diasDesdeSiembra
            var diasDesdeSiembra = 0;
            var anioActual = day.AÑO;
            var diaActual = day.DIA;
            if (anioActual - anioSiembra == 0) {
                // Mismo año
                var diasDiferencia = diaActual - diaSiembra;
                if (diasDiferencia >= 0) {
                    diasDesdeSiembra = diasDiferencia;
                } else {
                    // Error: día actual antes de la siembra?????
                }
            } else if (anioActual - anioSiembra == 1) {
                // Cambio de año
                var totalDiasAnioSiembra = 365;
                if ((anioSiembra % 4 == 0) && ((anioSiembra % 100 != 0) || (anioSiembra % 400 == 0))) {
                    // Es bisiesto
                    totalDiasAnioSiembra = 366;
                }
                diasDesdeSiembra = (totalDiasAnioSiembra - diaSiembra) + diaActual;
            } else {
                // Error: más de un año?????
            }

            var necesidadHidrica = getNecesidadHidrica(latitud, altitud, tMin, tMax, radiacionSolar, hRelativaMin, hRelativaMax, viento, diaDelAnio, nombreCultivo, diasDesdeSiembra, precipitacionMedia, nombreRiego);

            necesidadesHidricas.push(necesidadHidrica);
        }

        return necesidadesHidricas;
    }

    function getIrrigationSuggest(nombreCultivo, nombreRiego, anioSiembra, diaSiembra, latitud, altitud, data) {
        var necesidadesHidricas = getNecesidadesHidricas(nombreCultivo, nombreRiego, anioSiembra, diaSiembra, latitud, altitud, data);

        var necesidadTotal = 0;
        angular.forEach(necesidadesHidricas, function(value, key) {
            necesidadTotal += value;
        });
        return necesidadTotal;
    }

    // Get station data from api
    function getStationData(cropData, startDate, endDate) {
        return $q(function(resolve, reject) {
            var url = window.globalVariable.baseProxyUrl;

            url += 'diario';

            $http({
                url: url,
                method: 'GET',
                params: {
                    provincia: cropData.codProv,
                    estacion: cropData.codStation,
                    fecha_ini: startDate,
                    fecha_fin: endDate,
                    fecha_ult_modif: startDate
                }
            }).then(function(data) {
                var nombreCultivo = cropData.cropType;
                var nombreRiego = cropData.irrigationSystem;
                var anioSiembra = cropData.date.getFullYear();
                // Calculate day from 1 January
                var firstDayOfYear = new Date(anioSiembra, 0, 0);
                var diff = cropData.date - firstDayOfYear;
                var oneDay = 1000 * 60 * 60 * 24;
                var diaSiembra = Math.floor(diff / oneDay);

                var irrigationSuggest = getIrrigationSuggest(nombreCultivo, nombreRiego, anioSiembra, diaSiembra, cropData.lat, cropData.altitud, data.data);
                irrigationSuggest = Math.round(irrigationSuggest);
                cropData.irrigationSuggest =irrigationSuggest;
                resolve(data.data);
            }, function(err) {
                console.error(err);
                reject(err);
            });
        });
    }// End get station data

    // Fill the irrigation suggest for all crops
    function fillIrrigationSuggest(cropsList) {
        // Fill ET0 data
        var startDate = new Date();
        startDate.setDate(startDate.getDate() - 7); // TODO: SET NUMBER 7 BY THE LAST IRRIGATION DATE
        startDate = startDate.ddmmyyyy();

        var endDate = new Date();
        endDate = endDate.ddmmyyyy();

        for (var i = 0; i < cropsList.length; i++) {
            getStationData(cropsList[i], startDate, endDate);
        }
    }

    return {

        // Select all data from sqlite
        getCrops: function(id) {
            return $q(function(resolve, reject) {
                var cropsList = [];

                var queryValues = [false];
                var queryId = '';
                if (angular.isDefined(id)) {
                    queryValues.push(id);
                    queryId = ' AND c.idCrop = ?'
                }

                // Variable for prepare query statement to select all crops
                var query = "SELECT c.idCrop, l.land, l.lat, l.lon, l.altitud, l.codProv, l.provCode, l.muniCode, l.codStation, ct.cropType, ct.cropTypeImg, irs.irrigationSystem, irs.irrigationSystemImg, c.date, c.harvesting" +
                            " FROM crops AS c" +
                            " INNER JOIN lands AS l ON c.idLand=l.idLand" +
                            " INNER JOIN cropTypes AS ct ON c.idCropType=ct.idCropType" +
                            " INNER JOIN irrigationSystems AS irs ON c.idIrrigationSystem=irs.idIrrigationSystem" +
                            " WHERE harvesting = ?" + queryId;

                // Execute query statement from query variable
                $cordovaSQLite.execute(db, query, queryValues).then(function (res) {
                    if (res.rows.length > 0) {
                        for (var i = 0; i < res.rows.length; i++) {
                            var provCode = String(res.rows.item(i).provCode);
                            var muniCode = String(res.rows.item(i).muniCode);
                            var zeros = '';
                            var j, numberZeros = 5 - (provCode.length + muniCode.length);
                            for(j = 0; j < numberZeros; j++) zeros += '0';
                            var codIne = provCode + zeros + muniCode;

                            var dataItem = {
                                idCrop : res.rows.item(i).idCrop,
                                land : res.rows.item(i).land,
                                lat : res.rows.item(i).lat,
                                lon : res.rows.item(i).lon,
                                altitud : res.rows.item(i).altitud,
                                codProv : res.rows.item(i).codProv,
                                provCode : provCode,
                                muniCode : muniCode,
                                codIne : codIne,
                                codStation : res.rows.item(i).codStation,
                                cropType : res.rows.item(i).cropType,
                                cropTypeImg : res.rows.item(i).cropTypeImg,
                                irrigationSystem : res.rows.item(i).irrigationSystem,
                                irrigationSystemImg : res.rows.item(i).irrigationSystemImg,
                                date : new Date(res.rows.item(i).date),
                                harvesting : (res.rows.item(i).harvesting == "true")
                            };
                            cropsList.push(dataItem);
                        }
                    }

                    fillIrrigationSuggest(cropsList);

                    resolve(cropsList);
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End select all data.

    };
}); //End MycropsService
