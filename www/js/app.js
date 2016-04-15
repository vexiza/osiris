//
//Welcome to app.js
//This is main application config of project. You can change a setting of :
//  - Global Variable
//  - Theme setting
//  - Icon setting
//  - Register View
//  - Spinner setting
//  - Custom style
//
//Global variable use for setting color, start page, message, oAuth key.
var db = null; //Use for SQLite database.
window.globalVariable = {
    //custom color style variable
    color: {
        appPrimaryColor: ""
    },// End custom color style variable
    startPage: {
        url: "/app/mycrops",//Url of start page.
        state: "app.mycrops"//State name of start page.
    },
    message: {
        errorMessage: "Technical error please try again later." //Default error message.
    },
    baseProxyUrl: 'http://37.187.20.84:5550/',
    geonamesUrl: 'http://api.geonames.org/findNearbyPostalCodesJSON?username=dmananes&',
    codInePostalUrl: 'app-data/codine_codpostal.json'
};// End Global variable

Date.prototype.ddmmyyyy = function() {
    var dd  = this.getDate().toString();
    var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
    var yyyy = this.getFullYear().toString();
    return (dd[1]?dd:'0'+dd[0]) + '/' + (mm[1]?mm:'0'+mm[0]) + '/' + yyyy; // padding
};


