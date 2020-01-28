mgraphics.init();
mgraphics.relative_coords = 0;
mgraphics.autofill = 0;
autowatch = 1;

outlets = 3;

// global info

    var boxWidth = 120; // box.rect[2] - box.rect[0];
    var boxHeight = 960; // box.rect[3] - box.rect[1];
    var column = 4;
    var low = 32;
    var padAmt = column * low;
    var padWidth = boxWidth / column;
    var padHeight = boxHeight / low;
    var gridGap = 4.5;

    var pads = [];

    var selectedPad = 0;
    var targetPad = ["same", 0];
    var chaseDrag = [];

    // colors

    var borderColor = [0.3, 0.3, 0.3, 0];
    var selectedPadBorderColor = [1, 1, 1, 0.87];
    var copyDragColor = [1, 0.3, 0.3, 0.5];
    var copyDragChaseColor = [1, 0.3, 0.3, 1];
    var swapDragColor = [0.3, 1, 0.3, 0.7];
    var swapDragChaseColor = [0.3, 1, 0.3, 1];

    var opa = 0.8;
    var colorPicker = [

        [0.153, 0.153, 0.153, 1],
        [1, 0.341615, 0.440703, opa] ,
        [0.996858, 0.468981, 0.468981, opa],
        [0.996273, 0.593191, 0.370186, opa],
        [0.996931, 0.677914, 0.48133, opa],
        [1, 0.775442, 0.428571, opa],
        [0.92655, 0.880221, 0 ,opa],
        [0.486383, 1, 0.465839, opa],
        [0.098502, 0.994666, 0.513615, opa],
        [0.444282, 0.738973, 0.996712, opa],
        [0.560687, 0.665296, 0.992108, opa],
        [0.615713, 0.580952, 0.996687, opa],
        [0.731278, 0.590062, 1, opa],
        [0.912349, 0.345488, 0.996127, opa],
        [0.994836, 0.346779, 0.801936, opa],
        [0.991036, 0.437535, 0.637462, opa]

    ];


// pad constructor

    function Pad(index) {

        this.index = index;
        this.x = this.calX();
        this.y = this.calY();
        this.mouseRange = this.calRange();
        this.padColor = [0.118, 0.118, 0.118, 1];
        this.padBorderColor = borderColor;

        this.padLayerX = this.x;
        this.padLayerY = this.y;
        this.padLayerColor = [0.3, 0.3, 0.3, 0];

    }

    // prototype

        Pad.prototype.calX = function () {

            return (this.index % column) * padWidth;

        }

        Pad.prototype.calY = function () {

            return Math.floor(this.index / column) * padHeight;

        }

        Pad.prototype.calRange = function () {

            return [this.x, this.x + padWidth, this.y, this.y + padHeight];

        }

        Pad.prototype.calColor = function () {

            var offset = 90;

            function random(os) {

                return Math.floor(Math.random() * os) / 100;

            }

            return [random(offset), random(offset), random(offset), 1];

        }

// create pads

    function createPads() {

        for (var i = 0; i < padAmt; i++) {

            pads[i] = new Pad(i);

        }

    }

    createPads();

// select pads from outside

    function selectPad(n) {

        pads[selectedPad].padBorderColor = borderColor; // turn off pad border color

        selectedPad = n; // update selectedPad with new n
        dragTargetPad = n;

        pads[selectedPad].padBorderColor = selectedPadBorderColor; // turn on pad border color
        
        mgraphics.redraw(); // re-excute paint();

    }

// color handler

    // change selectedPad's color
    function color(padIndex, colorIndex) {

        pads[padIndex].padColor = colorPicker[colorIndex];

        mgraphics.redraw(); // re-excute paint();

    }

  
// draw pads using mgraphics API.

    function paint() {

        for (var i = 0; i < padAmt; i++) {

            with (mgraphics) {

                // pad body

                rectangle(pads[i].x + gridGap, pads[i].y + gridGap, padWidth - gridGap, padHeight- gridGap);
                set_source_rgba(pads[i].padColor);
                fill_preserve();

                // pad border
                set_source_rgba(pads[i].padBorderColor);
                set_line_width(gridGap); // adjust border with;
                stroke();

            }
        }


        // layer for drag (draw at lastest)

        with (mgraphics) {

            rectangle(pads[selectedPad].padLayerX + gridGap, pads[selectedPad].padLayerY + gridGap, padWidth - gridGap, padHeight- gridGap);
            set_source_rgba(pads[selectedPad].padLayerColor);
            fill();

        }

    }


