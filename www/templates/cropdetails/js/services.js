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

//CropdetailsService service
appServices.factory('CropdetailsService', function ($q, $http, $cordovaSQLite, MycropsService) {

    var weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    // Get forecast data from aemet
    function getForecastData(cropDetails) {
        return $q(function(resolve, reject) {
            var url = window.globalVariable.baseProxyUrl;

            url += 'localidad_' + cropDetails.codIne + '.xml';

            $http({
                url: url,
                method: 'GET'
            }).then(function(data) {
                var forecast = parseForecastData(data.data);
                var forecastJson = [];

                console.log(cropDetails);

                getForecastValuesData(cropDetails.provCode, cropDetails.muniCode).then(function(forecastValues) {
                    var now = new Date();
                    var weekDayNumber = now.getDay(); // 0: Domingo - 1: Lunes...
                    var i;
                    for (i = 0; i < forecast.length; i++) {
                        var weekDay = '';
                        if (i==0) {
                            weekDay = 'Hoy';
                        } else if (i==1) {
                            weekDay = 'Mañana';
                        } else {
                            weekDay = weekDays[(weekDayNumber+i)%weekDays.length];
                        }

                        var json = {
                            number: forecast[i],
                            value: forecastValues[i],
                            weekDay: weekDay
                        }
                        forecastJson.push(json);
                    }

                    cropDetails.forecast = forecastJson;

                    // Calculate forecast 48h
                    cropDetails.forecast48h = forecastJson[0].value + forecastJson[1].value;
                    if (!cropDetails.forecast48h) cropDetails.forecast48h = '?';

                    resolve(cropDetails);
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            }, function(err) {
                console.error(err);
                reject(err);
            });
        });
    }// End get forecast data

    function parseForecastData(data) {
        var forecastList = [];

        var days = data.split('<dia');
        var i, j;
        for (i = 1; i < days.length; i++) {
            var day = days[i];
            var probs = day.split('<estado_cielo');

            for (j = 1; j < probs.length; j++) {
                var prob = probs[j];
                prob = prob.split('</estado_cielo>')[0];

                prob = prob.substr(prob.lastIndexOf('>')+1);

                if (prob.length > 0) {
                    forecastList.push(prob);
                    break;
                }
            }
        }

        return forecastList;
    }

    // Get forecast data from inforiego
    function getForecastValuesData(provCode, muniCode) {
        return $q(function(resolve, reject) {
            var url = window.globalVariable.baseProxyUrl;

            url += 'opencms/opencms/prediccion/Proc_MuestraDatos.jsp';

            $http({
                url: url,
                method: 'GET',
                params: {
                    provincia: provCode,
                    poblacion: muniCode
                }
            }).then(function(data) {
                resolve(parseForecastValuesData(data.data));
            }, function(err) {
                console.error(err);
                reject(err);
            });
        });
    }// End get forecast data

    function parseForecastValuesData(data) {
        var forecastValuesList = [];

        var lines = data.split('</TR>');
        var days = lines[1].split('</TD>');

        angular.forEach(days, function(day, key) {
            if (day.length > 0) {
                var mm = parseInt(day.substr(day.lastIndexOf('>')+1));
                if (!isNaN(mm)) {
                    forecastValuesList.push(mm);
                }
            }
        });

        return forecastValuesList; // L/m2
    }

    return {

        // Select crop data from sqlite
        getCropDetails: function(idCrop) {
            return $q(function(resolve, reject) {
                var cropDetails = {};

                MycropsService.getCrops(idCrop).then(function(data) {
                    var cropDetails = data[0];

                    getForecastData(cropDetails).then(function(cropDetailsUpdated) {
                        resolve(cropDetailsUpdated);
                    }, function(err) {
                        console.error(err);

                        resolve(cropDetails);
                    });
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End select crop data.

        // Set crop data from sqlite
        setHarvesting: function(idCrop) {
            return $q(function(resolve, reject) {
                // Variable for prepare query statement to update crop
                var query = "UPDATE crops SET harvesting = ? WHERE idCrop = ?";

                // Execute query statement from query variable
                $cordovaSQLite.execute(db, query, [true, idCrop]).then(function (res) {
                    console.log(res);

                    resolve();
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End select crop data.

    };
}); //End CropdetailsService service.