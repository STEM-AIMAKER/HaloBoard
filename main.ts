//% weight=5 color=#2699BF icon="\uf110" block="AIMaker: RGB LED Ring"
namespace rgbledring {

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

    export enum Mode {
        //% block="RGB (GRB format)"
        RGB = 0,
        //% block="RGB+W"
        RGBW = 1,
        //% block="RGB (RGB format)"
        RGB_RGB = 2
    }


        let _buf: Buffer;
        let _pin: DigitalPin;        
        let _brightness: number;
        let _start: number; // start offset in board
        let _length: number; // number of LEDs
        let _mode: Mode;
     
        //% blockId="setbrightness" block="Set brightness %brightness"
        //% brightness.defl=255 brightness.min=0 brightness.max=255
        export function setBrightness(brightness: number): void {
            _brightness = brightness & 0xff;
        }
         
        /**
        * Converts red, green, blue channels into a RGB color
        * @param red value of the red channel between 0 and 255. eg: 255
        * @param green value of the green channel between 0 and 255. eg: 255
        * @param blue value of the blue channel between 0 and 255. eg: 255
        */
        //% blockId="rgb" block="red %red|green %green|blue %blue"
        export function rgb(red: number, green: number, blue: number): number {
            return packRGB(red, green, blue);
        }
 
        /**
        * Gets the RGB value of a known color
        */
        //% blockId="inColors" block="%color"
        export function inColors(color: PixelColors): number {
            return color;
        }

        /**
        * Shows all LEDs to a given color (range 0-255 for r, g, b). 
        * @param rgb RGB color of the LED
        */
        //% blockId="showColor" block="Show color rgb=%rgbValue pixel_colors" 
        export function showColor(rgbValue: number) {
            rgbValue = rgbValue >> 0;
            setAllRGB(rgbValue);
            show();
        }

        //% blockId="clear" block="clear"
        export function clear(): void {
            const stride = _mode === Mode.RGBW ? 4 : 3;
            _buf.fill(0, _start * stride, _length * stride);
            show()
        }

        //% blockId="show" block="Show"
        export function show() {
            ws2812b.sendBuffer(_buf, _pin);
        }

        //% blockId="setPixelColor" block="Set pixel color at %offset|to %crgb" 
        //% offset.min=1 offset.defl=1
        export function setPixelColor(offset: number, crgb: number): void {
            if( offset > 0 )
                offset -= 1
            setPixelRGB(offset >> 0, crgb >> 0);
        }
    
