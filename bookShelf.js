/**************************************
 *  INSTRUCTIONS
 *
 *  Left Click to select and drag Books.
 *  Release Books in Slots or Trash.
 *  Right Click to rate Books.
 **************************************/


/**************************************
 *  BUTTON
 *
 *  Inherited by Book
 *  Inherited by Slot
 *  Inherited by RatingButton
 **************************************/

var Button = function(centerX, centerY, width, height, defaultColor, fontSize, text) {
    this.centerX = centerX;
    this.centerY = centerY;
    this.width = width;
    this.height = height;
    this.x = centerX - this.width / 2;
    this.y = centerY - this.height / 2;
    this.boundingBoxPad = 0;
    this.fontSize = fontSize;
    this.text = text;
    this.defaultColor = defaultColor;
    this.color = this.defaultColor;
    this.hoverColorModValue = 50;
    this.activeColorModValue = -50;
    this.hovered = false;
    this.pressed = false;
};

Button.prototype.snapToCenterXY = function(centerX, centerY) {
    this.x = centerX - this.width / 2;
    this.y = centerY - this.height / 2;
};

Button.prototype.setColor = function(newButtonColor) {
    this.color = newButtonColor;
};

Button.prototype.resetColor = function() {
    this.setColor(this.defaultColor);
};

Button.prototype.getModifiedColor = function(colorModValue) {
    var baseColor = this.color;
    var baseR = red(baseColor);
    var baseG = green(baseColor);
    var baseB = blue(baseColor);
    var moddedR = baseR + colorModValue;
    var moddedG = baseG + colorModValue;
    var moddedB = baseB + colorModValue;
    return color(moddedR, moddedG, moddedB);
};

Button.prototype.isAtMouse = function() {
    var minX = this.x - this.boundingBoxPad;
    var maxX = this.x + this.width + this.boundingBoxPad;
    var minY = this.y - this.boundingBoxPad;
    var maxY = this.y + this.height + this.boundingBoxPad;
    var withinX = mouseX >= minX && mouseX <= maxX;
    var withinY = mouseY >= minY && mouseY <= maxY;
    if (withinX && withinY) {
        return true;
    } else {
        return false;
    }
};

Button.prototype.hover = function() {
    this.hovered = true;
};

Button.prototype.unHover = function() {
    this.hovered = false;
};

Button.prototype.press = function() {
    this.pressed = true;
};

Button.prototype.release = function() {
    this.pressed = false;
};

Button.prototype.draw = function() {
    var fillColor = this.getFillColor();
    var textColor = this.getTextColor();
    var fontSize = this.fontSize;
    var textBoxH = this.height - fontSize / 2;
    fill(fillColor);
    rect(this.x, this.y, this.width, this.height);
    fill(textColor);
    textSize(fontSize);
    textAlign(CENTER, CENTER);
    text(this.text, this.x, this.y, this.width, textBoxH);
};

Button.prototype.getFillColor = function() {
    var fillColor;
    var defaultColor = this.color;
    var hoverColor = this.getModifiedColor(this.hoverColorModValue);
    var activeColor = this.getModifiedColor(this.activeColorModValue);
    if (this.pressed) {
        fillColor = activeColor;
    } else if (this.hovered) {
        fillColor = hoverColor;
    } else {
        fillColor = defaultColor;
    }
    return fillColor;
};

Button.prototype.getTextColor = function() {
    var textColor;
    if (this.pressed) {
        textColor = color(255, 255, 255);
    } else {
        textColor = color(0, 0, 0);
    }
    return textColor;
};

/**************************************
 *  BOOK
 **************************************/

var Book = function(centerX, centerY, width, height, bookColor, title) {
    var fontSize = 15;
    Button.call(this, centerX, centerY, width, height, bookColor, fontSize, title);
    this.title = title;
    this.starRating = 0;
    this.boundingBoxPad = 2;
    this.slotContainer = null;
    this.activated = false;
    this.slotted = false;
    this.trashed = false;
};

Book.prototype = Object.create(Button.prototype);

Book.prototype.placeInSlot = function(slot) {
    var slotPos = slot.getCenterPos();
    this.slotContainer = slot;
    this.slotted = true;
    slot.fillWithBook(this);
    this.snapToCenterXY(slotPos.centerX, slotPos.centerY);
    this.setColor(slot.getBookColor());
};

