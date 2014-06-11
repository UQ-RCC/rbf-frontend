'use strict';

angular.module('angularApp')
    .controller('UploadInterviewsCtrl', function($scope, interview, GraphHelper, Entity, Uris, $cacheFactory, File, Expression, toaster, $state) {

        $scope.interview = interview;
        interview.$audioFiles = [];
        interview.$transcriptFiles = [];


        $scope.isValidYoutubeUrl = function(url) {
            return url.indexOf('you') !== -1 && url.indexOf('ogg') === -1 && url.indexOf('mp3') === -1;
        };

        $scope.setupYoutubeUrls = function() {
            // Setup the youtube url
            angular.forEach($scope.interview[Uris.QA_EXTERNAL_LOCATION], function(externalLocation) {
                if ($scope.isValidYoutubeUrl(externalLocation)) {
                    // found the youtube url
                    $scope.interview.$youtubeUrl = externalLocation;
                }
            });
        };

        $scope.removeYoutubeUrlsFromExternalLocations = function() {
            var youtubeUrlIndex;
            angular.forEach($scope.interview[Uris.QA_EXTERNAL_LOCATION], function(externalLocation, index) {
                if ($scope.isValidYoutubeUrl(externalLocation)) {
                    // found the youtube url
                    youtubeUrlIndex = index;
                }
            });
            if (angular.isDefined(youtubeUrlIndex)) {
                $scope.interview[Uris.QA_EXTERNAL_LOCATION].splice(youtubeUrlIndex, 1);
            }

        };

        $scope.moveYoutubeUrlIntoInterview = function() {
            // Remove any existing ones
            $scope.removeYoutubeUrlsFromExternalLocations();

            // Add in the new one (if it exists)
            if ($scope.interview.$youtubeUrl && $scope.interview.$youtubeUrl.length) {
                $scope.interview[Uris.QA_EXTERNAL_LOCATION] = GraphHelper.asArray($scope.interview[Uris.QA_EXTERNAL_LOCATION]);
                $scope.interview[Uris.QA_EXTERNAL_LOCATION].push($scope.interview.$youtubeUrl);
            }
        };

        $scope.setupYoutubeUrls();


        $scope.onAudioFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.
            angular.forEach($files, function(file) {
                console.log('file', file);
                // Create an expression for each files
                var newFile = {};
                $scope.interview.$audioFiles.unshift(newFile);
                newFile.uploadFile = file;
                newFile.uploadFn = File.upload($scope.myModelObj, file)
                    .progress(function(evt) {
                        newFile.uploadFile.percent = parseInt(100.0 * evt.loaded / evt.total);
                        newFile.uploadFile.isComplete = newFile.uploadFile.percent === 100;
                    }).success(function(data) {
                        // file is uploaded successfully
                        $scope.interview[Uris.QA_HAS_FILE].push(data.uri);

                        // Set the transcript
                        // expression[Uris.QA_HAS_TRANSCRIPT] = data.uri;
                        $scope.interview[Uris.QA_EXTERNAL_LOCATION].push(Uris.SESAME_FILE_ROOT + data[Uris.QA_SYSTEM_LOCATION]);

                        // expression.$file = File.setupImageUrls(data);
                        // {"uri":"http://qldarch.net/users/amuys/DigitalFile#70211253214","http://qldarch.net/ns/rdf/2012-06/terms#managedFile":true,"http://qldarch.net/ns/rdf/2012-06/terms#basicMimeType":"text/plain","http://qldarch.net/ns/rdf/2012-06/terms#dateUploaded":1398229653214,"http://qldarch.net/ns/rdf/2012-06/terms#sourceFilename":"91f43085d59092db9ed9c59bac06ffa2.txt","http://www.w3.org/1999/02/22-rdf-syntax-ns#type":"http://qldarch.net/ns/rdf/2012-06/terms#DigitalFile","http://qldarch.net/ns/rdf/2012-06/terms#transcriptFile":"amuys/transcript/amuys-1398229653098-91f43085d59092db9ed9c59bac06ffa2.txt.json","http://qldarch.net/ns/rdf/2012-06/terms#uploadedBy":"http://qldarch.net/users/amuys","http://qldarch.net/ns/rdf/2012-06/terms#hasFileSize":39724,"http://qldarch.net/ns/rdf/2012-06/terms#systemLocation":"amuys/amuys-1398229653072-91f43085d59092db9ed9c59bac06ffa2.txt"}
                    });
                // $scope.interview.$files.push(file);
            });
        };

        $scope.onTranscriptFileSelect = function($files) {
            //$files: an array of files selected, each file has name, size, and type.
            angular.forEach($files, function(file) {
                console.log('file', file);
                // Create an expression for each files
                var newFile = {};
                // $scope.interview.$transcriptFiles.unshift(newFile);
                newFile.uploadFile = file;
                newFile.uploadFn = File.upload($scope.myModelObj, file)
                    .progress(function(evt) {
                        newFile.uploadFile.percent = parseInt(100.0 * evt.loaded / evt.total);
                        newFile.uploadFile.isComplete = newFile.uploadFile.percent === 100;
                    }).success(function(data) {
                        // file is uploaded successfully
                        // $scope.interview[Uris.QA_HAS_FILE].push(data.uri);

                        if (angular.isDefined(data[Uris.QA_TRANSCRIPT_FILE])) {
                            // It's been processed as a transcript file
                            // Set the hasTrascript property
                            $scope.interview[Uris.QA_HAS_TRANSCRIPT] = data.uri; //data[Uris.QA_TRANSCRIPT_FILE];
                            // Set a shortcut to the transcript file
                            $scope.interview[Uris.QA_TRANSCRIPT_LOCATION] = Uris.SESAME_FILE_ROOT + data[Uris.QA_TRANSCRIPT_FILE];
                        } else {
                            toaster.pop('error', 'Transcript couldn\'t be processed', 'Sorry this transcript couldn\'t be processed');
                        }
                        // Set the transcript
                        // expression[Uris.QA_HAS_TRANSCRIPT] = data.uri;
                        // $scope.interview[Uris.QA_EXTERNAL_LOCATION] = Uris.SESAME_FILE_ROOT + data[Uris.QA_SYSTEM_LOCATION];

                        // expression.$file = File.setupImageUrls(data);
                        // {"uri":"http://qldarch.net/users/amuys/DigitalFile#70211253214","http://qldarch.net/ns/rdf/2012-06/terms#managedFile":true,"http://qldarch.net/ns/rdf/2012-06/terms#basicMimeType":"text/plain","http://qldarch.net/ns/rdf/2012-06/terms#dateUploaded":1398229653214,"http://qldarch.net/ns/rdf/2012-06/terms#sourceFilename":"91f43085d59092db9ed9c59bac06ffa2.txt","http://www.w3.org/1999/02/22-rdf-syntax-ns#type":"http://qldarch.net/ns/rdf/2012-06/terms#DigitalFile","http://qldarch.net/ns/rdf/2012-06/terms#transcriptFile":"amuys/transcript/amuys-1398229653098-91f43085d59092db9ed9c59bac06ffa2.txt.json","http://qldarch.net/ns/rdf/2012-06/terms#uploadedBy":"http://qldarch.net/users/amuys","http://qldarch.net/ns/rdf/2012-06/terms#hasFileSize":39724,"http://qldarch.net/ns/rdf/2012-06/terms#systemLocation":"amuys/amuys-1398229653072-91f43085d59092db9ed9c59bac06ffa2.txt"}
                    });
                // $scope.interview.$files.push(file);
            });
        };



        $scope.create = function(expression) {
            $cacheFactory.get('$http').remove('/ws/rest/expression/detail/qldarch%3AInterview?INCSUBCLASS=false&');
            $cacheFactory.get('$http').remove('/ws/rest/expression/summary/qldarch%3AInterview?INCSUBCLASS=false&');
            $cacheFactory.get('$http').remove('/ws/rest/expression/description?SUMMARY=false&IDLIST=' + encodeURIComponent(expression.uri));


            $scope.moveYoutubeUrlIntoInterview();

            if (expression.uri) {
                Expression.update(expression.uri, expression).then(function() {
                    // var interviewee = $scope.interview.$interviewees[0];
                    $state.go($scope.interview.$state, $scope.interview.$stateParams);
                });
            } else {
                Expression.create(expression).then(function() {
                    $state.go($scope.interview.$state, $scope.interview.$stateParams);
                });
            }
        };
        $scope.cancel = function() {
            if ($scope.interview.uri) {
                // Go back to interview
                $state.go($scope.interview.$state, $scope.interview.$stateParams);
            } else {
                $state.go('user.files.interviews');
            }
        };

        $scope.removeAudioFile = function(file) {
            var index = $scope.interview.files.indexOf(file);
            $scope.interview.files.splice(index, 1);

            index = $scope.interview[Uris.QA_HAS_FILE].indexOf(file.uri);
            $scope.interview[Uris.QA_HAS_FILE].splice(index, 1);

            index = $scope.interview[Uris.QA_EXTERNAL_LOCATION].indexOf(Uris.SESAME_FILE_ROOT + file[Uris.QA_SYSTEM_LOCATION]);
            $scope.interview[Uris.QA_EXTERNAL_LOCATION].splice(index, 1);
        };
        $scope.removeNewAudioFile = function(file) {
            var index = $scope.interview.$audioFiles.indexOf(file);
            $scope.interview.$audioFiles.splice(index, 1);

            index = $scope.interview[Uris.QA_HAS_FILE].indexOf(file.uri);
            $scope.interview[Uris.QA_HAS_FILE].splice(index, 1);

            index = $scope.interview[Uris.QA_EXTERNAL_LOCATION].indexOf(Uris.SESAME_FILE_ROOT + file[Uris.QA_SYSTEM_LOCATION]);
            $scope.interview[Uris.QA_EXTERNAL_LOCATION].splice(index, 1);
        };

        $scope.removeTranscript = function() {
            delete $scope.interview[Uris.QA_HAS_TRANSCRIPT];
            delete $scope.interview[Uris.QA_TRANSCRIPT_LOCATION];
        };
        // $scope.cancelUpload = function (expression) {
        //     // Remove the expression
        //     var index = $scope.interviews.indexOf(expression);
        //     $scope.interviews.splice(index, 1);

        //     // Cancel the upload
        //     expression.$upload.cancel();
        // };


        /*
        =====================================================
            Select2 Boxes
        =====================================================
         */

        /**
         * Clears the cache for the select so
         * that if a new person is added, the select is refreshed with the newly added list.
         *
         * @return {} [description]
         */
        $scope.clearSelectCache = function() {
            $cacheFactory.get('$http').remove('/ws/rest/entity/detail/qldarch%3ANonDigitalThing?INCSUBCLASS=true&');
        };

        // Update our model when the selected interviewers change
        $scope.$watch('interview.$interviewees', function(selectedInterviewees) {
            $scope.interview[Uris.QA_INTERVIEWEE] = [];
            $scope.interview[Uris.DCT_TITLE] = '';
            angular.forEach(selectedInterviewees, function(interviewee) {
                $scope.interview[Uris.QA_INTERVIEWEE].push(interviewee.uri);
                $scope.interview[Uris.DCT_TITLE] += interviewee.name + ' ';
            });
            $scope.interview[Uris.DCT_TITLE] += 'Interview';
        });

        $scope.$watch('interview.$interviewers', function(selectedInterviewers) {
            $scope.interview[Uris.QA_INTERVIEWER] = [];
            angular.forEach(selectedInterviewers, function(interviewer) {
                $scope.interview[Uris.QA_INTERVIEWER].push(interviewer.uri);
            });
        });

        // Setup the entity select boxes
        $scope.personSelect = {
            placeholder: 'Select a Person',
            dropdownAutoWidth: true,
            multiple: true,
            minimumInputLength: 2,
            query: function(options) {
                console.log('querying!');
                Entity.findByName(options.term, false).then(function(entities) {
                    var data = {
                        results: []
                    };
                    angular.forEach(entities, function(entity) {
                        var types = GraphHelper.asArray(entity[Uris.RDF_TYPE]);
                        if (types.indexOf(Uris.QA_ARCHITECT_TYPE) === -1 || types.indexOf(Uris.FOAF_PERSON_TYPE) === -1) {

                        }
                        data.results.unshift(entity);
                    });
                    options.callback(data);
                });
            }
        };

    });
