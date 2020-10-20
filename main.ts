
//% block="Haloboard" color=#2699BF icon="\uf110"
namespace haloboard {    
    export enum PixelColors {
        //% block=red
        Red = 0xFF0000,
        //% block=orange
        Orange = 0xFFA500,
        //% block=yellow
        Yellow = 0xFFFF00,
        //% block=green
        Green = 0x00FF00,
        //% block=blue
        Blue = 0x0000FF,
        //% block=indigo
        Indigo = 0x4b0082,
        //% block=violet
        Violet = 0x8a2be2,
        //% block=purple
        Purple = 0xFF00FF,
        //% block=white
        White = 0xFFFFFF,
        //% block=black
        Black = 0x000000
    }

    /**
     * Different modes
     */
    export enum Mode {
        //% block="RGB (GRB format)"
        RGB = 0,
        //% block="RGB+W"
        RGBW = 1,
        //% block="RGB (RGB format)"
        RGB_RGB = 2
    }

        let buf: Buffer;
        let pin: DigitalPin;
        
        let brightness: number;
        let start: number; // start offset in board
        let _length: number; // number of LEDs
        let _mode: Mode;

        /**
         * Shows all LEDs to a given color (range 0-255 for r, g, b). 
         * @param rgb RGB color of the LED
         */
        //% blockId="showColor" block="show color %rgb=pixel_colors" 
        //% parts="haloboard"
        export function showColor(rgb: number): void {
            rgb = rgb >> 0;
            setAllRGB(rgb);
            show();
        }