        //% blockId="showRainbow" block="Show rainbow from %startHue|to %endHue" 
        //% startHue.defl=1
        //% endHue.defl=360
        export function showRainbow(startHue: number = 1, endHue: number = 360) {
            if (_length <= 0) return;

            startHue = startHue >> 0;
            endHue = endHue >> 0;
            const saturation = 100;
            const luminance = 50;
            const steps = _length+1;
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
    
        //% blockId="initLEDRing" block="Set RGB LED Ring at pin %pin|with %numleds|leds as %mode"
        export function initLEDRing(pin: DigitalPin, numleds: number, mode: Mode) {
            _pin = pin
            _start = 0
            _length = numleds
            let stride2 = mode === Mode.RGBW ? 4 : 3;
            _mode = mode
            _brightness = 128
            _buf = pins.createBuffer(numleds * stride2);
        }
        
        function setPixelWhiteLED(pixeloffset: number, white: number): void {            
            if (_mode === Mode.RGBW) {
                setPixelW(pixeloffset >> 0, white >> 0);
            }
        }

        function length() {
            return _length;
        }

        function easeBrightness(): void {
            const stride22 = _mode === Mode.RGBW ? 4 : 3;
            const br = _brightness;
            const buf = _buf;
            const end = _start + _length;
            const mid = Math.idiv(_length, 2);
            for (let j = _start; j < end; ++j) {
                const k = j - _start;
                const ledoffset = j * stride22;
                const br2 = k > mid
                    ? Math.idiv(255 * (_length - 1 - k) * (_length - 1 - k), (mid * mid))
                    : Math.idiv(255 * k * k, (mid * mid));
                const r = (buf[ledoffset + 0] * br2) >> 8; buf[ledoffset + 0] = r;
                const g = (buf[ledoffset + 1] * br2) >> 8; buf[ledoffset + 1] = g;
                const b = (buf[ledoffset + 2] * br2) >> 8; buf[ledoffset + 2] = b;
                if (stride22 == 4) {
                    const w = (buf[ledoffset + 3] * br2) >> 8; buf[ledoffset + 3] = w;
                }
            }
        }

        function setPin(pin: DigitalPin): void {
            _pin = pin;
            pins.digitalWritePin(_pin, 0);
            // don't yield to avoid races on initialization
        }

        function power(): number {
            const stride3 = _mode === Mode.RGBW ? 4 : 3;
            const end2 = _start + _length;
            let p = 0;
            for (let m = _start; m < end2; ++m) {
                const ledoffset2 = m * stride3;
                for (let n = 0; n < stride3; ++n) {
                    p += _buf[m + n];
                }
            }
            return Math.idiv(length(), 2) /* 0.5mA per neopixel */
                + Math.idiv(p * 433, 10000); /* rought approximation */
        }

        function setBufferRGB(offset: number, red: number, green: number, blue: number): void {
            if (_mode === Mode.RGB_RGB) {
                _buf[offset + 0] = red;
                _buf[offset + 1] = green;
            } else {
                _buf[offset + 0] = green;
                _buf[offset + 1] = red;
            }
            _buf[offset + 2] = blue;
        }

        function setAllRGB(rgb: number) {
            let red = unpackR(rgb);
            let green = unpackG(rgb);
            let blue = unpackB(rgb);

            const br3 = _brightness;
            if (br3 < 255) {
                red = (red * br3) >> 8;
                green = (green * br3) >> 8;
                blue = (blue * br3) >> 8;
            }
            const end3 = _start + _length;
            const stride4 = _mode === Mode.RGBW ? 4 : 3;
            for (let o = _start; o < end3; ++o) {
                setBufferRGB(o * stride4, red, green, blue)
            }
        }
        function setAllW(white: number) {
            if (_mode !== Mode.RGBW)
                return;

            let br4 = _brightness;
            if (br4 < 255) {
                white = (white * br4) >> 8;
            }
            let buf2 = _buf;
            let end4 = _start + _length;
            for (let q = _start; q < end4; ++q) {
                let ledoffset3 = q * 4;
                buf2[ledoffset3 + 3] = white;
            }
        }
        function setPixelRGB(pixeloffset: number, rgb: number): void {
            if (pixeloffset < 0
                || pixeloffset >= _length)
                return;

            let stride5 = _mode === Mode.RGBW ? 4 : 3;
            pixeloffset = (pixeloffset + _start) * stride5;

            let red2 = unpackR(rgb);
            let green2 = unpackG(rgb);
            let blue2 = unpackB(rgb);

            let br5 = _brightness;
            if (br5 < 255) {
                red2 = (red2 * br5) >> 8;
                green2 = (green2 * br5) >> 8;
                blue2 = (blue2 * br5) >> 8;
            }
            setBufferRGB(pixeloffset, red2, green2, blue2)
        }
        function setPixelW(pixeloffset: number, white: number): void {
            if (_mode !== Mode.RGBW)
                return;

            if (pixeloffset < 0
                || pixeloffset >= _length)
                return;

            pixeloffset = (pixeloffset + _start) * 4;

            let br6 = _brightness;
            if (br6 < 255) {
                white = (white * br6) >> 8;
            }
            let buf3 = _buf;
            buf3[pixeloffset + 3] = white;
        }
    

    function packRGB(a: number, b: number, c: number): number {
        return ((a & 0xFF) << 16) | ((b & 0xFF) << 8) | (c & 0xFF);
    }
    function unpackR(rgb: number): number {
        let t = (rgb >> 16) & 0xFF;
        return t;
    }
    function unpackG(rgb: number): number {
        let u = (rgb >> 8) & 0xFF;
        return u;
    }
    function unpackB(rgb: number): number {
        let c = (rgb) & 0xFF;
        return c;
    }

    function hsl(h: number, s: number, l: number): number {
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        
        h = h % 360;
        s = Math.clamp(0, 99, s);
        l = Math.clamp(0, 99, l);
        let d = Math.idiv((((100 - Math.abs(2 * l - 100)) * s) << 8), 10000); //chroma, [0,255]
        let h12 = Math.idiv(h, 60);//[0,6]
        let h22 = Math.idiv((h - h12 * 60) * 256, 60);//[0,255]
        let temp = Math.abs((((h12 % 2) << 8) + h22) - 256);
        let x = (d * (256 - (temp))) >> 8;//[0,255], second largest component of this color
        let r$: number;
        let g$: number;
        let b$: number;
        if (h12 == 0) {
            r$ = d; g$ = x; b$ = 0;
        } else if (h12 == 1) {
            r$ = x; g$ = d; b$ = 0;
        } else if (h12 == 2) {
            r$ = 0; g$ = d; b$ = x;
        } else if (h12 == 3) {
            r$ = 0; g$ = x; b$ = d;
        } else if (h12 == 4) {
            r$ = x; g$ = 0; b$ = d;
        } else if (h12 == 5) {
            r$ = d; g$ = 0; b$ = x;
        }
        let v = Math.idiv((Math.idiv((l * 2 << 8), 100) - d), 2);
        let a = r$ + v;
        let e = g$ + v;
        let f = b$ + v;
        return packRGB(a, e, f);
    }

    export enum HueInterpolationDirection {
        Clockwise,
        CounterClockwise,
        Shortest
    }
}
