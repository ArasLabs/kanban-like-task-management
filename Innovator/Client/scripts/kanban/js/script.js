var selectedBoard = "";
var selectedStage = "";
var selectedCard = "";
var boardStages = "";
var inn = top.aras.newIOMInnovator();

$(document).ready(function () {
	loadBoards();
});

$("#addBoard").click(function () {
	var qryBoards = top.aras.newIOMItem('LAB_Boards', 'add');
	var results = qryBoards.apply();
	var count = results.getItemCount();
	loadBoards();
});

$("#refreshBoard").click(function () {
	loadSingleBoard(selectedBoard, true);
});

$("#refreshBoards").click(function () {
	loadBoards();
});

$("#addCard").click(function () {
	var qryBoard = top.aras.newIOMItem('LAB_Boards', 'edit');
	qryBoard.setID(selectedBoard);
	var qryBoardCards = top.aras.newIOMItem('LAB_BoardCards', 'add');
	var qryCard = top.aras.newIOMItem('LAB_Cards', 'add');
	qryBoardCards.setRelatedItem(qryCard);
	qryBoard.addRelationship(qryBoardCards);
	var results = qryBoard.apply();
	var count = results.getItemCount();

	loadSingleBoard(selectedBoard, true);

});

$("#backToBoards").click(function () {
	loadBoards();
	$("#board").slideUp();
	$("#boards").slideDown();
	selectedBoard = "";
	boardStages = "";
});

$("#changeWallpaper").click(function () {
	$("#changeWallpaper").slideUp({
		complete: function () {
			$("#wallpaperDiv").slideDown();
		}
	});
});

$("#cancelChangeWallpaper").click(function () {
	$("#wallpaperDiv").slideUp({
		complete: function () {
			$("#changeWallpaper").slideDown();
		}
	});
});


$("#cardFilter").keyup(function () {
	$(".card").each(function () {
		var testTitle = $(this).find(".cardTitleText").text().toLowerCase().indexOf($("#cardFilter").val().toLowerCase()) < 0;
		var testContent = $(this).find(".cardContent").text().toLowerCase().indexOf($("#cardFilter").val().toLowerCase()) < 0;

		if (testTitle && testContent) {
			$(this).fadeOut();
		} else {
			$(this).fadeIn();
		}
	});
});


$("#boardFilter").keyup(function () {
	$(".board").each(function () {
		var testTitle = $(this).find(".boardTitle").text().toLowerCase().indexOf($("#boardFilter").val().toLowerCase()) < 0;
		var testContent = $(this).find(".boardDescription").text().toLowerCase().indexOf($("#boardFilter").val().toLowerCase()) < 0;
		//console.log("board checked");
		if (testTitle && testContent) {
			$(this).fadeOut();
		} else {
			$(this).fadeIn();
		}
	});
});

$("#removeCard").click(function (event) {
	var confirmDeletiong = confirm("confirm deletion of the selected card?", "false");
	if (confirmDeletiong) {
		var qryCards = top.aras.newIOMItem('LAB_Cards', 'delete');
		qryCards.setID(selectedCard);
		qryCards = qryCards.apply();
		if (qryCards.isError()) {
			alert("error on deletion, please contact admin");
		} else {
			$(".card.selected").remove();
		}
	}
	event.stopPropagation();
});

$('#myStateButton').on('click', function () {
    $(this).button('complete') // button text will be "finished!"
})


$("#addStage").click(function () {
	addStageToBoard(selectedBoard, boardStages + ";new stage");
	loadSingleBoard(selectedBoard, true);
});

$("#removeStage").click(function () {
	if (selectedStage !== "") {
		removeStageToBoard(selectedBoard, boardStages, selectedStage);
		loadSingleBoard(selectedBoard, true);
	}
});