angular.module('starter', ['ionic','ngIOS9UIWebViewPatch', 'starter.controllers', 'starter.services', 'ngMaterial', 'ngMessages', 'leaflet-directive', 'ngCordova'])
    .run(function ($ionicPlatform, $cordovaSQLite, $rootScope, $ionicHistory, $state, $mdDialog, $mdBottomSheet) {

        function initialSQLite() {
            db = window.cordova ? $cordovaSQLite.openDB("osiris.db") : window.openDatabase("osiris.db", "1.0", "OsirisDB", -1);

            /*$cordovaSQLite.execute(db, "DROP TABLE IF EXISTS appvalues");
            $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS lands");
            $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS cropTypes");
            $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS irrigationSystems");
            $cordovaSQLite.execute(db, "DROP TABLE IF EXISTS crops");*/

            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS lands " +
                "( idLand integer primary key, " +
                "  land text, " +
                "  lat real, " +
                "  lon real, " +
                "  altitud integer, " +
                "  codProv integer, " +
                "  codStation integer, " +
                "  provCode integer, " +
                "  muniCode integer, " +
                "  postCode integer)");

            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS cropTypes " +
                "( idCropType integer primary key, " +
                "  cropType text, " +
                "  cropTypeImg text)");

            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS irrigationSystems " +
                "( idIrrigationSystem integer primary key, " +
                "  irrigationSystem text, " +
                "  irrigationSystemImg text)");

            $cordovaSQLite.execute(db, "CREATE TABLE IF NOT EXISTS crops " +
                "( idCrop integer primary key, " +
                "  idLand integer, " +
                "  idCropType integer, " +
                "  idIrrigationSystem integer, " +
                "  date dateTime, " +
                "  harvesting Boolean)");

            initialSQLiteValues();
        };
        // End creating SQLite database table.

        function initialSQLiteValues() {
            var query = "INSERT INTO cropTypes (idCropType, cropType, cropTypeImg) VALUES (?, ?, ?)";
            $cordovaSQLite.execute(db, query, [1, 'Adormidera', '01.jpg']);
            $cordovaSQLite.execute(db, query, [2, 'Ajo de invierno', '02.jpg']);
            $cordovaSQLite.execute(db, query, [3, 'Ajo de primavera', '03.jpg']);
            $cordovaSQLite.execute(db, query, [4, 'Alfalfa (cortes)', '04.jpg']);
            $cordovaSQLite.execute(db, query, [5, 'Alfalfa (implantación)', '05.jpg']);
            $cordovaSQLite.execute(db, query, [6, 'Almendro', '06.jpg']);
            $cordovaSQLite.execute(db, query, [7, 'Avena', '07.jpg']);
            $cordovaSQLite.execute(db, query, [8, 'Cebada de invierno', '08.jpg']);
            $cordovaSQLite.execute(db, query, [9, 'Cebada de primavera', '09.jpg']);
            $cordovaSQLite.execute(db, query, [10, 'Cebolla', '10.jpg']);
            $cordovaSQLite.execute(db, query, [11, 'Cereal forrajero invierno', '11.jpg']);
            $cordovaSQLite.execute(db, query, [12, 'Cereal forrajero primavera', '12.jpg']);
            $cordovaSQLite.execute(db, query, [13, 'Colza de invierno', '13.jpg']);
            $cordovaSQLite.execute(db, query, [14, 'Endivia', '14.jpg']);
            $cordovaSQLite.execute(db, query, [15, 'Esparceta', '15.jpg']);
            $cordovaSQLite.execute(db, query, [16, 'Espinacas', '16.jpg']);
            $cordovaSQLite.execute(db, query, [17, 'Fresa', '17.jpg']);
            $cordovaSQLite.execute(db, query, [18, 'Girasol', '18.jpg']);
            $cordovaSQLite.execute(db, query, [19, 'Guisante seco de otoño', '19.jpg']);
            $cordovaSQLite.execute(db, query, [20, 'Guisante seco de primavera', '20.jpg']);
            $cordovaSQLite.execute(db, query, [21, 'Guisante verde de primavera', '21.jpg']);
            $cordovaSQLite.execute(db, query, [22, 'Hortícolas', '22.jpg']);
            $cordovaSQLite.execute(db, query, [23, 'Judía grano', '23.jpg']);
            $cordovaSQLite.execute(db, query, [24, 'Leguminosas', '24.jpg']);
            $cordovaSQLite.execute(db, query, [25, 'Lúpulo', '25.jpg']);
            $cordovaSQLite.execute(db, query, [26, 'Maíz dulce', '26.jpg']);
            $cordovaSQLite.execute(db, query, [27, 'Manzano', '27.jpg']);
            $cordovaSQLite.execute(db, query, [28, 'Maíz forrajero', '28.jpg']);
            $cordovaSQLite.execute(db, query, [29, 'Maíz grano', '29.jpg']);
            $cordovaSQLite.execute(db, query, [30, 'Nogal', '30.jpg']);
            $cordovaSQLite.execute(db, query, [31, 'Patata media estación', '31.jpg']);
            $cordovaSQLite.execute(db, query, [32, 'Patata tardía', '32.jpg']);
            $cordovaSQLite.execute(db, query, [33, 'Pimiento', '33.jpg']);
            $cordovaSQLite.execute(db, query, [34, 'Pradera (Rye grass)', '34.jpg']);
            $cordovaSQLite.execute(db, query, [35, 'Puerros', '35.jpg']);
            $cordovaSQLite.execute(db, query, [36, 'Remolacha azucarera siembra abril', '36.jpg']);
            $cordovaSQLite.execute(db, query, [37, 'Remolacha azucarera siembra marzo', '37.jpg']);
            $cordovaSQLite.execute(db, query, [38, 'Remolacha de mesa', '38.jpg']);
            $cordovaSQLite.execute(db, query, [39, 'Remolacha forrajera', '39.jpg']);
            $cordovaSQLite.execute(db, query, [40, 'Sorgo dulce', '40.jpg']);
            $cordovaSQLite.execute(db, query, [41, 'Sorgo grano', '41.jpg']);
            $cordovaSQLite.execute(db, query, [42, 'Tabaco', '42.jpg']);
            $cordovaSQLite.execute(db, query, [43, 'Teff', '43.jpg']);
            $cordovaSQLite.execute(db, query, [44, 'Trigo de invierno', '44.jpg']);
            $cordovaSQLite.execute(db, query, [45, 'Trigo de primavera', '45.jpg']);
            $cordovaSQLite.execute(db, query, [46, 'Veza forrajera', '46.jpg']);
            $cordovaSQLite.execute(db, query, [47, 'Veza grano', '47.jpg']);
            $cordovaSQLite.execute(db, query, [48, 'Zahanoria media', '48.jpg']);

            query = "INSERT INTO irrigationSystems (idIrrigationSystem, irrigationSystem, irrigationSystemImg) VALUES (?, ?, ?)";
            $cordovaSQLite.execute(db, query, [1, 'Aspersión', '01.png']);
            $cordovaSQLite.execute(db, query, [2, 'Cañón', '02.png']);
            $cordovaSQLite.execute(db, query, [3, 'Goteo', '03.png']);
            $cordovaSQLite.execute(db, query, [4, 'Gravedad', '04.png']);
            $cordovaSQLite.execute(db, query, [5, 'Pivote-lateral', '05.png']);
            $cordovaSQLite.execute(db, query, [6, 'Gravedad tecnificada', '06.png']);
        };

        // Create custom defaultStyle.
        function getDefaultStyle() {
            return "" +
                ".material-background-nav-bar { " +
                "   background-color        : " + appPrimaryColor + " !important; " +
                "   border-style            : none;" +
                "}" +
                ".md-primary-color {" +
                "   color                     : " + appPrimaryColor + " !important;" +
                "}";
        }// End create custom defaultStyle


        function initialRootScope() {
            $rootScope.appPrimaryColor = appPrimaryColor;// Add value of appPrimaryColor to rootScope for use it to base color.
            $rootScope.isAndroid = ionic.Platform.isAndroid();// Check platform of running device is android or not.
            $rootScope.isIOS = ionic.Platform.isIOS();// Check platform of running device is ios or not.
        };

        function hideActionControl() {
            //For android if user tap hardware back button, Action and Dialog should be hide.
            $mdBottomSheet.cancel();
            $mdDialog.cancel();
        };


        // createCustomStyle will change a style of view while view changing.
        // Parameter :
        // stateName = name of state that going to change for add style of that page.
        function createCustomStyle(stateName) {
            var customStyle =
                ".material-background {" +
                "   background-color          : " + appPrimaryColor + " !important;" +
                "   border-style              : none;" +
                "}" +
                ".spinner-android {" +
                "   stroke                    : " + appPrimaryColor + " !important;" +
                "}";

            switch (stateName) {
                default:
                    customStyle += getDefaultStyle();
                    break;
            }
            return customStyle;
        }// End createCustomStyle

        // Add custom style while initial application.
        $rootScope.customStyle = createCustomStyle(window.globalVariable.startPage.state);

        $ionicPlatform.ready(function () {
            ionic.Platform.isFullScreen = true;
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }

            initialSQLite();
            initialRootScope();

            //Checking if view is changing it will go to this function.
            $rootScope.$on('$ionicView.beforeEnter', function () {
                //hide Action Control for android back button.
                hideActionControl();
                // Add custom style ti view.
                $rootScope.customStyle = createCustomStyle($ionicHistory.currentStateName());
            });
        });

    })

    .config(function ($ionicConfigProvider, $stateProvider, $urlRouterProvider, $mdThemingProvider, $mdIconProvider, $mdColorPalette, $mdIconProvider) {


        // Use for change ionic spinner to android pattern.
        $ionicConfigProvider.spinner.icon("android");
        $ionicConfigProvider.views.swipeBackEnabled(false);
        $ionicConfigProvider.backButton.previousTitleText(false).text("Volver").icon('ion-ios-arrow-back');

        // mdIconProvider is function of Angular Material.
        // It use for reference .SVG file and improve performance loading.
        $mdIconProvider
            .icon('tap', 'img/icons/tap_icon.svg')
            .icon('rain', 'img/icons/rain.svg')
            .icon('harvest', 'img/icons/harvest.svg')
            .icon('more', 'img/icons/more_vert.svg');

        //mdThemingProvider use for change theme color of Ionic Material Design Application.
        /* You can select color from Material Color List configuration :
         * red
         * pink
         * purple
         * purple
         * deep-purple
         * indigo
         * blue
         * light-blue
         * cyan
         * teal
         * green
         * light-green
         * lime
         * yellow
         * amber
         * orange
         * deep-orange
         * brown
         * grey
         * blue-grey
         */
        //Learn more about material color patten: https://www.materialpalette.com/
        //Learn more about material theme: https://material.angularjs.org/latest/#/Theming/01_introduction
        /*$mdThemingProvider
            .theme('default')
            .primaryPalette('teal')
            .accentPalette('deep-orange');*/
        var vexizaPalette = {
          '50': '#ffffff',
          '100': '#ffffff',
          '200': '#fcfdfe',
          '300': '#c9dfe9',
          '400': '#b3d3e1',
          '500': '#9dc6d8',
          '600': '#87b9cf',
          '700': '#71adc7',
          '800': '#5ba0be',
          '900': '#4792b3',
          'A100': '#ffffff',
          'A200': '#ffffff',
          'A400': '#b3d3e1',
          'A700': '#71adc7',
          'contrastDefaultColor': 'light',
          'contrastDarkColors': '50 100 200 300 400 500 600 700 800 A100 A200 A400 A700'
        };
        var vexizaPalette_05 = {
          '50': '#a8e8ff',
          '100': '#5cd5ff',
          '200': '#24c6ff',
          '300': '#00a2db',
          '400': '#008cbd',
          '500': '#00759e',
          '600': '#005e7f',
          '700': '#004861',
          '800': '#003142',
          '900': '#001a24',
          'A100': '#a8e8ff',
          'A200': '#5cd5ff',
          'A400': '#008cbd',
          'A700': '#004861',
          'contrastDefaultColor': 'light',
          'contrastDarkColors': '50 100 200 A100 A200'
        };
        $mdThemingProvider.definePalette('Vexiza', vexizaPalette_05);

        $mdThemingProvider.theme('default').primaryPalette('Vexiza');
        $mdThemingProvider.theme('default').accentPalette('deep-orange');

        appPrimaryColor = vexizaPalette_05['500']; //Use for get base color of theme.

        //$stateProvider is using for add or edit HTML view to navigation bar.
        //
        //Schema :
        //state_name(String)      : Name of state to use in application.
        //page_name(String)       : Name of page to present at localhost url.
        //cache(Bool)             : Cache of view and controller default is true. Change to false if you want page reload when application navigate back to this view.
        //html_file_path(String)  : Path of html file.
        //controller_name(String) : Name of Controller.
        //
        //Learn more about ionNavView at http://ionicframework.com/docs/api/directive/ionNavView/
        //Learn more about  AngularUI Router's at https://github.com/angular-ui/ui-router/wiki
        $stateProvider
            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu/html/menu.html",
                controller: 'menuCtrl'
            })
            .state('app.tutorial', {
                url: "/tutorial",
                cache: false,
                views: {
                    'menuContent': {
                        templateUrl: "templates/tutorial/html/tutorial.html",
                        controller: 'tutorialCtrl'
                    }
                }
            })
            .state('app.mycrops', {
                url: "/mycrops",
                views: {
                    'menuContent': {
                        templateUrl: "templates/mycrops/html/mycrops.html",
                        controller: 'mycropsCtrl'
                    }
                }
            })
            .state('app.cropdetails', {
                url: "/cropdetails/:id",
                views: {
                    'menuContent': {
                        templateUrl: "templates/cropdetails/html/cropdetails.html",
                        controller: 'cropdetailsCtrl'
                    }
                }
            })
            .state('app.addland', {
                url: "/addland",
                views: {
                    'menuContent': {
                        templateUrl: "templates/addland/html/addland.html",
                        controller: 'addlandCtrl'
                    }
                }
            })

            ;// End $stateProvider

        //Use $urlRouterProvider.otherwise(Url);
        $urlRouterProvider.otherwise(window.globalVariable.startPage.url);

    });
