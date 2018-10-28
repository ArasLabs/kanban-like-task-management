var selectedBoard = "";
var selectedStage = "";
var selectedCard = "";
var boardStages = "";
var inn = top.aras.newIOMInnovator();
var jQBody = jQuery("body");
$(document).ready(function() {
    loadBoards();
    jQBody.find("#addBoard").click(function() {
            var qryBoards = top.aras.newIOMItem('LAB_Boards', 'add');
            var results = qryBoards.apply();
            var count = results.getItemCount();
            loadBoards();
        }).end()
        /*
         * refresh single board
         */
        .find("#refreshBoard").click(function() {
            loadSingleBoard(selectedBoard, true);
        }).end()
        /*
         * Refresh all boards
         */
        .find("#refreshBoards").click(function() {
            loadBoards();
        }).end()
        /*
         * Add card
         */
        .find("#addCard").click(function() {
            var qryBoard = top.aras.newIOMItem('LAB_Boards', 'edit');
            qryBoard.setID(selectedBoard);
            var qryBoardCards = top.aras.newIOMItem('LAB_BoardCards', 'add');
            var qryCard = top.aras.newIOMItem('LAB_Cards', 'add');
            qryBoardCards.setRelatedItem(qryCard);
            qryBoard.addRelationship(qryBoardCards);
            var results = qryBoard.apply();
            var count = results.getItemCount();
            loadSingleBoard(selectedBoard, true);
        }).end().find("#backToBoards").click(function() {
            loadBoards();
            $("#board").slideUp();
            $("#boards").slideDown();
            selectedBoard = "";
            boardStages = "";
        }).end().find("#changeWallpaper").click(function() {
            jQBody.find("#changeWallpaper").slideUp({
                complete: function() {
                    jQBody.find("#wallpaperDiv").slideDown();
                }
            });
        }).end().find("#cancelChangeWallpaper").click(function() {
            jQBody.find("#wallpaperDiv").slideUp({
                complete: function() {
                    jQBody.find("#changeWallpaper").slideDown();
                }
            });
        }).end().find("#cardFilter").keyup(function() {
            jQBody.find(".card").each(function() {
                var testTitle = jQBody.find(this).find(".cardTitleText").text().toLowerCase().indexOf(jQBody.find("#cardFilter").val().toLowerCase()) < 0;
                var testContent = jQBody.find(this).find(".cardContent").text().toLowerCase().indexOf(jQBody.find("#cardFilter").val().toLowerCase()) < 0;
                if (testTitle && testContent) {
                    jQBody.find(this).fadeOut();
                } else {
                    jQBody.find(this).fadeIn();
                }
            });
        }).end().find("#boardFilter").keyup(function() {
            jQBody.find(".board").each(function() {
                var testTitle = jQBody.find(this).find(".boardTitle").text().toLowerCase().indexOf(jQBody.find("#boardFilter").val().toLowerCase()) < 0;
                var testContent = jQBody.find(this).find(".boardDescription").text().toLowerCase().indexOf(jQBody.find("#boardFilter").val().toLowerCase()) < 0;
                //console.log("board checked");
                if (testTitle && testContent) {
                    jQBody.find(this).fadeOut();
                } else {
                    jQBody.find(this).fadeIn();
                }
            });
        }).end().find("#removeCard").click(function(event) {
            var confirmDeletiong = confirm("confirm deletion of the selected card?", "false");
            if (confirmDeletiong) {
                var qryCards = top.aras.newIOMItem('LAB_Cards', 'delete');
                qryCards.setID(selectedCard);
                qryCards = qryCards.apply();
                if (qryCards.isError()) {
                    alert("error on deletion, please contact admin");
                } else {
                    jQBody.find(".card.selected").remove();
                }
            }
            event.stopPropagation();
        }).end().find('#myStateButton').on('click', function() {
            jQBody.find(this).button('complete') // button text will be "finished!"
        }).end().find("#addStage").click(function() {
            addStageToBoard(selectedBoard, boardStages + ";new stage");
            loadSingleBoard(selectedBoard, true);
        }).end().find("#removeStage").click(function() {
            if (selectedStage !== "") {
                removeStageToBoard(selectedBoard, boardStages, selectedStage);
                loadSingleBoard(selectedBoard, true);
            }
        }).end().find("#removeBoard").click(function() {
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
        }).end().find(".switchColorVisibility").click(function() {
            // retrieve color to handle
            var color = jQBody.find(this).find("span:eq(0)").attr("color");
            if (jQBody.find(this).hasClass("active")) {
                // means then it will not have
                showHideColoredCards(false, color);
            } else {
                showHideColoredCards(true, color);
            }
        });
});
// if show = false ==> hide
function showHideColoredCards(show, color) {
    if (show) {
        jQBody(".panel[color='" + color + "']").closest(".card").fadeIn();
    } else {
        jQBody(".panel[color='" + color + "']").closest(".card").fadeOut();
    }
}