$("#removeBoard").click(function () {
	var removeValidation = confirm("Do you confirm deletion?", "false");
	if (removeValidation) {
		var qryBoard = top.aras.newIOMItem('LAB_Boards', 'delete');
		qryBoard.setID(selectedBoard);
		var qryBoardCards = top.aras.newIOMItem('LAB_BoardCards', 'delete');
		var qryCard = top.aras.newIOMItem('LAB_Cards', 'delete');
		qryBoard = qryBoard.apply();
		if (qryBoard.isError()) {
			alert("error for deleting, please contact admin");
		}
		loadBoards();
	}
});

$(".switchColorVisibility").click(function () {
	// retrieve color to handle
	var color = $(this).find("span:eq(0)").attr("color");
	if ($(this).hasClass("active")) {
		// means then it will not have
		showHideColoredCards(false, color);
	} else {
		showHideColoredCards(true, color);
	}
});


// if show = false ==> hide
function showHideColoredCards(show, color) {
	if (show) {
		$(".panel[color='" + color + "']").parent(".card").fadeIn();
	} else {
		$(".panel[color='" + color + "']").parent(".card").fadeOut();
	}
}


function checkIfStageLabelExists(label, creation) {
	var qtyWithLabel = 0;
	$(".stageTitle").each(function () {
		if ($(this).text().trim() === label.trim()) {
			qtyWithLabel++;
		}
		//console.log($(this).text() + " - " + label);
	});

	//console.log("result : " + qtyWithLabel);
	if (creation) {
		return (qtyWithLabel > 0);
	} else {
		return (qtyWithLabel > 1);
	}

}


function addStageToBoard(boardId, StagesString) {

	var counter = 0;
	var stagesArray = StagesString.split(";");
	var latest = stagesArray[stagesArray.length - 1];
	StagesStringToType = latest;
	while (checkIfStageLabelExists(StagesStringToType.trim(), true)) {
		counter++;
		StagesStringToType = latest + "-" + counter;
	}
	stagesArray[stagesArray.length - 1] = StagesStringToType;
	StagesString = stagesArray.join(";");
	var qryBoard = top.aras.newIOMItem('LAB_Boards', 'edit');
	qryBoard.setID(boardId);
	qryBoard.setProperty("statuses", StagesString);
	var results = qryBoard.apply();
	var count = results.getItemCount();
}

function removeStageToBoard(boardId, StagesString, removedStageValue) {
	var stagesArray = StagesString.split(";");
	stagesArray.splice()
	for (var i = 0; i < stagesArray.length; i++) {
		stagesArray[i] = stagesArray[i].trim();
	}
	var index = stagesArray.indexOf(removedStageValue.trim());
	if (index > -1) {
		stagesArray.splice(index, 1);
	}
	StagesString = stagesArray.join(";");
	var qryBoard = top.aras.newIOMItem('LAB_Boards', 'edit');
	qryBoard.setID(boardId);
	qryBoard.setProperty("statuses", StagesString);
	var results = qryBoard.apply();
	var count = results.getItemCount();
}