Book.prototype.removeFromSlot = function() {
    if (this.slotted) {
        this.slotContainer.removeBook();
        this.slotContainer = null;
        this.slotted = false;
    }
};

Book.prototype.drag = function() {
    var deltaX = mouseX - pmouseX;
    var deltaY = mouseY - pmouseY;
    this.x += deltaX;
    this.y += deltaY;
};

Book.prototype.trash = function() {
    this.trashed = true;
};

Book.prototype.draw = function() {
    this.drawCover();
    this.drawText();
    this.drawStars();
};

Book.prototype.drawCover = function() {
    fill(this.getFillColor());
    rect(this.x, this.y, this.width, this.height);
};

Book.prototype.drawText = function() {
    var titleSize = this.fontSize;
    var textPad = this.width * 0.1;
    var textX = this.x + textPad;
    var textY = this.y;
    var textWidth = this.width - textPad * 2;
    var textHeight = this.height * 0.8;
    fill(this.getTextColor());
    textSize(titleSize);
    textAlign(CENTER, CENTER);
    text(this.title, textX, textY, textWidth, textHeight);
};

Book.prototype.drawStars = function() {
    var img = getImage("cute/Star");
    var sizeFactor = 0.17;
    var imgWidth = img.width * sizeFactor;
    var imgHeight = img.height * sizeFactor;
    var imgX = this.x;
    var imgY = this.y + this.height - imgHeight;
    var imgPeriod = imgWidth * 0.86;
    var i;
    var numStars = this.starRating;
    for (i = 0; i < numStars; i++) {
        image(img,imgX + imgPeriod * i, imgY, imgWidth, imgHeight);
    }
};

Book.prototype.setRating = function(numStars) {
    this.starRating = numStars;
};

/**************************************
 *  SLOT
 *
 * Inherited by TrashSlot
 **************************************/

var Slot = function(centerX, centerY, width, height, slotColor, slottedBookColor, text) {
    var fontSize = 16;
    Button.call(this, centerX, centerY, width, height, slotColor, fontSize, text);
    this.slottedBookColor = slottedBookColor;
    this.boundingBoxPad = 15;
    this.activated = false;
    this.hasSlottedBook = false;
    this.slottedBook = null;
};

Slot.prototype = Object.create(Button.prototype);

Slot.prototype.getCenterPos = function() {
    var posObject = {
        centerX: this.centerX,
        centerY: this.centerY
    };
    return posObject;
};

Slot.prototype.getBookColor = function() {
    return this.slottedBookColor;
};

Slot.prototype.fillWithBook = function(book) {
    this.hasSlottedBook = true;
    this.slottedBook = book;
    this.press();
};

Slot.prototype.removeBook = function() {
    this.hasSlottedBook = false;
    this.slottedBook = null;
    this.release();
};

/**************************************
 *  TRASHSLOT
 **************************************/

var TrashSlot = function(centerX, centerY, width, height, slotColor, slottedBookColor, text) {
    var fontSize = 16;
    Slot.call(this, centerX, centerY, width, height, slotColor, fontSize, text);
    this.slottedBookColor = slottedBookColor;
};

TrashSlot.prototype = Object.create(Slot.prototype);

TrashSlot.prototype.fillWithBook = function(book) {
    book.removeFromSlot();
    book.trash();
};

/**************************************
 *  OBJLIBRARY
 *
 *  Inherited by BookLibrary
 *  Inherited by SlotLibrary
 *  Inherited by ContextMenu
 **************************************/

var ObjLibrary = function(objWidth, objHeight, objColor) {
    this.objArray = [];
    this.objColor = objColor;
    this.objWidth = objWidth;
    this.objHeight = objHeight;
    this.activeObj = null;
    this.hasActiveObj = false;
};

ObjLibrary.prototype.addObj = function() {
	println("add new object");
};

ObjLibrary.prototype.isAnyObjAtMouse = function() {
    return this.objArray.some(function (i) {
            return i.isAtMouse();
    });
};

ObjLibrary.prototype.isAnyObjActive = function() {
    return this.hasActiveObj;
};

ObjLibrary.prototype.setActiveObj = function() {
    var frontHoverObj = null;
    this.objArray.forEach(function (i) {
        if (i.isAtMouse()) {
            frontHoverObj = i;
        }
    });
    if (frontHoverObj !== null) {
        this.activateObj(frontHoverObj);
    }
};