function checkIfStageLabelExists(label, creation) {
    var qtyWithLabel = 0;
    jQBody.find(".stageTitle").each(function() {
        if (jQBody.find(this).text().trim() === label.trim()) {
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
    jQBody.find("#boardFilter").html("").end().find("#removeBoard,#configBoard").addClass("disabled");
    // fill itemtype llist
    var qryBoards = top.aras.newIOMItem('LAB_Boards', 'get');
    qryBoards.setAttribute("orderBy", "boardname");
    var results = qryBoards.apply();
    var count = results.getItemCount();
    jQBody.find("#boardsContent").html("");
    var vaultRefTable = {};
    var boardsContentString = "";
    for (var i = 0; i < count; ++i) {
        var item = results.getItemByIndex(i);
        // get boardimage
        var vaultref = item.getProperty("creatorpicture", "undefined");
        var fileUrl = "nomanager.png";
        /*if ((vaultref !== "undefined") && (vaultRefTable[vaultref] == undefined)) {
        	fileUrl = inn.getFileUrl(vaultref.split("?fileId=")[1], 1);
        	vaultRefTable[vaultref] = fileUrl;
        }*/
        boardsContentString += "<div class='col-md-3 board' boardId='" + item.getID() + "'><div class='panel panel-default'> <div class='panel-heading boardHeader'>    <h3 class='panel-title boardTitle' contentEditable='true'>" + item.getProperty('boardname', 'no name') + "</h3>  </div>  <div class='panel-body boardDescription' contentEditable='true'>" + item.getProperty('boarddescription', 'no description') + " </div>";
        boardsContentString += " <div class='panel-footer '><div title='<h5>" + item.getPropertyAttribute("created_by_id", "keyed_name") + "</h5><img class=\"managerPicture\" width=\"96px\" src=\"" + vaultRefTable[vaultref] + " \" />' data-placement='top' data-html='true' rel='tooltip' class='userInitiales'>" + nameInitiliser(item.getPropertyAttribute("created_by_id", "keyed_name")) + "</div> <img src='" + vaultRefTable[vaultref] + "' alt='no manager' class='img-circle userInitiales' ></div>";
        boardsContentString += "</div> </div>";
    }
    jQBody.find("#boardsContent").append(boardsContentString);
    enableBoardDblClick();
    enableBoardClassedDomChange(".boardTitle", "boardId", '.board', "LAB_Boards", "boardname");
    enableBoardClassedDomChange(".boardDescription", "boardId", '.board', "LAB_Boards", "boarddescription");
    enableBoardSelection();
    jQBody.find("#boardBody").css("background-image", "url(default.jpg)");
    jQBody.find(".panel-footer").tooltip({
        selector: "div[rel=tooltip]"
    });
    jQBody.find("#configBoard").click(function() {
        top.aras.uiShowItem("LAB_Boards", selectedBoard);
    });
}

function enableBoardClassedDomChange(domClass, domIdAttribute, parentClassIdentificer, ItemTypeName, Property) {
    jQBody.find(domClass).on('focus', function() {
        var $this = jQBody.find(this);
        $this.data('before', $this.html());
        return $this;
    }).on('blur', function() {
        var $this = jQBody.find(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    }).change(function() {
        var boardId = jQBody.find(this).closest(parentClassIdentificer).attr(domIdAttribute);
        var qryBoard = top.aras.newIOMItem(ItemTypeName, 'edit');
        qryBoard.setID(boardId);
        qryBoard.setProperty(Property, $(this).text().trim());
        var results = qryBoard.apply();
    });
}

function enableCardClassedDomChange(domClass, domIdAttribute, parentClassIdentificer, ItemTypeName, Property) {
    jQBody.find(domClass).keydown(function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            jQBody.find(this).blur();
            return;
        }
    });
    jQBody.find(domClass).on('focus', function() {
        var $this = jQBody.find(this);
        $this.data('before', $this.html());
        return $this;
    }).on('blur', function() {
        var $this = $(this);
        if ($this.data('before') !== $this.html()) {
            $this.data('before', $this.html());
            $this.trigger('change');
        }
        return $this;
    }).change(function() {
        var carddId = jQBody.find(this).closest(parentClassIdentificer).attr(domIdAttribute);
        var qryBoard = top.aras.newIOMItem(ItemTypeName, 'edit');
        qryBoard.setID(carddId);
        qryBoard.setProperty(Property, $(this).text());
        var results = qryBoard.apply();
    });
}

function enableStageTitleChange() {
    jQBody.find(".stageTitle").keydown(function(e) {
        if (e.keyCode == 13) {
            e.preventDefault();
            jQBody.find(this).blur();
            return;
        }
    });
    jQBody.find(".stageTitle").on('focus', function() {
        var $this = jQBody.find(this);
        $this.data('before', $this.html());
        return $this;
    }).on('blur', function() {
        var $this = jQBody.find(this);
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
    }).change(function() {
        // update the elements in changed stage
        // update the stage array
        updateStageArray(selectedBoard);
    });
}

function updateStageArray(selectedBoard) {
    var stagesArray = [];
    jQBody.find(".stageTitle").each(function() {
        var stageTitleText = $(this).clone() //clone the element
            .children() //select all the children
            .remove() //remove all the children
            .end() //again go back to selected element
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
    jQBody.find(".boardHeader").click(function() {
        jQBody.find(".boardHeader.selected").parent().removeClass("panel-info").end().find(".boardHeader.selected").removeClass("selected").end().find(this).addClass("selected").end().find(this).parent().addClass("panel-info");
        selectedBoard = jQBody.find(this).closest(".board").attr("boardId");
        jQBody.find("#removeBoard,#configBoard").removeClass("disabled");
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
    jQBody.find("#unclassifiedContent").html("");
    // use Board Config
    selectedBoard = boardId;
    //set wallpaper
    if (!(reload)) {
        if (results.getPropertyItem("wallpaper") !== null) {
            var vaultref = results.getProperty("wallpaperurl");
            var fileUrl = inn.getFileUrl(vaultref.split("?fileId=")[1], 1);
            if (jQBody.find("#boardBody").css("background-image") !== "url(" + fileUrl + ")") {
                jQBody.find("#boardBody").css("background-image", "url(" + fileUrl + ")");
            }
        } else {
            jQBody.find("#boardBody").css("background-image", "url(default.jpg)");
        }
    }
    var stages = [];
    boardStages = results.getProperty("statuses", "");
    var boardTitle = results.getProperty("boardname", "");
    jQBody.find("p.boardName").html(boardTitle);
    stages = boardStages.split(";");
    jQBody.find("#classified").html("");
    for (var stage = 0; stage < stages.length; stage++) {
        if (stages[stage] == "") {
            stages[stage] = "new stage";
        }
        jQBody.find("#classified").append("<div class='stage pull-left' stageName='" + stages[stage].trim() + "'><div class='panel panel-default'> <div class='panel-heading stageHeader '><h3 class='panel-title stageTitle pull-left' contentEditable='true'>" + stages[stage] + "</h3><span class=' glyphicon glyphicon-th-large handler pull-right' ></span><span class=' glyphicon glyphicon-eye-close hideStageButton pull-right' ></span>  </div>  <div class='panel-body stageBody droppable'> </div></div></div>");
    }
    jQBody.find("#boardContent").width((stages.length + 1) * 320);
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
        if (jQBody.find("div.stage[stageName='" + itemStatus + "']").length < 1) {
            /*
             * Don't use jquery(":first")
             * Because :first is a jQuery extension and not part of the CSS specification, queries using :first cannot take advantage of the performance boost provided by the native DOM querySelectorAll() method. To achieve the best performance when using :first to select elements, first select the elements using a pure CSS selector, then use .filter(":first")
             * @info https://api.jquery.com/first-selector/
             */
            jQBody.find("div.stage").filter(":first").find(".stageBody").append(cardContent);
            updateCardStatus(item.getID(), jQBody.find("div.stage:first").attr('stageName'));
        } else {
            jQBody.find("div.stage[stageName='" + itemStatus + "']").find(".stageBody").append(cardContent);
        }
    }
    jQBody.find("#cardFilter").html("");
    jQBody.find(".panel-footer").tooltip({
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
    jQBody.find(".switchColorVisibility").each(function() {
        var color = jQBody.find(this).find("span:eq(0)").attr("color");
        if (jQBody.find(this).hasClass("active")) {
            // means then it will not have
            showHideColoredCards(true, color);
        } else {
            showHideColoredCards(false, color);
        }
    });
    jQBody.find(".hideStageButton").click(function() {
        var that = jQBody.find(this);
        if (jQBody.find(this).closest(".stage").hasClass("hideStage")) {
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
    jQBody.find(".card").click(function(event) {
        //console.log("test click on card");
        selectedCard = jQBody.find(this).attr("cardid");
        jQBody.find(".card.selected").removeClass("selected");
        jQBody.find(this).addClass("selected");
        event.stopPropagation();
    });
    jQBody.find('#board').click(function() {
        jQBody.find(".card.selected").removeClass("selected");
    });
};

function enableColorizer() {
    jQBody.find('.card').each(function() {
        var color = jQBody.find(this).find(".panel").attr("color");
        jQBody.find(this).find(".cardHeader").css('background-color', 'Light' + color);
    });
    jQBody.find('.cardHeader').hover(function() {
        jQBody.find(this).find(".colorizer").css("display", "block");
    }, function() {
        jQBody.find(this).find(".colorizer").css("display", "none");
    });
    jQBody.find(".colorizer").click(function() {
        var color = jQBody.find(this).attr('color');
        var cardId = jQBody.find(this).closest('.card').attr('cardId');
        var qryCard = top.aras.newIOMItem("LAB_Cards", 'edit');
        qryCard.setID(cardId);
        qryCard.setProperty("cardcolor", color);
        var results = qryCard.apply();
        var cardId = jQBody.find(this).closest('.panel').attr('color', color);
        jQBody.find(this).closest('.card').find(".cardHeader").css('background-color', 'Light' + color);
    });
}

function enableBoardDblClick() {
    jQBody.find(".board").dblclick(function() {
        loadSingleBoard(jQBody.find(this).attr("boardId"), false);
        jQBody.find("#boards").slideUp().end().find("#board").slideDown();
        // $() wtf ?
    });
}

function enableCardOpening() {
    jQBody.find(".card").dblclick(function() {
        top.aras.uiShowItem("LAB_Cards", jQBody.find(this).attr("cardId"));
    });
}

function enableStageSelection() {
    jQBody.find(".stageHeader").click(function() {
        jQBody.find(".stageHeader.selected").parent().removeClass("panel-info").end().find(".stageHeader.selected").removeClass("selected").end().find(this).addClass("selected").end().find(this).parent().addClass("panel-info").end();
        selectedStage = jQBody.find(this).find(".stageTitle").text();
    });
}

function enableStagesDragNDrop() {
    jQBody.find("#classified").sortable({
        handle: "span.handler",
        stop: function(event, ui) {
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
    jQBody.find(".card").draggable({
        revert: "invalid",
        handle: "span.handler",
        connectToSortable: ".droppable",
        start: function() {
            jQBody.find(this).addClass('grabbed');
        },
        stop: function() {
            jQBody.find(this).removeClass('grabbed');
        }
    });
    jQBody.find(".droppable:not(.activated)").droppable({
        greedy: true,
        revert: "invalid",
        accept: ".card",
        drop: function(event, ui) {
            //$(this).find(".placeholder").remove();
            //ui.draggable.appendTo(this);
            ui.draggable.attr('style', 'position:relative');
        }
    }).sortable({
        revert: false,
        handle: "span.handler",
        items: ".card:not(.placeholder)",
        stop: function(event, ui) {
            jQBody.find(".stageBody").removeClass("ui-state-active");
            updateCardStatus(ui.item.attr("cardId"), jQBody.find(this).closest(".panel").find(".stageTitle").text());
            updateCardSorting(jQBody.find(this).closest(".stage"), selectedBoard);
        }
    });
    jQBody.find(".droppable").addClass("activated");
}

function updateCardSorting(stageDom, boardid) {
    var stageName = stageDom.attr('stagename');
    var value = 2;
    stageDom.find(".card").each(function() {
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
    jQBody.find("#wallpaperSelect").html("").end().find("#wallpaperSelect").append("<option value='null'></option>").end().find("#wallpaperSelect").append("<option value='default'>default</option>");
    var wallpaperArray = {};
    for (var i = 0; i < count; ++i) {
        var fileId = results.getItemByIndex(i).getProperty("image").split("?fileId=")[1];
        var wpName = results.getItemByIndex(i).getProperty("name");
        jQBody.find("#wallpaperSelect").append("<option value='" + fileId + "' >" + wpName + "</option>");
        wallpaperArray[fileId] = results.getItemByIndex(i).getID();
    }
    jQBody.find("#wallpaperSelect").off("change").on('change', function() {
        if (jQBody.find(this).val() !== "null") {
            if (jQBody.find(this).val() === "default") {
                var fileUrl = "default.jpg";
                jQBody.find("#boardBody").css("background-image", "url(" + fileUrl + ")");
                var qryBoard = top.aras.newIOMItem("LAB_Boards", 'edit');
                qryBoard.setID(selectedBoard);
                qryBoard.setProperty("wallpaper", "");
                qryBoard = qryBoard.apply();
            } else {
                var fileUrl = inn.getFileUrl($(this).val(), 1);
                jQBody.find("#boardBody").css("background-image", "url(" + fileUrl + ")");
                var qryBoard = top.aras.newIOMItem("LAB_Boards", 'edit');
                var qryBoardImage = top.aras.newIOMItem("LAB_BoardImage", 'get');
                qryBoardImage.setID(wallpaperArray[$(this).val()]);
                qryBoard.setID(selectedBoard);
                qryBoard.setPropertyItem("wallpaper", qryBoardImage);
                qryBoard = qryBoard.apply();
            }
        }
    })
}
