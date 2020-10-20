{
    let board = haloboard.create(DigitalPin.P0,12, Mode.RGB);

    board.showRainbow();
    for (let i = 0; i <= board.length(); i++) { 
        board.show();
        basic.pause(100)
    }
    
    board.showColor(PixelColors.Red)
    basic.pause(2000)
    board.showColor(PixelColors.Green)
    basic.pause(1000)
    for (let i = 0; i <= board.length(); i++) {
        board.setPixelColor(i, haloboard.colors(PixelColors.Blue))
        board.show()
        basic.pause(100)
    }
    for (let i = 0; i <= board.length(); i++) {
        board.setPixelColor(i, haloboard.colors(PixelColors.Green))
        board.show()
        basic.pause(100)
    }
    let sub = board.range(10, 20)
    sub.showColor(PixelColors.Yellow);
    basic.pause(200);

    
    let br = 100;
    board.setBrightness(100);
    input.onButtonPressed(Button.B, () => {
        br = br + 20;
        if (br > 255) {
            br = 5;
        }
        board.setBrightness(br);
    });

    let rotationMode = false;
    input.onButtonPressed(Button.A, () => {
        rotationMode = !rotationMode;
        if (rotationMode) {
            basic.showLeds(`
            . # # # .
            # . . . #
            # . . . #
            # . . . #
            . # # # .
            `);
        } else {
            basic.showLeds(`
            . . # . .
            . . . # .
            # # # # #
            . . . # .
            . . # . .
            `);

        }
    });

    while (true) {
        let x = input.acceleration(Dimension.X) >> 1
        let y = input.acceleration(Dimension.Y) >> 1
        let z = input.acceleration(Dimension.Z) >> 1
        board.show();
        basic.pause(100);
    }
}
