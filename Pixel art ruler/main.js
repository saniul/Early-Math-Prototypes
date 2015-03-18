/*

Pixel Art Ruler
	built on Prototope@7093cfe20

Draw with blocks; the blocks' lengths count up and are displayed on screen.

Open questions:
	How should colors work?
	How should the numbers behave, especially when dragging vertically?
	What should happen if you overlap an existing drawing?
	Should there be any structure here? e.g. trace an existing drawing?

*/

var pixelGridSize = 64

var touchCatchingLayer = new Layer()
touchCatchingLayer.frame = Layer.root.bounds

makeGrid()

var activeTouchID = null
var touchedBlock = null
var labelLayer = null

touchCatchingLayer.touchBeganHandler = function(touchSequence) {
	if (activeTouchID === null) {
		activeTouchID = touchSequence.id
		var randomHue = Math.random()
		var activeColor = new Color({hue: randomHue, saturation: 0.4, brightness: 1.0})

		var blockGridOrigin = roundPoint(touchSequence.currentSample.globalLocation)
		var block = makeBlock(blockGridOrigin.x, blockGridOrigin.y) 
		block.backgroundColor = activeColor
		touchedBlock = block

		block.scale = 0.001
		block.animators.scale.target = new Point({x: 1, y: 1})
		block.animators.scale.springSpeed = 50
		block.animators.scale.springBounciness = 6

		block.animators.frame.springSpeed = 50
		block.animators.frame.springBounciness = 6

		labelLayer = new TextLayer()
		labelLayer.fontName = "Futura"
		labelLayer.fontSize = 50
		labelLayer.text = "1"
		labelLayer.textColor = new Color({hue: (randomHue + 0.5) % 1.0, saturation: 0.4, brightness: 0.2})
		labelLayer.x = block.x
		labelLayer.y = block.y - pixelGridSize
		labelLayer.animators.x.springSpeed = labelLayer.animators.y.springSpeed = 30
		labelLayer.animators.x.springBounciness = labelLayer.animators.y.springBounciness = 7
	}
}

touchCatchingLayer.touchMovedHandler = function(touchSequence) {
	if (activeTouchID === touchSequence.id) {
		var newBlockOrigin = roundPoint(touchSequence.currentSample.globalLocation)
		var firstBlockOrigin = roundPoint(touchSequence.firstSample.globalLocation)

		// labelLayer.animators.x.target = touchedBlock.x
		// labelLayer.animators.y.target = minY - pixelGridSize / 2.0

		var newX = Math.min(newBlockOrigin.x, firstBlockOrigin.x)
		var newY = Math.min(newBlockOrigin.y, firstBlockOrigin.y)

		touchedBlock.animators.frame.target = new Rect({
			x: newX,
			y: newY,
			width: Math.max(newBlockOrigin.x, firstBlockOrigin.x) - newX + pixelGridSize,
			height: Math.max(newBlockOrigin.y, firstBlockOrigin.y) - newY + pixelGridSize
		})
		// labelLayer.text = (Math.floor((maxX - minX) / pixelGridSize + 1)).toString()
	}
}

touchCatchingLayer.touchEndedHandler = touchCatchingLayer.touchCancelledHandler = function(touchSequence) {
	if (activeTouchID === touchSequence.id) {
		labelLayer.animators.x.target = touchedBlock.x
		labelLayer.animators.y.target = touchedBlock.y
		activeTouchID = null
		touchedBlock = null
		labelLayer = null
	}
}

function makeBlock(originX, originY) {
	var block = new Layer({parent: touchCatchingLayer})
	block.width = block.height = pixelGridSize
	block.originX = originX
	block.originY = originY
	return block
}

function roundPoint(point) {
	return new Point({x: Math.floor(point.x / pixelGridSize) * pixelGridSize, y: Math.floor(point.y / pixelGridSize) * pixelGridSize})
}

function makeGrid() {
	for (var row = 0; row < Layer.root.height / pixelGridSize; row++) {
		for (var column = 0; column < Layer.root.width / pixelGridSize; column++) {
			var gridBlock = new Layer()
			gridBlock.width = gridBlock.height = pixelGridSize
			gridBlock.originX = column * pixelGridSize
			gridBlock.originY = row * pixelGridSize
			gridBlock.border = new Border({color: Color.white, width: 1})
			gridBlock.alpha = 0.4
			gridBlock.userInteractionEnabled = false
		}
	}
}