// event handler

    // selected pad (mousedown)
    function onclick(x, y, button, mod1, shift, caps, opt, mod2) {

        for (var i = 0; i < padAmt; i++) {

            if (x >= pads[i].mouseRange[0] && x <= pads[i].mouseRange[1] && y >= pads[i].mouseRange[2] && y <= pads[i].mouseRange[3]) {

                selectPad(i);

                targetPad = ["same", i];

                outlet(0, selectedPad);

                // if user press shift + click, change pad color randomly.
                if (shift === 1) {

                    // color randomizer

                    var len = colorPicker.length - 1; // exclude default index 0

                    var randomIndex = Math.floor(Math.random() * len) + 1; 
            
                    pads[selectedPad].padColor = colorPicker[randomIndex];

                    outlet(2, randomIndex);
            
                    mgraphics.redraw();

                }

            }

        }

        

    }

    // copy or swap pad
    function ondrag(x, y, button, mod1, shift, caps, opt, mod2) {

        var isPressed = button;

        // excute while holding mouse button with drag

        if (isPressed === 1) {

            // move coordinate of selectedPad layer
            pads[selectedPad].padLayerX = x - (padWidth / 2);
            pads[selectedPad].padLayerY = y - (padHeight / 2);

            for (var i = 0; i < padAmt; i++) {

                if (x >= pads[i].mouseRange[0] && x <= pads[i].mouseRange[1] && y >= pads[i].mouseRange[2] && y <= pads[i].mouseRange[3]) {

                    // with cmd (ctrl key)
                    if (mod1 === 1) {

                        targetPad = ["copy", i];
                        
                        pads[selectedPad].padLayerColor = copyDragColor; // red on copy dragging

                        // chase copy drag.
                        chaseDrag.push(i);

                        var len = chaseDrag.length;

                        // drag has to have 2 targets at least.
                        if (len > 1) {

                            var previousDragTarget = chaseDrag[len - 2];
                            var currentDragTarget = chaseDrag[len - 1];

                            // if drag target isn't selectedPad
                            if (previousDragTarget !== selectedPad) {

                                pads[previousDragTarget].padBorderColor = borderColor;
                                pads[currentDragTarget].padBorderColor = copyDragChaseColor;

                            }

                            // if drag target is selectedPad.
                            else {

                                pads[previousDragTarget].padBorderColor = borderColor;
                                pads[selectedPad].padBorderColor = selectedPadBorderColor;

                            }

                        }
                    
                        // redraw
                        mgraphics.redraw();

                    }

                    // with cmd (ctrl key)
                    else {

                        targetPad = ["swap", i];

                        pads[selectedPad].padLayerColor = swapDragColor; // blue on swap dragging

                        // chase swap drag.
                        chaseDrag.push(i);

                        var len = chaseDrag.length;

                        // drag has to have 2 targets at least.
                        if (len > 1) {

                            var previousDragTarget = chaseDrag[len - 2];
                            var currentDragTarget = chaseDrag[len - 1];

                            // if drag target isn't selectedPad
                            if (previousDragTarget !== selectedPad) {

                                pads[previousDragTarget].padBorderColor = borderColor;
                                pads[currentDragTarget].padBorderColor = swapDragChaseColor;

                            }

                            // if drag target is selectedPad.
                            else {

                                pads[previousDragTarget].padBorderColor = borderColor;
                                pads[selectedPad].padBorderColor = selectedPadBorderColor;

                            }

                        }
                    
                        // redraw
                        mgraphics.redraw();

                    }

                }

            }

        }

        // excute when dragging is done (button off)
        else {

            // move to original place f selectedPad layer
            pads[selectedPad].padLayerX = pads[selectedPad].x;
            pads[selectedPad].padLayerY = pads[selectedPad].y;
            pads[selectedPad].padLayerColor = [0.3, 0.3, 0.3, 0];

            // if targetPad isn't identical with selectedPad, outputs to outlet.
            if (selectedPad !== targetPad[1]) {

                // 1. redraw mgraphics by copy or swap.
                if (targetPad[0] === "copy") {

                    pads[targetPad[1]].padColor = pads[selectedPad].padColor;

                } 

                else if (targetPad[0] === "swap") {

                    // copy each color.
                    var colorA = pads[selectedPad].padColor;
                    var colorB = pads[targetPad[1]].padColor;

                    // paste color to each.
                    pads[selectedPad].padColor = colorB;
                    pads[targetPad[1]].padColor = colorA;

                }

                // 2. send output to outlets.
                outlet(1, targetPad[0], selectedPad, targetPad[1]);

                selectPad(targetPad[1]);
                chaseDrag = []; // make emtpy 
    
                outlet(0, selectedPad);

            }

            mgraphics.redraw(); // redraw

        }

    }

  
  