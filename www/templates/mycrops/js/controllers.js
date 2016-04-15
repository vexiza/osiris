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
// Controller of mycrops.
appControllers.controller('mycropsCtrl', function ($scope, $timeout, $state, $mdBottomSheet, MycropsService, $ionicModal) {

    // initialForm is the first activity in the controller.
    // It will initial all variable data and let the function works when page load.
    $scope.initialForm = function () {

        //$scope.isLoading is the variable that use for check statue of process.
        $scope.isLoading = true;

        // $scope.crops  is the variable that store data from service.
        $scope.allCrops = [];

        // The function for show loading progress.
        jQuery('#mycrops-content').hide();
        jQuery('#crop-list-loading-progress').show();

        //Get all crops
        $timeout(function () {
            MycropsService.getCrops().then(function(data) {
                $scope.allCrops = data;

                jQuery('#crop-list-loading-progress').hide();
                jQuery('#mycrops-content').fadeIn();
                $scope.isLoading = false;
            }, function(err) {
                jQuery('#crop-list-loading-progress').hide();
                jQuery('#mycrops-content').fadeIn();
                $scope.isLoading = false;

                // TODO ERROR!
                console.error(err);
            });
        }, 3000);// End loading progress.

    };// End initialForm.

    // Actions to be performed always that the view is loaded
    $scope.$on('$ionicView.beforeEnter', function() {
        //Get all crops
        MycropsService.getCrops().then(function(data) {
            $scope.allCrops = data;

            jQuery('#crop-list-loading-progress').hide();
            jQuery('#mycrops-content').fadeIn();
            $scope.isLoading = false;
        }, function(err) {
            console.error(err);
        });
    });

    // Function to show the addland view
    $scope.showAddland = function() {
        $state.go('app.addland');
    }

    // ABOUT TEMPLATE
    $ionicModal.fromTemplateUrl('templates/about/html/about.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.modalAbout = modal;
    });
    $scope.openModalAbout = function() {
        $scope.modalAbout.show();
    };
    $scope.closeModalAbout = function() {
        $scope.modalAbout.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.modalAbout.remove();
    });

    $scope.initialForm();

}); // End of mycrops controller.
