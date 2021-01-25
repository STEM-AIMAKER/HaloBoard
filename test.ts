{
    rgbledring.initLEDRing(DigitalPin.P0,12, rgbledring.Mode.RGB);
/*
    rgbledring.showRainbow();
    for (let i = 0; i <= 12; i++) { 
        rgbledring.show();
        basic.pause(100)
    }
    
    rgbledring.showColor(rgbledring.PixelColors.Red)
    basic.pause(2000)
    rgbledring.showColor(rgbledring.PixelColors.Green)
    basic.pause(1000)
    for (let i = 0; i <= 12; i++) {
        rgbledring.setPixelColor(i, rgbledring.inColors(rgbledring.PixelColors.Blue))
        rgbledring.show()
        basic.pause(100)
    }
    for (let i = 0; i <= 12; i++) {
        rgbledring.setPixelColor(i, rgbledring.inColors(rgbledring.PixelColors.Green))
        rgbledring.show()
        basic.pause(100)
    }
   
    let br = 100;
    rgbledring.setBrightness(100);
    input.onButtonPressed(Button.B, () => {
        br = br + 20;
        if (br > 255) {
            br = 5;
        }
        rgbledring.setBrightness(br);
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
        rgbledring.show();
        basic.pause(100);
    }*/
}