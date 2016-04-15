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

//TutorialService service
appServices.factory('TutorialService', function ($q, $cordovaSQLite) {    
    return {

        // Check if tutorial already showed from sqlite
        isTutorialShowed: function() {
            return $q(function(resolve, reject) {
                var result = false;

                // Variable for prepare query statement to select all crops.
                var query = "SELECT value FROM appvalues WHERE key = ?";

                // Execute query statement from query variable.
                $cordovaSQLite.execute(db, query, ['tutorialShowed']).then(function (res) {
                    if (res.rows.length > 0) {
                        result = (res.rows.item(0).value == "true");
                    }

                    resolve(result);
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End select tutorial showed

        // Set tutorial already showed to sqlite
        setTutorialShowed: function(newValue) {
            return $q(function(resolve, reject) {
                // Variable for prepare query statement to select all crops.
                var query = "INSERT INTO appvalues (key, value) VALUES (?, ?)";

                // Execute query statement from query variable.
                $cordovaSQLite.execute(db, query, ['tutorialShowed', newValue]).then(function (res) {
                    console.log(res);

                    resolve();
                }, function(err) {
                    console.error(err);
                    reject(err);
                });
            });
        },// End select tutorial showed

    };
}); //End TutorialService