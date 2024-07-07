'use strict';

angular.module('qldarchApp').controller('StructureCtrl', function($scope, structure, designers, ArchObj, firms, architects, $filter, buildingTypologies, $state, $q, $stateParams, Utils, toaster, ngProgress) {
      /* globals $:false */
	$scope.structure = structure;
	$scope.designers = designers;
	$scope.dropSupported = true;
	$scope.iterateExcelObj = {};
	$scope.records=null;
	$scope.payload = {};
      
     
      /*
      $scope.toDate = function(datestr) {
        if (!datestr) return;
        var parts = datestr.split('-');
        while (parts.length < 3) parts.unshift('01');
        
        return new Date(parts.reverse().join('-'));
      };
      */
	(function(){
	if ($scope.structure && $scope.structure.completion) {
		var completionpd = $scope.structure.completionpd;
		var parts = $scope.structure.completion.split('-');
		if (completionpd >= 365) {
		parts.splice(1);
		} else if (completionpd >= 28) {
		parts.splice(2);
		}
		$scope._completion = parts.reverse().join('-');
	}
	})();

	$scope.structure.type = 'structure';
	$scope.structure.associatedEntities = [];

	$scope.structure.$associatedFirm = null;
	if (angular.isDefined(designers.firms)) {
	$scope.structure.$associatedFirm = [];
	angular.forEach(designers.firms, function(firm) {
		var firmobj = {
		id : firm.subject,
		text : firm.subjectlabel
		};
		$scope.structure.$associatedFirm.push(firmobj);
		firmobj.relationshipid = firm.relationshipid;
		$scope.structure.associatedEntities.push(firmobj);
	});
	}
	if (angular.isDefined($stateParams.firmId)) {
	$scope.structure.$associatedFirm = [];
	var firm = $.grep(firms, function(f) {
		return JSON.stringify(f.id) === $stateParams.firmId;
	});
	var firmobj = {
		id : firm[0].id,
		text : firm[0].label
	};
	$scope.structure.$associatedFirm.push(firmobj);
	}

	$scope.firmSelect = {
	placeholder : 'Select a Firm',
	dropdownAutoWidth : true,
	multiple : true,
	allowClear : true,
	data : Utils.makeSelectOptions(firms)
	};

	$scope.structure.$associatedArchitects = null;
	if (angular.isDefined(designers.architects)) {
		$scope.structure.$associatedArchitects = [];
		angular.forEach(designers.architects, function(architect) {
			var architectobj = {
			id : architect.subject,
			text : architect.subjectlabel
			};
			$scope.structure.$associatedArchitects.push(architectobj);
			architectobj.relationshipid = architect.relationshipid;
			$scope.structure.associatedEntities.push(architectobj);
		});
	}
	if (angular.isDefined($stateParams.architectId)) {
		$scope.structure.$associatedArchitects = [];
		var architect = $.grep(architects, function(a) {
			return JSON.stringify(a.id) === $stateParams.architectId;
		});
		var architectobj = {
			id : architect[0].id,
			text : architect[0].label
		};
		$scope.structure.$associatedArchitects.push(architectobj);
	}

	$scope.architectSelect = {
		placeholder : 'Select an Architect',
		dropdownAutoWidth : true,
		multiple : true,
		data : Utils.makeSelectOptions(architects)
	};

	$scope.structure.$typologies = null;
	if (angular.isDefined(structure.typologies)) {
		$scope.structure.$typologies = [];
		angular.forEach(structure.typologies, function(typo) {
			for ( var typology in buildingTypologies) {
			if (typo === buildingTypologies[typology]) {
				$scope.structure.$typologies.push({
				id : typology,
				text : buildingTypologies[typology]
				});
			}
			}
		});
	}

	$scope.typologySelect = {
		placeholder : 'Select a Building Typology',
		dropdownAutoWidth : true,
		multiple : true,
		query : function(options) {
			var data = {
			results : []
			};
			for ( var typology in buildingTypologies) {
			data.results.push({
				id : typology,
				text : buildingTypologies[typology]
			});
			}
			options.callback(data);
		}
	};

	$scope.$watch('structure.location', function(location) {
	if (angular.isDefined(location)) {
		clearTimeout($scope.typingTimer);
		$scope.typingTimer = setTimeout(function() {
		// $.getJSON('https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyByxzrKtppGuOxwzav-P52wTcfXcG1IJz0&address=' + $scope.structure.location,
		$.getJSON('https://nominatim.openstreetmap.org/search?q=' + $scope.structure.location+'&format=json',
			function(data) {
			/*    if (data.results.length === 1) {
				if ((structure.latitude !== data.results[0].geometry.location.lat) ||
					(structure.longitude !== data.results[0].geometry.location.lng)) {
					structure.latitude = data.results[0].geometry.location.lat;
					structure.longitude = data.results[0].geometry.location.lng;
					$('#LAT').val(data.results[0].geometry.location.lat);
					$('#LNG').val(data.results[0].geometry.location.lng);
				}
				}*/
		if (data.length > 0) {
			if ((structure.latitude !== data[0].lat) || (structure.longitude !== data[0].lon)) {
			structure.latitude = data[0].lat;
			structure.longitude = data[0].lon;
			$('#LAT').val(data[0].lat);
			$('#LNG').val(data[0].lon);
			}
		}
			});
		}, 2000);
	}
	});

    
	$scope.updateBulkStructures = function(data, $datafile) {
		var jsonData = [];
		$scope.payload = angular.copy(data);
		var rowsToDisplay = [];
		$scope.expData = false;
	
		var fileName = $datafile[0].name;
		var file = $datafile[0];
		var projects = [];
	
		if (!file) {
			toaster.pop('error', 'Please select a file');
			return;
		}
	
		if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
			var reader = new FileReader();
			reader.onprogress = function(event) {
				$scope.expData = true;
				if (event.lengthComputable) {
					$scope.progress = Math.round((event.loaded / event.total) * 100);
					$scope.$apply();
				}
			};
	
			reader.onloadstart = function(event) {
				$scope.progress = 0;
				$scope.$apply();
			};
	
			reader.onload = function(e) {
				var data = new Uint8Array(e.target.result);
				var workbook = XLSX.read(data, { type: 'array' });
				var sheetName = workbook.SheetNames[0];
				var worksheet = workbook.Sheets[sheetName];
				jsonData = XLSX.utils.sheet_to_json(worksheet);
	
				var confirmMdlJs = document.getElementById('mdl_confirmBox');
				var ConfirmModal = new bootstrap.Modal(confirmMdlJs);
				if (jsonData.length > 0) {
					$scope.iterateExcelObj = {
						dataObj: jsonData,
						index: 0,
						confirmMdl: ConfirmModal
					};
				}
	
				var promises = jsonData.map(function(row, index) {
					return new Promise(function(resolve) {
						var params = {};
						var rowNumber = index + 2;
						params.row = rowNumber;
						params.index = index;
						var rowsToConfirm = {};
	
						var promises = [];
	
						if (row.associateFirm != null) {
							var firms = row.associateFirm.split(';');
							promises.push(Promise.all(firms.map(function(firm) {
								return ArchObj.loadSimilarity(firm.trim()).then(function(res) {
									if (res != null) {
										var firmsA = res.filter(firm => firm.type === 'firm');
										var minDistance = Infinity;
										var mostSimilarRecord = null;
	
										if (firmsA.length > 1) {
											firmsA.forEach(function(record) {
												var distance = Utils.levenshteinDistance(firm.trim().toLowerCase(), record.label.toLowerCase());
												if (distance < minDistance) {
													minDistance = distance;
													mostSimilarRecord = record;
												}
											});
											rowsToConfirm.rowNumber = rowNumber;
											rowsToConfirm.index = index;
											rowsToConfirm.existingFirm = firm.trim();
											rowsToConfirm.similarFirm = mostSimilarRecord;
											rowsToConfirm.confirmed = false;
										} else if (firmsA.length == 1) {
											if (firmsA[0].label.trim().toLowerCase() === firm.trim().toLowerCase())
												params.associateFirm = firmsA[0];
											else {
												rowsToConfirm.rowNumber = rowNumber;
												rowsToConfirm.index = index;
												rowsToConfirm.existingFirm = firm.trim();
												rowsToConfirm.similarFirm = firmsA[0];
												rowsToConfirm.confirmed = false;
											}
										} else {
											rowsToConfirm.rowNumber = rowNumber;
											rowsToConfirm.index = index;
											rowsToConfirm.newFirm = firm;
											rowsToConfirm.confirmed = false;
										}
									} else {
										rowsToConfirm.rowNumber = rowNumber;
										rowsToConfirm.index = index;
										rowsToConfirm.newFirm = firm;
										rowsToConfirm.confirmed = false;
									}
								});
							})));
						}
	
						if (row.associateArchitect != null) {
							var architects = row.associateArchitect.split(';');
							promises.push(Promise.all(architects.map(function(architect) {
								return ArchObj.loadSimilarity(architect.trim()).then(function(res) {
									if (res != null) {
										var architectA = res.filter(obj => obj.type === 'person');
										var minDistance = Infinity;
										var mostSimilarRecord = null;
	
										if (architectA.length > 1) {
											architectA.forEach(function(record) {
												var distance = Utils.levenshteinDistance(architect.trim().toLowerCase(), record.label.toLowerCase());
												if (distance < minDistance) {
													minDistance = distance;
													mostSimilarRecord = record;
												}
											});
											rowsToConfirm.rowNumber = rowNumber;
											rowsToConfirm.index = index;
											rowsToConfirm.existingArchitect = architect.trim();
											rowsToConfirm.similarArchitect = mostSimilarRecord;
											rowsToConfirm.confirmed = false;
										} else if (architectA.length == 1) {
											if (architectA[0].label.trim().toLowerCase() === architect.trim().toLowerCase())
												params.associateArchitect = architectA[0];
											else {
												rowsToConfirm.rowNumber = rowNumber;
												rowsToConfirm.index = index;
												rowsToConfirm.existingArchitect = architect.trim();
												rowsToConfirm.similarArchitect = architectA[0];
												rowsToConfirm.confirmed = false;
											}
										} else {
											rowsToConfirm.rowNumber = rowNumber;
											rowsToConfirm.index = index;
											rowsToConfirm.newArchitect = architect;
											rowsToConfirm.confirmed = false;
										}
									} else {
										rowsToConfirm.rowNumber = rowNumber;
										rowsToConfirm.index = index;
										rowsToConfirm.newArchitect = architect;
										rowsToConfirm.confirmed = false;
									}
								});
							})));
						}
	
						if (row.BuildingTypology != null)
							params.typologies = row.BuildingTypology.trim();
						if (row.BuildingName != null)
							params.label = row.BuildingName.trim();
						if (row.StitchedAddress != null)
							params.location = row.StitchedAddress.trim();
						if (row.Latitude != null)
							params.latitude = row.Latitude;
						if (row.Longitude != null)
							params.longitude = row.Longitude;
						if (row.australian != null)
							params.australian = row.australian;
						if (row.completion != null) {
							var completionDate = new Date(row.completion.trim());
							params.completion = completionDate;
						}
						if (row.demolished != null)
							params.demolished = row.demolished;
						if (row.summary != null)
							params.summary = row.summary.trim();
	
						projects.push(params);
	
						Promise.all(promises).then(function() {
							if (Object.keys(rowsToConfirm).length != 0) {
								rowsToDisplay.push(rowsToConfirm);
							}
							resolve();
						});
					});
				});
	
				Promise.all(promises).then(function() {
					$scope.payload.projects = projects;
	
					if (rowsToDisplay != null) {
						$scope.records = rowsToDisplay;
						$scope.iterateExcelObj.confirmMdl.show();
					}
	
					$scope.progress = 100;
					$scope.$apply();
				});
			};
	
			reader.onerror = function(event) {
				alert('Error reading file.');
				$scope.progress = 0;
				$scope.expData = false;
				$scope.$apply();
			};
	
			reader.readAsArrayBuffer(file);
	
		} else {
			toaster.pop('error', 'Incorrect file type');
		}
	};
	

	$scope.updateArchitect = function (record) {
		var recordIndex = $scope.payload.projects.findIndex(project => project.index === record.index)
		if (record.similarArchitect ) {
			//console.log("$scope.architect")
			$scope.payload.projects[recordIndex].associateArchitect = record.similarArchitect
			//console.log($scope.payload)
			record.architectConfirmed = true;
			$scope.updateConfirm(record) 
			//$scope.checkAllConfirmed(record)
		}

	};

	$scope.updateFirm = function (record) {
		var recordIndex = $scope.payload.projects.findIndex(project => project.index === record.index)
		
		if(record.similarFirm) {
			$scope.payload.projects[recordIndex].associateFirm = record.similarFirm
			record.firmConfirmed = true; 
			$scope.updateConfirm(record) 
		} 
	};

	$scope.addFirm = async function(record) {
		var recordIndex = $scope.payload.projects.findIndex(project => project.index === record.index)
		if(record.newFirm || record.existingFirm) {
			var firm = {}
			firm.type = "firm"
			if (record.newFirm) 
				firm.label = record.newFirm.trim()
			else if (record.existingFirm)
				firm.label = record.existingFirm.trim()

			var res = await ArchObj.createFirm(firm)
			//console.log(res)
			if (res !=null) {
				var newfirm = {
					id: res.id,
					label: res.label,
					type: res.type
				};
				$scope.payload.projects[recordIndex].associateFirm = newfirm
			}
			record.firmConfirmed = true;
			$scope.updateConfirm(record) 
			
		}
	};

	$scope.addArchitect = async function(record) {
		var recordIndex = $scope.payload.projects.findIndex(project => project.index === record.index)
		if (record.newArchitect || record.existingArchitect) {
			var architect = {}
			architect.type = "person"
			
			if (record.newArchitect) 
				architect.label = record.newArchitect
			if (record.existingArchitect)
				architect.label = record.existingArchitect

			var response = await ArchObj.createArchitect(architect)
			//console.log(response)
			if (response!=null) {
				var newarchitect = {
					id: response.id,
					label: response.label,
					type: response.type
				};
				$scope.payload.projects[recordIndex].associateArchitect = newarchitect;
			}
			record.architectConfirmed = true;
			$scope.updateConfirm(record) 
			
		}
	};

	$scope.updateConfirm = function (record) {
		console.log($scope.records)
		var recordIndex = $scope.records.findIndex(srecord => srecord.index === record.index)
		//console.log(recordIndex)
		if ((record.similarFirm || record.newFirm) && (record.similarArchitect ||record.newArchitect)) {
			if( record.firmConfirmed && record.architectConfirmed ){
				//console.log("first condi")
				$scope.records[recordIndex].confirmed = true;
			}
			
		} else if ((!record.similarArchitect || !record.newArchitect) && (record.similarFirm || record.newFirm )) {
			if (record.firmConfirmed ) {
				//console.log("secod condi")
				$scope.records[recordIndex].confirmed = true;
			}
			
		} else if ((!record.similarFirm || !record.newFirm ) && (record.similarArchitect || record.newArchitect) ) {
			if (record.architectConfirmed) {
				//console.log("third condi")
				$scope.records[recordIndex].confirmed = true;
			}
		}

		$scope.checkAllConfirmed();
	};

    $scope.checkAllConfirmed = async function() {
		console.log("within chek all")
		var promises = [];
		var promise
		var allConfirmed = $scope.records.every(function(record) {
			console.log(record)
          	return record.confirmed;
        }); 
        console.log( $scope.records)
        console.log(allConfirmed)
        //console.log("allConfirmed")
        if (allConfirmed) {
			$scope.iterateExcelObj.confirmMdl.hide();
			//send the project to backend for bulk update
			ngProgress.reset();
			ngProgress.color('#ea1d5d');
			ngProgress.start();
			promise =  ArchObj.createBulkStructures($scope.payload).then(function(res) {
			console.log("res")
			console.log(res)
			return res;

			}).catch(function(error) {
			/* console.log("error in promise")   
			console.log(error)  */  
			$state.go('structure.summary.bulk');
			return error;
			});
			promises.push(promise);
			console.log("in staructureCtl") 

			$q.all(promises).then (function () {
				ngProgress.complete();
				ngProgress.reset();
				console.log("in else structure ctl")
				$state.go('structures.australian');
			})
		  //$scope.iterateExcelObj.confirmMdl.addEventListener('hidden.bs.modal')
        }
    };


	$scope.updateStructure = function(data) {
		var promises = [];
		var promise;
		(function(d){
			if (!d) return;
			//var yyyymmdd = d.replace(/\D*/g,'');
			var parts = d.split('-');
			// completionpd is a precision delta in days, eg:
			// 0 means that the date is accurate to the date/day
			// 30 means that the date is accurate to the month
			console.log(parts)
			if (parts.length === 3) {
			data.completionpd = 0;
			} else if (parts.length === 2) {
			data.completionpd = (new Date(+parts[1], parts[0] - 1, 0)).getDate();
			} else if (parts.length === 1) {
			var y = +parts[2];
			data.completionpd = !(y%(y%25?4:16)) ? 366 : 365;
			}
			data.completion = parts.reverse().join('-');
		})($scope._completion);
		if (data.id) {
			console.log("inside update")
			promise = ArchObj.updateStructure(data).then(function(res) {
			return res;
			}).catch(function(error) {
			//console.log('Failed to save', error);
			$state.go('structure.summary.edit', {
				structureId : data.id
			});
			return error;
			});
			promises.push(promise);
		} else {
			console.log("inside create")
			console.log(data)
			promise = ArchObj.createStructure(data).then(function(res) {
			return res;
			}).catch(function(error) {
			//console.log('Failed to save', error);
			$state.go('structure.summary.edit', {
				structureId : data.id
			});
			return error;
			});
			promises.push(promise);
		}
		$q.all(promises).then(function() {
			if (angular.isDefined($stateParams.firmId)) {
			$state.go('firm.structures', {
				firmId : $stateParams.firmId
			}, {
				reload : true,
				inherit : false
			});
			} else if (angular.isDefined($stateParams.architectId)) {
			$state.go('architect.structures', {
				architectId : $stateParams.architectId
			}, {
				reload : true,
				inherit : false
			});
			} else if (structure.id) {
			$state.go('structure.summary', {
				structureId : data.id
			}, {
				reload : true,
				inherit : false
			});
			} else {
			$state.go('structures.australian');
			}
		});
	};

	$scope.clearCompletionDate = function() {
		structure.completion = '';
	};

	$scope.cancel = function() {
		if (structure.id) {
			$state.go('structure.summary');
		} else if (angular.isDefined($stateParams.firmId)) {
			$state.go('firm.structures', {
			firmId : $stateParams.firmId
			});
		} else if (angular.isDefined($stateParams.architectId)) {
			$state.go('architect.structures', {
			architectId : $stateParams.architectId
			});
		} else {
			$state.go('structures.australian');
		}
	};
});
