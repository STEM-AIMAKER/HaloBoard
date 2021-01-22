{
    haloboard.init(DigitalPin.P0,12, Mode.RGB);

    haloboard.showRainbow();
    for (let i = 0; i <= 12; i++) { 
        haloboard.show();
        basic.pause(100)
    }
    
    haloboard.showColor(PixelColors.Red)
    basic.pause(2000)
    haloboard.showColor(PixelColors.Green)
    basic.pause(1000)
    for (let i = 0; i <= 12; i++) {
        haloboard.setPixelColor(i, haloboard.colors(PixelColors.Blue))
        haloboard.show()
        basic.pause(100)
    }
    for (let i = 0; i <= 12; i++) {
        haloboard.setPixelColor(i, haloboard.colors(PixelColors.Green))
        haloboard.show()
        basic.pause(100)
    }
   
    let br = 100;
    haloboard.setBrightness(100);
    input.onButtonPressed(Button.B, () => {
        br = br + 20;
        if (br > 255) {
            br = 5;
        }
        haloboard.setBrightness(br);
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
        haloboard.show();
        basic.pause(100);
    }
}