function loadBoards() {


	$("#boardFilter").html("");
	$("#removeBoard").addClass("disabled");
	$("#configBoard").addClass("disabled");

	// fill itemtype llist

	var qryBoards = top.aras.newIOMItem('LAB_Boards', 'get');
	qryBoards.setAttribute("orderBy", "boardname");
	var results = qryBoards.apply();
	var count = results.getItemCount();
	$("#boardsContent").html("");
	var vaultRefTable = {};
	var boardsContentString = "";
	for (var i = 0; i < count; ++i) {
		var item = results.getItemByIndex(i);

		// get boardimage
		var vaultref = item.getProperty("creatorpicture","undefined");
		var fileUrl = "nomanager.png";
		if ((vaultref !== "undefined") && (vaultRefTable[vaultref] == undefined)) {
			fileUrl = inn.getFileUrl(vaultref.split("?fileId=")[1], 1);
			vaultRefTable[vaultref] = fileUrl;
		}

		boardsContentString += "<div class='col-md-3 board' boardId='" + item.getID() + "'><div class='panel panel-default'> <div class='panel-heading boardHeader'>    <h3 class='panel-title boardTitle' contentEditable='true'>" + item.getProperty('boardname', 'no name') + "</h3>  </div>  <div class='panel-body boardDescription' contentEditable='true'>" + item.getProperty('boarddescription', 'no description') + " </div>";
		boardsContentString += " <div class='panel-footer '><div title='<h5>" + item.getPropertyAttribute("created_by_id", "keyed_name") + "</h5><img class=\"managerPicture\" width=\"96px\" src=\"" + vaultRefTable[vaultref] + " \" />' data-placement='top' data-html='true' rel='tooltip' class='userInitiales'>" + nameInitiliser(item.getPropertyAttribute("created_by_id", "keyed_name")) + "</div> <img src='" + vaultRefTable[vaultref] + "' alt='no manager' class='img-circle userInitiales' ></div>";
		boardsContentString += "</div> </div>";
	}


	$("#boardsContent").append(boardsContentString);

	enableBoardDblClick();
	enableBoardClassedDomChange(".boardTitle", "boardId", '.board', "LAB_Boards", "boardname");
	enableBoardClassedDomChange(".boardDescription", "boardId", '.board', "LAB_Boards", "boarddescription");
	enableBoardSelection();
	$("#boardBody").css("background-image", "url(default.jpg)");

	$(".panel-footer").tooltip({
		selector: "div[rel=tooltip]"
	});

	$("#configBoard").click(function () {
		top.aras.uiShowItem("LAB_Boards", selectedBoard);
	});

}



function enableBoardClassedDomChange(domClass, domIdAttribute, parentClassIdentificer, ItemTypeName, Property) {
	$(domClass).on('focus', function () {
		var $this = $(this);
		$this.data('before', $this.html());
		return $this;
	}).on('blur', function () {
		var $this = $(this);
		if ($this.data('before') !== $this.html()) {
			$this.data('before', $this.html());
			$this.trigger('change');
		}
		return $this;
	}).change(function () {
		var boardId = $(this).closest(parentClassIdentificer).attr(domIdAttribute);
		var qryBoard = top.aras.newIOMItem(ItemTypeName, 'edit');
		qryBoard.setID(boardId);
		qryBoard.setProperty(Property, $(this).text().trim());
		var results = qryBoard.apply();
	});
}
function enableCardClassedDomChange(domClass, domIdAttribute, parentClassIdentificer, ItemTypeName, Property) {


	$(domClass).keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
			$(this).blur();
            return;
        }
    });

	$(domClass).on('focus', function () {
		var $this = $(this);
		$this.data('before', $this.html());
		return $this;
	}).on('blur', function () {
		var $this = $(this);
		if ($this.data('before') !== $this.html()) {
			$this.data('before', $this.html());
			$this.trigger('change');
		}
		return $this;
	}).change(function () {
		var carddId = $(this).closest(parentClassIdentificer).attr(domIdAttribute);
		var qryBoard = top.aras.newIOMItem(ItemTypeName, 'edit');
		qryBoard.setID(carddId);
		qryBoard.setProperty(Property, $(this).text());
		var results = qryBoard.apply();
	});
}




function enableStageTitleChange() {


	$(".stageTitle").keydown(function (e) {
        if (e.keyCode == 13) {
            e.preventDefault();
			$(this).blur();
            return;
        }
    });

	$(".stageTitle").on('focus', function () {
		var $this = $(this);
		$this.data('before', $this.html());
		return $this;
	}).on('blur', function () {
		var $this = $(this);
		// test if name exists in another stage
		if (checkIfStageLabelExists($this.text(), false)) {
			$this.html($this.data('before'));
			alert("stage label already exists in this board");
		} else {
			if ($this.data('before') !== $this.html()) {
				$this.data('before', $this.html());
				if (!($this.closest("stage").hasClass("hideStage"))) {
					$this.trigger('change');
					console.log("CHANGING STAGE NAME");
				}
			}
		}
		return $this;
	}).change(function () {
		// update the elements in changed stage

		// update the stage array
		updateStageArray(selectedBoard);

	});
}