ObjLibrary.prototype.activateObj = function(obj) {
    obj.activated = true;
    this.activeObj = obj;
    this.hasActiveObj = true;
};

ObjLibrary.prototype.getActiveObj = function() {
    return this.activeObj;
};

ObjLibrary.prototype.hoverActiveObj = function() {
    this.resetAllObj();
    this.setActiveObj();
    this.objArray.forEach(function (i) {
        if (i.activated) {
            i.hover();
        } else {
            i.unHover();
        }
    });
};

ObjLibrary.prototype.pressActiveObj = function() {
    this.objArray.forEach(function (i) {
        if (i.activated) {
            i.press();
        } else {
            i.release();
        }
    });
};

ObjLibrary.prototype.bringToFrontActiveObj = function() {
    var activeObj = this.activeObj;
    var indexOfActiveObj = this.objArray.indexOf(activeObj);
    if (this.hasActiveObj) {
        this.objArray.splice(indexOfActiveObj, 1);
        this.objArray.push(activeObj);
    }
};

ObjLibrary.prototype.dragActiveObj = function() {
    this.objArray.forEach(function (i) {
        if (i.activated) {
            i.drag();
        }
    });
};

ObjLibrary.prototype.resetAllObj = function() {
    this.releaseAllObj();
    this.unHoverAllObj();
    this.deactivateAllObj();
};

ObjLibrary.prototype.releaseAllObj = function() {
    this.objArray.forEach(function (i) {
        i.release();
    });
};

ObjLibrary.prototype.unHoverAllObj = function() {
    this.objArray.forEach(function (i) {
        i.unHover();
    });
};

ObjLibrary.prototype.deactivateAllObj = function() {
    this.objArray.forEach(function (i) {
        i.activated = false;
    });
    this.activeObj = null;
    this.hasActiveObj = false;
};

ObjLibrary.prototype.drawAllObj = function() {
    this.filterOutTrashedObjs();
    this.objArray.forEach(function (i) {
        i.draw();
    });
};

ObjLibrary.prototype.filterOutTrashedObjs = function() {
    this.objArray = this.objArray.filter(function (i) {
        return !i.trashed;
    });
};

/**************************************
 *  BOOKLIBRARY
 **************************************/

var BookLibrary = function(bookWidth, bookHeight) {
    var objColor = color(173, 126, 90);
    ObjLibrary.call(this, bookWidth, bookHeight, objColor);
};

BookLibrary.prototype = Object.create(ObjLibrary.prototype);

BookLibrary.prototype.addObj = function(centerX, centerY, title) {
    this.objArray.push(new Book(centerX, centerY, this.objWidth, this.objHeight, this.objColor, title));
};

BookLibrary.prototype.addBookToLibrary = function(title) {
    var x = 65;
    var y = 75;
    var xRange = 15;
    var yRange = 15;
    var randX = random(x - xRange, x + xRange);
    var randY = random(y - yRange, y + yRange);
    this.addObj(randX, randY, title);
};

BookLibrary.prototype.selectActiveBook = function() {
    this.resetAllObj();
    this.setActiveObj();
    this.pressActiveObj();
    this.bringToFrontActiveObj();
};

BookLibrary.prototype.slotActiveObj = function(slot) {
    this.objArray.forEach(function (i) {
        if (i.activated) {
            i.placeInSlot(slot);
        }
    });
};

BookLibrary.prototype.unSlotActiveObj = function() {
    this.objArray.forEach(function (i) {
        if (i.activated) {
            i.removeFromSlot();
            i.resetColor();
        }
    });
};

/**************************************
 *  SLOTLIBRARY
 **************************************/

var SlotLibrary = function(slotWidth, slotHeight, trashWidth, trashHeight) {
    this.trashWidth = trashWidth;
    this.trashHeight = trashHeight;
    ObjLibrary.call(this, slotWidth, slotHeight);
};

SlotLibrary.prototype = Object.create(ObjLibrary.prototype);

SlotLibrary.prototype.addObj = function(centerX, centerY, slotColor, slottedBookColor, text) {
    this.objArray.push(new Slot(centerX, centerY, this.objWidth, this.objHeight, slotColor, slottedBookColor, text));
};

SlotLibrary.prototype.addStorageSlot = function(centerX, centerY, slotColor, slottedBookColor, text) {
    this.addObj(centerX, centerY, slotColor, slottedBookColor, text);
};

