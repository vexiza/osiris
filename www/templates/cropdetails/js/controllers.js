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
// Controller of cropdetails.
appControllers.controller('cropdetailsCtrl', function ($scope, $stateParams, $mdDialog, $ionicHistory, CropdetailsService) {

    // initialForm is the first activity in the controller.
    // It will initial all variable data and let the function works when page load.
    $scope.initialForm = function () {

        //$scope.isLoading is the variable that use for check statue of process.
        $scope.isLoading = true;

        // idCrop is the id of the crop that is gonna be shown
    	var idCrop = $stateParams.id;

        // $scope.crop  is the variable that store data from service.
        $scope.crop = {};

        // The function for show loading progress
        jQuery('#cropdetails-content').hide();
        jQuery('#cropdetails-loading-progress').show();

        CropdetailsService.getCropDetails(idCrop).then(function(data) {
        	$scope.crop = data;

            jQuery('#cropdetails-loading-progress').hide();
            jQuery('#cropdetails-content').fadeIn();
            $scope.isLoading = false;
        });

    };// End initialForm.

    $scope.harvesting = function($event) {
        console.log('harvesting');

        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'confirm-dialog.html',
            targetEvent: $event,
            locals: {
                displayOption: {
                    title: "Cosecha",
                    content: "¿Desea marcar este cultivo como cosechado?",
                    ok: "Sí",
                    cancel: "Cancelar"
                }
            }
        }).then(function() {
            CropdetailsService.setHarvesting($scope.crop.idCrop).then(function() {
                console.log('cosechado');

                $ionicHistory.goBack();
            });
        });
    }

    $scope.initialForm();
    //new date
    $scope.fecha = new Date();
}); // End of cropdetails controller.
