// Controller will call TutorialService Services to present data to html view.
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
// Controller of tutorial
appControllers.controller('tutorialCtrl', function ($scope, $ionicHistory, $state, TutorialService) {

    // Go to mycrops and not store on history
    function goToMyCrops() {
        $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true
        });
        $state.go('app.mycrops');
    }

    $scope.$on('$ionicView.loaded', function() {

        // Check if tutorial already showed
        TutorialService.isTutorialShowed().then(function(data) {
            var tutorialShowed = data;

            if (tutorialShowed) {
                goToMyCrops();
            }
        });

    });

    // initialForm is the first activity in the controller. 
    // It will initial all variable data and let the function works when page load.
    $scope.initialForm = function () {

        // Check if tutorial already showed
        TutorialService.isTutorialShowed().then(function(data) {
            var tutorialShowed = data;

            if (tutorialShowed) {
                goToMyCrops();
            }
        });

    };// End initialForm.

    $scope.initialForm();

}); // End of mycrops controller.