SlotLibrary.prototype.addTrashSlot = function(centerX, centerY, slotColor, text) {
    this.objArray.push(new TrashSlot(centerX, centerY, this.trashWidth, this.trashHeight, slotColor, slotColor, text));
};

SlotLibrary.prototype.isActiveSlotEmpty = function() {
    return (this.hasActiveObj && !this.activeObj.hasSlottedBook);
};

/**************************************
 *  RATINGBUTTON
 **************************************/

var RatingButton = function(centerX, centerY, width, height, buttonColor, fontSize, text, ratingNum) {
    Button.call(this, centerX, centerY, width, height, buttonColor, fontSize, text);
    this.ratingNum = ratingNum;
    this.activated = false;
};

RatingButton.prototype = Object.create(Button.prototype);

RatingButton.prototype.getStarRating = function() {
    return this.ratingNum;
};

/**************************************
 *  CONTEXTMENU
 **************************************/

var RatingContextMenu = function(buttonWidth, buttonHeight) {
    var objColor = color(255, 175, 0);
    var hiddenX = -200;
    var hiddenY = 0;
    var maxStars = 5;
    ObjLibrary.call(this, buttonWidth, buttonHeight, objColor);
    this.x = hiddenX;
    this.y = hiddenY;
    this.fontSize = 13;
    this.menuWidth = buttonWidth;
    this.menuHeight = buttonHeight * maxStars;
    this.attachedBook = null;
    this.addRatingButtons = (function(self) {
        var i;
        var max = 5;
        var text;
        var starRating;
        for (i = 0; i < max; i++) {
            starRating = max - i;
            text = starRating + " Star";
            self.addObj(self.x, self.y, text, starRating);
        }
    }(this));
};

RatingContextMenu.prototype = Object.create(ObjLibrary.prototype);

RatingContextMenu.prototype.addObj = function(centerX, centerY, text, starRating) {
    this.objArray.push(new RatingButton(centerX, centerY, this.objWidth, this.objHeight, this.objColor,
                                  this.fontSize, text, starRating));
};

RatingContextMenu.prototype.attachToBook = function(book) {
    this.forceOntoCanvas();
    this.attachedBook = book;
    this.attachedBook.unHover();
};

RatingContextMenu.prototype.forceOntoCanvas = function() {
    var menuX = mouseX;
    var menuY = mouseY;
    var canvasMaxX = width;
    var canvasMaxY = height;
    var menuMaxX = canvasMaxX - this.menuWidth * 0.66;
    var menuMaxY = canvasMaxY - this.menuHeight;
    this.x = min(menuX, menuMaxX);
    this.y = min(menuY, menuMaxY);
    this.updateButtonPos();
};

RatingContextMenu.prototype.isMenuDisplayed = function() {
    return this.attachedBook;
};

RatingContextMenu.prototype.detachFromBook = function() {
    this.attachedBook = null;
    this.resetAllObj();
    this.hideOffScreen();
};

RatingContextMenu.prototype.hideOffScreen = function() {
    this.x = this.hiddenX;
    this.y = this.hiddenY;
    this.updateButtonPos();
};

RatingContextMenu.prototype.updateButtonPos = function() {
    var i;
    var max = this.objArray.length;
    var x = this.x;
    var y;
    var startingY = this.y;
    var yPosMod = this.objHeight;
    for (i = 0; i < max; i++) {
        y = startingY + i * yPosMod;
        this.objArray[i].snapToCenterXY(x, y);
    }
};

RatingContextMenu.prototype.selectRatingButton = function() {
    this.resetAllObj();
    this.setActiveObj();
    this.pressActiveObj();
};

RatingContextMenu.prototype.rateAttachedBook = function() {
    var rating = this.activeObj.getStarRating();
    this.attachedBook.setRating(rating);
    this.detachFromBook();
};

RatingContextMenu.prototype.drawAllObj = function() {
    this.objArray.forEach(function (i) {
        i.draw();
    });
};

/**************************************
 *  MAIN
 **************************************/

var myBooks = new BookLibrary(75, 100);
var mySlots = new SlotLibrary(75, 100, 60, 60);
var myRatingPanel = new RatingContextMenu(65, 29);