function updateStageArray(selectedBoard) {
	var stagesArray = [];
	$(".stageTitle").each(function () {
		var stageTitleText = $(this)
			.clone()  //clone the element
			.children() //select all the children
			.remove()   //remove all the children
			.end()  //again go back to selected element
			.text();
		stagesArray.push(stageTitleText.trim());
	});

	var qryBoard = top.aras.newIOMItem("LAB_Boards", 'edit');
	qryBoard.setID(selectedBoard);
	qryBoard.setProperty("statuses", stagesArray.join(";"));
	var results = qryBoard.apply();
	boardStages = stagesArray.join(";");
}


function enableBoardSelection() {
	$(".boardHeader").click(function () {
		$(".boardHeader.selected").parent().removeClass("panel-info");
		$(".boardHeader.selected").removeClass("selected");
		$(this).addClass("selected");
		$(this).parent().addClass("panel-info");
		selectedBoard = $(this).closest(".board").attr("boardId");
		$("#removeBoard").removeClass("disabled");
		$("#configBoard").removeClass("disabled");
	});
}



function loadSingleBoard(boardId, reload) {

	// board query
	var qryBoard = top.aras.newIOMItem('LAB_Boards', 'get');
	qryBoard.setID(boardId);
	var qryCards = top.aras.newIOMItem('LAB_Cards', 'get');
	var qryBoardCards = top.aras.newIOMItem('LAB_BoardCards', 'get');
	qryBoardCards.setAttribute("orderBy", "sort_order");
	qryBoardCards.setRelatedItem(qryCards);
	qryBoard.addRelationship(qryBoardCards);
	var results = qryBoard.apply();
	$("#unclassifiedContent").html("");

	// use Board Config
	selectedBoard = boardId;

	//set wallpaper
	if (!(reload)) {
		if (results.getPropertyItem("wallpaper") !== null) {
			var vaultref = results.getProperty("wallpaperurl");
			var fileUrl = inn.getFileUrl(vaultref.split("?fileId=")[1], 1);
			if ($("#boardBody").css("background-image") !== "url(" + fileUrl + ")") {
				$("#boardBody").css("background-image", "url(" + fileUrl + ")");
			}
		} else {
			$("#boardBody").css("background-image", "url(default.jpg)");
		}
	}


	var stages = [];
	boardStages = results.getProperty("statuses", "");
	var boardTitle = results.getProperty("boardname", "");
	$("p.boardName").html(boardTitle);

	stages = boardStages.split(";");
	$("#classified").html("");
	for (var stage = 0; stage < stages.length; stage++) {
		if (stages[stage] == "") {
			stages[stage] = "new stage";
		}
		$("#classified").append("<div class='stage pull-left' stageName='" + stages[stage].trim() + "'><div class='panel panel-default'> <div class='panel-heading stageHeader '><h3 class='panel-title stageTitle pull-left' contentEditable='true'>" + stages[stage] + "</h3><span class=' glyphicon glyphicon-th-large handler pull-right' ></span><span class=' glyphicon glyphicon-eye-close hideStageButton pull-right' ></span>  </div>  <div class='panel-body stageBody droppable'> </div></div></div>");
	}
	$("#boardContent").width((stages.length + 1) * 320);



	// use Board Content
	var resultsCards = results.getItemsByXPath("//Item[@type='LAB_Cards']");
	var count = resultsCards.getItemCount();

	var vaultRefTable = {};
	for (var i = 0; i < count; ++i) {
		//get specific item
		var item = resultsCards.getItemByIndex(i);

		// get cardimage
		var vaultref = item.getProperty("managerpicture");
		var fileUrl = "nomanager.png";
		if ((vaultref !== undefined) && (vaultRefTable[vaultref] == undefined)) {
			if (inn.getFileUrl(vaultref.split("?fileId=")[1], 1) == undefined) {
				vaultRefTable[vaultref] = fileUrl;
			} else {
				vaultRefTable[vaultref] = inn.getFileUrl(vaultref.split("?fileId=")[1], 1);
			}
		} else if (vaultref == undefined) {
			vaultRefTable[vaultref] = fileUrl;
		}



		var itemStatus = item.getProperty('status', '').trim();
		var cardContent = "<div class='card' cardId='" + item.getID() + "'> ";
		cardContent += "<div class='panel panel-default  ' color='" + item.getProperty('cardcolor', 'grey') + "'>";
		cardContent += " <div class='panel-heading cardHeader'>";
		cardContent += "<h3 class='panel-title cardTitle ' ><span class=' glyphicon glyphicon-th-large handler pull-left' ></span>";
		cardContent += "<span class='pull-left cardTitleText' contentEditable='true'>" + item.getProperty('cardtitle', 'no name') + "</span>";
		cardContent += "<span class=' glyphicon glyphicon-stop coral colorizer pull-right' color='coral' ></span>";
		cardContent += "<span class=' glyphicon glyphicon-stop yellow colorizer pull-right' color='yellow' ></span>";
		cardContent += "<span class=' glyphicon glyphicon-stop green colorizer pull-right' color='green' ></span>";
		cardContent += "<span class=' glyphicon glyphicon-stop grey colorizer pull-right' color='grey' ></span>";
		cardContent += "</h3></div>";
		cardContent += " <div class='panel-body cardContent '>" + item.getProperty('carddescription', 'no description') + "</div>";

		var dueDate = item.getProperty('duedate', 'x').split("T")[0];
		var today = "x";
		if (dueDate !== 'x') {
			dueDate = moment(dueDate).fromNow();
		} else {
			dueDate = 'date not set';
		}


		cardContent += " <div class='panel-footer '><div title='<h5>" + item.getPropertyAttribute("manager", "keyed_name") + "</h5><img class=\"managerPicture\" width=\"96px\" src=\"" + vaultRefTable[vaultref] + " \" />' data-placement='bottom' data-html='true' rel='tooltip' class='userInitiales'>" + nameInitiliser(item.getPropertyAttribute("manager", "keyed_name")) + "</div> <img src='" + vaultRefTable[vaultref] + "' alt='no manager' class='img-circle userInitiales' ><span class='pull-right' >Due " + dueDate + "</span></div>";
		cardContent += "</div>";
		cardContent += "</div>";

		if ($("div.stage[stageName='" + itemStatus + "']").length < 1) {
			$("div.stage:first").find(".stageBody").append(cardContent);
			updateCardStatus(item.getID(), $("div.stage:first").attr('stageName'));
		} else {
			$("div.stage[stageName='" + itemStatus + "']").find(".stageBody").append(cardContent);
		}
	}

	$("#cardFilter").html("");
	$(".panel-footer").tooltip({
		selector: "div[rel=tooltip]"
	});

	enableStageTitleChange();
	enableCardClassedDomChange(".cardTitleText", "cardId", '.card', "LAB_Cards", "cardtitle");
	enableCardsDragNDrop();
	enableCardOpening();
	enableStageSelection();
	enableColorizer();
	enableStagesDragNDrop();
	wallPaperList(selectedBoard);
	enableCardSelection();


	// showHidebased on Color
	$(".switchColorVisibility").each(function () {
		var color = $(this).find("span:eq(0)").attr("color");
		if ($(this).hasClass("active")) {
			// means then it will not have
			showHideColoredCards(true, color);
		} else {
			showHideColoredCards(false, color);
		}
	});

	$(".hideStageButton").click(function () {

		var that = $(this);
		if ($(this).closest(".stage").hasClass("hideStage")) {
			// show a hidden stage
			that.closest(".stage").find(".stageTitle").find(".handler").show();
			that.closest(".stage").find("span.cardCount").remove();
			that.closest(".stage").addClass("showStage");
			that.closest(".stage").next(".stage").removeClass("nextToRotated");
			that.closest(".panel").find(".panel-body").fadeIn();
			that.switchClass("glyphicon-eye-open", "glyphicon-eye-close");
			that.closest(".stage").removeClass("hideStage");
			that.closest(".stage").find(".stageTitle").attr("contentEditable", true);
		} else {
			if (that.closest(".stage").prev(".stage").hasClass("hideStage")) {
				that.closest(".stage").addClass("nextToRotated");
			} else {
				that.closest(".stage").removeClass("nextToRotated");
			}
			// hide a shown stage
			var cardCount = 0;
			cardCount = that.closest(".stage").find(".card").length;
			that.closest(".stage").find(".stageTitle").removeAttr("contentEditable");
			that.closest(".stage").find(".stageTitle").find(".handler").hide();
			that.closest(".stage").find(".stageTitle").append("<span class='cardCount' title='" + cardCount + " cards in this stage'>[ " + cardCount + " ]</span>");
			that.closest(".stage").addClass("hideStage");
			that.closest(".stage").removeClass("showStage");
			that.closest(".stage").next(".stage").addClass("nextToRotated");
			that.switchClass("glyphicon-eye-close", "glyphicon-eye-open");
			that.closest(".panel").find(".panel-body").fadeOut();
		}
	});
}