        /**
         * Shows a rainbow pattern on all LEDs. 
         * @param startHue the start hue value for the rainbow, eg: 1
         * @param endHue the end hue value for the rainbow, eg: 360
         */
        //% blockId="haloboard_showRainbow" block="show rainbow from %startHue|to %endHue" 
        //% parts="haloboard"
        export function showRainbow(startHue: number = 1, endHue: number = 360): void {
            if (_length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = _length;
            const direction = HueInterpolationDirection.Clockwise;

            //hue
            const h1 = startHue;
            const h2 = endHue;
            const hDistCW = ((h2 + 360) - h1) % 360;
            const hStepCW = Math.idiv((hDistCW * 100), steps);
            const hDistCCW = ((h1 + 360) - h2) % 360;
            const hStepCCW = Math.idiv(-(hDistCCW * 100), steps);
            let hStep: number;
            if (direction === HueInterpolationDirection.Clockwise) {
                hStep = hStepCW;
            } else if (direction === HueInterpolationDirection.CounterClockwise) {
                hStep = hStepCCW;
            } else {
                hStep = hDistCW < hDistCCW ? hStepCW : hStepCCW;
            }
            const h1_100 = h1 * 100; //we multiply by 100 so we keep more accurate results while doing interpolation

            //sat
            const s1 = saturation;
            const s2 = saturation;
            const sDist = s2 - s1;
            const sStep = Math.idiv(sDist, steps);
            const s1_100 = s1 * 100;

            //lum
            const l1 = luminance;
            const l2 = luminance;
            const lDist = l2 - l1;
            const lStep = Math.idiv(lDist, steps);
            const l1_100 = l1 * 100

            //interpolate
            if (steps === 1) {
                setPixelColor(0, hsl(h1 + hStep, s1 + sStep, l1 + lStep))
            } else {
                setPixelColor(0, hsl(startHue, saturation, luminance));
                for (let i = 1; i < steps - 1; i++) {
                    const h = Math.idiv((h1_100 + i * hStep), 100) + 360;
                    const s = Math.idiv((s1_100 + i * sStep), 100);
                    const l = Math.idiv((l1_100 + i * lStep), 100);
                    setPixelColor(i, hsl(h, s, l));
                }
                setPixelColor(steps - 1, hsl(endHue, saturation, luminance));
            }
            show();
        }

        
        /**
         * Set LED to a given color (range 0-255 for r, g, b). 
         * You need to call ``show`` to make the changes visible.
         * @param pixeloffset position
         * @param rgb RGB color of the LED
         */
        //% blockId="haloboard_setPixelColor" block="set pixel color at %pixeloffset|to %rgb=colors" 
        //% parts="haloboard"
        export function setPixelColor(pixeloffset: number, rgb: number): void {
            setPixelRGB(pixeloffset >> 0, rgb >> 0);
        }

        
        /**
         * For NeoPixels with RGB+W LEDs, set the white LED brightness. This only works for RGB+W NeoPixels.
         * @param pixeloffset position of the LED in the board
         * @param white brightness of the white LED
         */
        //% blockId="haloboard_setPixelWhiteLED" block="set pixel white LED at %pixeloffset|to %white" 
        //% parts="haloboard" advanced=true
        export function setPixelWhiteLED(pixeloffset: number, white: number): void {            
            if (_mode === Mode.RGBW) {
                setPixelW(pixeloffset >> 0, white >> 0);
            }
        }

        /** 
         * Send all the changes to the board.
         */
        //% blockId="haloboard_show" block="show"
        //% parts="haloboard"
        export function show(): void {
            ws2812b.sendBuffer(buf, pin);
        }

        /**
         * Turn off all LEDs.
         * You need to call ``show`` to make the changes visible.
         */
        //% blockId="haloboard_clear" block="clear"
        //% parts="haloboard"
        export function clear(): void {
            const stride = _mode === Mode.RGBW ? 4 : 3;
            buf.fill(0, start * stride, _length * stride);
        }

        /**
         * Gets the number of pixels declared on the board
         */
        //% blockId="haloboard_length" block="length"
        //% parts="haloboard" advanced=true
        export function length(): number {
            return _length;
        }

        /**
         * Set the brightness of the board. This flag only applies to future operation.
         * @param brightness a measure of LED brightness in 0-255. eg: 255
         */
        //% blockId="haloboard_setbrightness" block="set brightness %brightness"
        //% parts="haloboard" advanced=true
        export function setBrightness(brightnessValue: number): void {
            brightness = brightnessValue & 0xff;
        }

        /**
         * Apply brightness to current colors using a quadratic easing function.
         **/
        //% blockId="haloboard_easeBrightness" block="ease brightness"
        //% parts="haloboard" advanced=true
        export function easeBrightness(): void {
            const stride = _mode === Mode.RGBW ? 4 : 3;
            const br = brightness;
            const buf1 = buf;
            const end = start + _length;
            const mid = Math.idiv(_length, 2);
            for (let i = start; i < end; ++i) {
                const k = i - start;
                const ledoffset = i * stride;
                const br = k > mid
                    ? Math.idiv(255 * (_length - 1 - k) * (_length - 1 - k), (mid * mid))
                    : Math.idiv(255 * k * k, (mid * mid));
                const r = (buf1[ledoffset + 0] * br) >> 8; buf1[ledoffset + 0] = r;
                const g = (buf1[ledoffset + 1] * br) >> 8; buf1[ledoffset + 1] = g;
                const b = (buf1[ledoffset + 2] * br) >> 8; buf1[ledoffset + 2] = b;
                if (stride == 4) {
                    const w = (buf1[ledoffset + 3] * br) >> 8; buf1[ledoffset + 3] = w;
                }
            }
        }

        /**
         * Set the pin where the haloboard is connected, defaults to P0.
         */
        //% blockId="haloboard_setPin" block="set pin=%pinValue where the haloboard is connected"
        //% weight=10
        //% parts="haloboard" advanced=true
        export function setPin(pinValue: DigitalPin): void {
            pin = pinValue;
            pins.digitalWritePin(pin, 0);
            // don't yield to avoid races on initialization
        }

        /**
         * Estimates the electrical current (mA) consumed by the current light configuration.
         */
        //% weight=9 blockId=haloboard_power block="power (mA)"
        //% parts="haloboard" advanced=true
        export function power(): number {
            const stride = _mode === Mode.RGBW ? 4 : 3;
            const end = start + _length;
            let p = 0;
            for (let i = start; i < end; ++i) {
                const ledoffset = i * stride;
                for (let j = 0; j < stride; ++j) {
                    p += buf[i + j];
                }
            }
            return Math.idiv(length(), 2) /* 0.5mA per neopixel */
                + Math.idiv(p * 433, 10000); /* rought approximation */
        }

        function setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (_mode === Mode.RGB_RGB) {
                buf[offset + 0] = red;
                buf[offset + 1] = green;
            } else {
                buf[offset + 0] = green;
                buf[offset + 1] = red;
            }
            buf[offset + 2] = blue;
        }