//setup
(function() {
    var populateBooks = (function() {
        var titleArray = [  "The Magicians",
                            "American Gods",
                            "Anathem",
                            "Gravity's Rainbow",
                            "The Hyperion Cantos",
                            "A Brief History of Time",
                            "Gardens of the Moon",
                            "The Baroque Cycle",
                            "The Mars Trilogy",
                            "The Goldfinch",
                            "The Name of the Wind",
                            "Godel Escher Bach"
                        ];
        titleArray = sort(titleArray, titleArray.length);
        titleArray = reverse(titleArray);
        titleArray.forEach(function (i) {
            myBooks.addBookToLibrary(i);
        });
    }());
    
    var addShelf = function(x, y, slots, slotColor, slottedBookColor, name) {
        var i;
        var xPos;
        var spacing = 90;
        for (i = 0; i < slots; i++) {
            xPos = x + i * spacing;
            mySlots.addStorageSlot(xPos, y, slotColor, slottedBookColor, name);
        }
    };
    
    var populateShelves = (function() {
        addShelf(165, 75, 3, color(191, 191, 191), color(0, 225, 150), "Favorite");
        addShelf(165, 205, 3, color(171, 171, 171), color(0, 225, 225), "Have Read");
        addShelf(165, 335, 3, color(151, 151, 151), color(255, 150, 255), "Want to Read");
        mySlots.addTrashSlot(45, 355, color(220, 0, 0), "Trash");
    }());
}());


var mouseMoved = function() {
    var ratingButtonHovered = myRatingPanel.isAnyObjAtMouse();
    var bookHovered = myBooks.isAnyObjAtMouse();
    if (!ratingButtonHovered) {     //keep working to simplify logic
        myRatingPanel.resetAllObj();
    }
    if (!bookHovered) {
        myBooks.resetAllObj();
    }
    if (bookHovered && !ratingButtonHovered) {
        myBooks.hoverActiveObj();
    }
    else if (ratingButtonHovered) {
        myRatingPanel.hoverActiveObj();
        myBooks.resetAllObj();
    }
};

var mousePressed = function() {
    var ratingButtonPressed = myRatingPanel.isAnyObjAtMouse();
    var bookPressed = myBooks.isAnyObjAtMouse();
    var leftButtonPressed = mouseButton === LEFT;
    var rightButtonPressed = mouseButton === RIGHT;
    if (leftButtonPressed && !ratingButtonPressed) {
        myRatingPanel.detachFromBook();
        myBooks.selectActiveBook();
        myBooks.unSlotActiveObj();
        mySlots.hoverActiveObj();
    }
    else if (leftButtonPressed && ratingButtonPressed) {
        myRatingPanel.selectRatingButton();
    }
    else if (rightButtonPressed && bookPressed) {
        myBooks.selectActiveBook();
        myRatingPanel.attachToBook(myBooks.getActiveObj());
        myBooks.resetAllObj();
        myRatingPanel.hoverActiveObj();
    }
    else {
        myRatingPanel.detachFromBook();
    }
};

var mouseDragged = function() {
    var anyBookActivated = myBooks.isAnyObjActive();
    var ratingMenuDisplayed = myRatingPanel.isMenuDisplayed();
    var leftButtonDragged = mouseButton === LEFT;
    if (leftButtonDragged && ratingMenuDisplayed) {
        myRatingPanel.selectRatingButton();
    }
    else if (leftButtonDragged && anyBookActivated) {
        myBooks.dragActiveObj();
        mySlots.hoverActiveObj();
    }
};

var mouseReleased = function() {
    var ratingButtonReleased = myRatingPanel.isAnyObjAtMouse();
    var bookReleased = myBooks.isAnyObjAtMouse();
    var anySlotFound = mySlots.isAnyObjAtMouse();
    var activeSlotEmpty = mySlots.isActiveSlotEmpty();
    var leftButtonReleased = mouseButton === LEFT;
    if (leftButtonReleased && ratingButtonReleased) {
        myRatingPanel.rateAttachedBook();
    }
    if (leftButtonReleased && bookReleased) {
        myBooks.hoverActiveObj();
    }
    if (leftButtonReleased && bookReleased && anySlotFound && activeSlotEmpty && !ratingButtonReleased) {
        myBooks.slotActiveObj(mySlots.getActiveObj());
        mySlots.resetAllObj();
    }
};

var draw = function() {
    background(255, 255, 255);
    mySlots.drawAllObj();
    myBooks.drawAllObj();
    myRatingPanel.drawAllObj();
};