function enableCardSelection() {
	$(".card").click(function (event) {
		//console.log("test click on card");
		selectedCard = $(this).attr("cardid");
		$(".card.selected").removeClass("selected");
		$(this).addClass("selected");
		event.stopPropagation();
	});
	$('#board').click(function () {
		$(".card.selected").removeClass("selected");
	});
};

function enableColorizer() {
	$('.card').each(function () {
		var color = $(this).find(".panel").attr("color");
		$(this).find(".cardHeader").css('background-color', 'Light' + color);
	});

	$('.cardHeader').hover(
		function () {
			$(this).find(".colorizer").css("display", "block");
		},

		function () {
			$(this).find(".colorizer").css("display", "none");
		}
	);
	$(".colorizer").click(function () {
		var color = $(this).attr('color');
		var cardId = $(this).closest('.card').attr('cardId');
		var qryCard = top.aras.newIOMItem("LAB_Cards", 'edit');
		qryCard.setID(cardId);
		qryCard.setProperty("cardcolor", color);
		var results = qryCard.apply();
		var cardId = $(this).closest('.panel').attr('color', color);
		$(this).closest('.card').find(".cardHeader").css('background-color', 'Light' + color);
	});
}


function enableBoardDblClick() {
	$(".board").dblclick(function () {
		loadSingleBoard($(this).attr("boardId"), false);
		$("#boards").slideUp();
		$("#board").slideDown();
		$()
	});
}