        function  setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br = brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            const end = start + _length;
            const stride = _mode === Mode.RGBW ? 4 : 3;
            for (let i = start; i < end; ++i) {
                setBufferRGB(i * stride, red, green, blue)
            }
        }
        function setAllW(white: number) {
            if (_mode !== Mode.RGBW)
                return;

            let br = brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf1 = buf;
            let end = start + _length;
            for (let i = start; i < end; ++i) {
                let ledoffset = i * 4;
                buf1[ledoffset + 3] = white;
            }
        }
        function  setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= _length)
                return;

            let stride = _mode === Mode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + start) * stride;

            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            let br = brightness;
            if (br < 255) {
                red = (red * br) >> 8;
                green = (green * br) >> 8;
                blue = (blue * br) >> 8;
            }
            setBufferRGB(pixeloffset, red, green, blue)
        }
        function setPixelW(pixeloffset: number, white: number): void {
            if (_mode !== Mode.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= _length)
                return;

            pixeloffset = (pixeloffset + start) * 4;

            let br = brightness;
            if (br < 255) {
                white = (white * br) >> 8;
            }
            let buf1 = buf;
            buf1[pixeloffset + 3] = white;
        }
    
    /**
     * Create a new NeoPixel driver for `numleds` LEDs.
     * @param pin the pin where the neopixel is connected.
     * @param numleds number of leds in the board, eg: 10,12
     */
    //% blockId="initBoard" block="Init haloboard at pin %pin|with %numleds|leds as %mode"
    //% trackArgs=0,2
    //% parts="haloboard"
    export function initBoard(pin: DigitalPin, numleds: number, mode: Mode): void {
        let stride = mode === Mode.RGBW ? 4 : 3;
        buf = pins.createBuffer(numleds * stride);
        start = 0;
        _length = numleds;
        _mode = mode;
        setBrightness(128)
        setPin(pin)
    }

    /**
     * Converts red, green, blue channels into a RGB color
     * @param red value of the red channel between 0 and 255. eg: 255
     * @param green value of the green channel between 0 and 255. eg: 255
     * @param blue value of the blue channel between 0 and 255. eg: 255
     */
    //% blockId="rgb" block="red %red|green %green|blue %blue"
    //% advanced=true
    export function rgb(red: number, green: number, blue: number): number {
        return packRGB(red, green, blue);
    }

    /**
     * Gets the RGB value of a known color
    */
    //% blockId="colors" block="%color"
    //% advanced=true
    export function colors(color: PixelColors): number {
        return color;
    }

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let r = (rgb >> 16) & 0xFF;
        return r;
    }
    function unpackG(rgb: number): number {
        let g = (rgb >> 8) & 0xFF;
        return g;
    }
    function unpackB(rgb: number): number {
        let b = (rgb) & 0xFF;
        return b;
    }

    /**
     * Converts a hue saturation luminosity value into a RGB color
     * @param h hue from 0 to 360
     * @param s saturation from 0 to 99
     * @param l luminosity from 0 to 99
     */
    //% blockId=hsl block="hue %h|saturation %s|luminosity %l"
    export function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        
        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let c = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h1 = Math.idiv(h, 60);//[0,6]
        let h2 = Math.idiv((h - h1 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h1 % 2) << 8) + h2) - 256);
        let x = (c * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h1 == 0) {
            r$ = c; g$ = x; b$ = 0;
        } else if (h1 == 1) {
            r$ = x; g$ = c; b$ = 0;
        } else if (h1 == 2) {
            r$ = 0; g$ = c; b$ = x;
        } else if (h1 == 3) {
            r$ = 0; g$ = x; b$ = c;
        } else if (h1 == 4) {
            r$ = x; g$ = 0; b$ = c;
        } else if (h1 == 5) {
            r$ = c; g$ = 0; b$ = x;
        }
        let m = Math.idiv((Math.idiv((l * 2 << 8), 100) - c), 2);
        let r = r$ + m;
        let g = g$ + m;
        let b = b$ + m;
        return packRGB(r, g, b);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }
}