function enableCardOpening() {
	$(".card").dblclick(function () {
		top.aras.uiShowItem("LAB_Cards", $(this).attr("cardId"));
	});
}

function enableStageSelection() {
	$(".stageHeader").click(function () {
		$(".stageHeader.selected").parent().removeClass("panel-info");
		$(".stageHeader.selected").removeClass("selected");
		$(this).addClass("selected");
		$(this).parent().addClass("panel-info");
		selectedStage = $(this).find(".stageTitle").text();
	});
}

function enableStagesDragNDrop() {
	$("#classified").sortable({
		handle: "span.handler",
		stop: function (event, ui) {
			updateStageArray(selectedBoard);
		}
	});
}

function nameInitiliser(keyedName) {
	if (keyedName == undefined) {
		return "";
	}
	var fullName = keyedName;
	var matches = fullName.match(/\b(\w)/g);
	return matches.join('');
}


function enableCardsDragNDrop() {

	$(".card").draggable({
		revert: "invalid",
		handle: "span.handler",
		connectToSortable: ".droppable",
		start: function () {
			$(this).addClass('grabbed');
		},
		stop: function () {
			$(this).removeClass('grabbed');
		}
	});


	$(".droppable:not(.activated)").droppable({
		greedy: true,
		revert: "invalid",
		accept: ".card",
		drop: function (event, ui) {
			//$(this).find(".placeholder").remove();
			//ui.draggable.appendTo(this);
			ui.draggable.attr('style', 'position:relative');
		}
	}).sortable({
		revert: false,
		handle: "span.handler",
		items: ".card:not(.placeholder)",
		stop: function (event, ui) {
			$(".stageBody").removeClass("ui-state-active");
			updateCardStatus(ui.item.attr("cardId"), $(this).closest(".panel").find(".stageTitle").text());
			updateCardSorting($(this).closest(".stage"), selectedBoard);
		}
	});

	$(".droppable").addClass("activated");
}

function updateCardSorting(stageDom, boardid) {
	var stageName = stageDom.attr('stagename');
	var value = 2;
	stageDom.find(".card").each(function () {
		var rel = top.aras.newIOMItem("LAB_BoardCards", 'edit');
		rel.setAttribute("where", "[LAB_BoardCards].source_id='" + boardid + "' AND [LAB_BoardCards].related_id='" + $(this).attr("cardId") + "'");
		rel.setProperty("sort_order", value);
		rel = rel.apply();
		value = value * 2;
	});
}

function updateCardStatus(cardId, cardStatus) {
	var qryBoard = top.aras.newIOMItem("LAB_Cards", 'edit');
	qryBoard.setID(cardId);
	qryBoard.setProperty("status", cardStatus.trim());
	var results = qryBoard.apply();
}


function wallPaperList() {
	var qryBoardImages = top.aras.newIOMItem("LAB_BoardImage", 'get');
	var results = qryBoardImages.apply();
	var count = results.getItemCount();
	$("#wallpaperSelect").html("");
	$("#wallpaperSelect").append("<option value='null'></option>");
	$("#wallpaperSelect").append("<option value='default'>default</option>");
	var wallpaperArray = {};
	for (var i = 0; i < count; ++i) {
		var fileId = results.getItemByIndex(i).getProperty("image").split("?fileId=")[1];
		var wpName = results.getItemByIndex(i).getProperty("name");
		$("#wallpaperSelect").append("<option value='" + fileId + "' >" + wpName + "</option>");
		wallpaperArray[fileId] = results.getItemByIndex(i).getID();

	}
	$("#wallpaperSelect").off("change");
	$("#wallpaperSelect").change(function () {
		if ($(this).val() !== "null") {

			if ($(this).val() === "default") {
				var fileUrl = "default.jpg";
				$("#boardBody").css("background-image", "url(" + fileUrl + ")");
				var qryBoard = top.aras.newIOMItem("LAB_Boards", 'edit');
				qryBoard.setID(selectedBoard);
				qryBoard.setProperty("wallpaper", "");
				qryBoard = qryBoard.apply();
			} else {
				var fileUrl = inn.getFileUrl($(this).val(), 1);
				$("#boardBody").css("background-image", "url(" + fileUrl + ")");
				var qryBoard = top.aras.newIOMItem("LAB_Boards", 'edit');
				var qryBoardImage = top.aras.newIOMItem("LAB_BoardImage", 'get');
				qryBoardImage.setID(wallpaperArray[$(this).val()]);
				qryBoard.setID(selectedBoard);
				qryBoard.setPropertyItem("wallpaper", qryBoardImage);
				qryBoard = qryBoard.apply();
			}

		}
	});

}
