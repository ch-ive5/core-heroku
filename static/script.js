
// Copyright 2021 Johnathan Pennington | All rights reserved.


// HTML ELEMENTS
const canvas1 = document.getElementById('canvas1');
    // Coordinates for the center of the canvas is [0,0].
    // The height of the game's aspect ratio in the canvas is equal to 1.
    // The width of the game's aspect ratio in the canvas is equal to minAspectRatio.
const ctx1 = canvas1.getContext('2d');
const topSurface = document.getElementById('top-surface');
const levelText = document.getElementById('level-text');
const gameOverText = document.getElementById('game-over-text');
const htmlConsole = document.getElementById('html-console');
const keysIcon = document.getElementById('img-icon-keys');
const keysIconAspRatio = 1.016; // width / height
const mouseIcon = document.getElementById('img-icon-mouse');
const mouseIconAspRatio = 0.590; // width / height
const touchIcon = document.getElementById('img-icon-touch');
const touchIconAspRatio = 0.787; // width / height
const audioMuteIcon = document.getElementById('img-icon-audio-mute');
const audioOnIcon = document.getElementById('img-icon-audio-on');
const audioIconsAspRatio = 1; // width / height
const arrowLeftImg = document.getElementById('img-arrow-left');
const arrowRightImg = document.getElementById('img-arrow-right');
const arrowSourceWidthPx = 125; // pixels
const arrowSourceHeightPx = 121; // pixels
const ffArrowImg = document.getElementById('img-fast-forward');
const ffArrowImgSourceWidthPx = 769; // pixels
const ffArrowImgSourceHeightPx = 513; // pixels


// LEVELS AND DIFFICULTY
// "Start" constants happen at level = 0. "Limit" constants happen at level = +inf.
const halfLifeLevels = 30; // Number of levels needed to reach halfway to the limit (most difficult) settings.
const startLevelsPerNewTree = 8;
const limitLevelsPerNewTree = 1;
const startBlockSlideTime = 4; // seconds
const limitBlockSlideTime = 1.2; // seconds
const startBlockFallTimeOffset = 0; // seconds
const limitBlockFallTimeOffset = 7; // seconds
const startGlitchExponCurve = 8;
const limitGlitchExponCurve = 0.8;
// Exponential curve constants above can be any positive real number
    // 0<X<1 is decelerating curve. X=1 is linear. X>1 is accelerating curve.


// SIZE & POSITIONING
// windowScaling factors is a factor of the height of the game's aspect ratio.
const minAspectRatio = 1.4; // width / height // When the aspect ratio of the window is smaller, height is scaled down along with width.
const windowPadding = 0.5; // layers // The amount of space to leave between the top of the highest layer and the edge of the screen.
const canvasConsoleFontSize = 0.03; // windowScaling factors
const levelTextSize = 0.06; // windowScaling factors
const levelTextDistAboveRing = 0.09; // windowScaling factors
const gameOverTextSize = 0.032; // windowScaling factors
const numRadPos = 12; // Number of integer radial position units in 1 full rotation.
    // Position numbering: radPos=0 aligns with positive x-axis (pointing rightward); increasing radPos from 0 is clockwise ("rightward") rotation.
const minBlockWidth = 1;
const maxBlockWidth = 4;
const treeMinGap = maxBlockWidth; // To leave room for new block.
const treeMinBranchWidth = 2; // Does not exclude a branch width of 0 (just trunk).
const circleRadius = 0.1; // windowScaling factors
const ringThickness = 0.01; // windowScaling factors
const arrowOffRelWidth = 0.070; // windowScaling factors
const arrowHoverRelWidth = arrowOffRelWidth; // windowScaling factors
const arrowOnRelWidth = 0.081; // windowScaling factors
const arrowsDistBesideRing = 0.18; // windowScaling factors
const ffArrowOffRelWidth = 0.060; // windowScaling factors
const ffArrowHoverRelWidth = ffArrowOffRelWidth; // windowScaling factors
const ffArrowOnRelWidth = 0.073; // windowScaling factors
const ffArrowImgDistBelowRing = levelTextDistAboveRing; // windowScaling factors
const ffArrowClickWidth = 0.3; // windowScaling factors // Click area is a square with this side length.
const controlIconsHeight = 0.06; // windowScaling factors
const controlIconsSpacing = 0.15; // windowScaling factors
const controlIconsDistAboveRing = levelTextDistAboveRing; // windowScaling factors
const audioIconsHeight = 0.06; // windowScaling factors
const audioIconsDistBelowRing = ffArrowImgDistBelowRing; // windowScaling factors
const audioIconsDistBesideRing = arrowsDistBesideRing; // windowScaling factors
const audioIconClickWidth = 0.15; // windowScaling factors // Click area is a square with this side length.
const maxNumLayers = 5; // The maximum number of layers that can be encoded. Any positive integer. 1 is just the circle.
    // Game over if this many layers used. // Outer-ring encloses all layers besides the top layer.
const blockStartHeight = 0; // windowScaling factors above highest layer.


// SIZE & POSITIONING - AUTO CALCULATED
const blockRelThickness = Math.pow(0.5 / circleRadius, 1 / (maxNumLayers + windowPadding)) - 1;
//
var layerHeights = [circleRadius]; // array // Calculated automatically (for loop below) based on circleRadius and blockRelThickness.
    // Base of first layer number is layerHeights[0]. Base of highest layer number is layerHeights[maxNumLayers - 1].
    // Top of highest layer number (base of highest layer + 1) is layerHeights[maxNumLayers].
for (let i = 0; i < maxNumLayers; i++) { // Calculates heights of layerHeights.
    let layerHeight = layerHeights[layerHeights.length - 1] * (1 + blockRelThickness);
    layerHeights.push(layerHeight);
};
//
const ringRadius = layerHeights[layerHeights.length - 2] + ringThickness / 2;
const treeSizeLimit = numRadPos - maxBlockWidth + 1; // Number of cells in tree (trunk + branch).
    // So that a new randomMovingBlock() is not blocked immediately by a single newTree() causing immediate GAME OVER.


// SPEED & MOVEMENT
const circleRotInitSpeed = 3; // any positive (non-zero) real number // radPos units per second
const circleRotTermSpeed = 11; // radPos units per second
const circleRotAccelTime = 0.3; // seconds
const circleRotAccelExponCurve = 1.4; // Any positive real number
    // 0<X<1 is decelerating curve. X=1 is linear. X>1 is accelerating curve.
const blockFallAccelRate = 0.02; // windowScaling factors per second per second
    // 0 means fall speed begins at 0. Positive means fall speed starts as positive.
    // Negative means fall speed starts as negative (rising). (Doesn't work for negative???)
const blockFrictionexponCurve = 2; // Any positive real number
    // 0<X<1 is decelerating curve. X=1 is linear. X>1 is accelerating curve.
const snapSpeed = 7; // radPos units per second // Blocks snap to radPos grid. Sync with audio.
const autoSnapMaxDistance = 0.3; // RadPos units // 0.0 <= autoSnapMaxDistance <= 0.5
    // If a block comes to rest within this distance from a position where it may fall, it is snapped to that position and begins falling.
const fastForwardSpeed = 5; // A factor of normal speed.
const ffCircleChangeRate = 1; // Phases per second


// COLOR & SHADING
const gameOverDimLevel = 0.2; // alpha // 0 is no dimming. 1 is full dimming.
const treeInitialHSL = [0, 0, 9, ]; // hue (degrees), saturation (%), lightness (%)
//
const arrowOffOpacity = 0.3; // 0-1
const arrowOnOpacity = 0.7; // 0-1
const arrowHoverOpacity = arrowOnOpacity; // 0-1
//
const blockFallColor = 'hsl(298, 0%, 100%)';
const blockSlideHueMean = 320; // Average hue
const blockSlideHueChangeRate = 30; // Per second
const blockSlideHueMaxChange = 40; // Furthest distance from hue.
const blockLowestLayerLightness = 15; // percentage // 0 <= blockLowestLayerLightness <= 100
const blockLightnessMaxChange = 55; // The maximum amount blockLowestLayerLightness changes +/- at highest layer (positive or negative).
const blockLightColor = 'hsla(0, 0%, 100%, 8%)';
// Fixed blocks have no saturation. Lightness is set automatically based on layer number with some random variation.
//
const ringColor = 'hsl(237, 100%, 50%)';
const ringAlertColor = '#000000';


// BACKGROUND RECTANGLE TEXTURE
const numBgRects = 3333; // Number of random rectangles to add to background.
const bgRectsMinOpacity = 0; // Minimum Transparency. 0-1
const bgRectsMaxOpacity = 1; // Maximum Transparency. 0-1
const bgRectsOpacityMinChangeRate = 3; // Seconds to cycle all transparency values.
const bgRectsOpacityMaxChangeRate = 6; // Seconds to cycle all transparency values.
const bgRectsMinSideLength = 0.008; // windowScaling factors.
const bgRectsMaxSideLength = 0.03; // windowScaling factors.
const bgRectsHue = 237;
var bgTexture = [];
for (let rect = 0; rect < numBgRects; rect++) {
    let xPosition = randFloat(-3, 3);
    let yPosition = randFloat(-3, 3);
    let width = randFloat(bgRectsMinSideLength, bgRectsMaxSideLength);
    let height = randFloat(bgRectsMinSideLength, bgRectsMaxSideLength);
    let opacity = randFloat(-1, 1); // Negative values used during transparency decrease.
        // Positive values used during transparency increase.
        // 0 is min transparency. 1 and -1 is max transparency.
    let rectObject = {x: xPosition, y: yPosition, width: width, height: height, opacity: opacity};
    bgTexture.push(rectObject);
};


// AUDIO SETTINGS
const treeGainRampStart = -40; // dB
const treeGainRampEnd = -21; // dB
const treeGainJump = 0; // dB
const treeGainJumpDuration = 0.06; // seconds
//
const clickAudioInitPitch = 2; // factor of original source playback speed // 2
const clickAudioFinalPitch = 1; // factor of original source playback speed // 0.6
const clickAudioInitFreq = 0.008; // seconds // < clickAudioFinalFreq // 0.02
const clickAudioFinalFreq = 0.1; // seconds // > clickAudioInitFreq // 0.15
const clickAudioFreqExponCurve = 0.7; // Any positive real number
    // 0<X<1 is decelerating curve. X=1 is linear. X>1 is accelerating curve.


// INIT AUDIO VARIABLES
var audioCtx = new AudioContext();
const glitchAudioLowestOctaveShift = 0;
const glitchAudioHighestOctaveShift = 2;
const glitchAudioOctaveShiftExponCurve = 1; // Any positive real number
    // 0<X<1 is decelerating curve. X=1 is linear. X>1 is accelerating curve.
var audioMuted = true;
var masterGain = audioCtx.createGain();
masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
masterGain.connect(audioCtx.destination);
//
var cancelClickIDs = { interval: null, timeout: null, };
var audioSources = {};
    // key: { // Name of audio.
    //     fileName: fileName, // File name of the source audio.
    //     loop: loop, // Boolean.
    //     bufferData: bufferData, // Retrieved from audio file with setupAudioSource().
    //     source: source, // Setup with setupAudioSource().
    //     gainNode1: gainNode1, // Setup with setupAudioSource().
    //     gainNode2: gainNode2, // Setup with setupAudioSource().
    //     rampTimeoutID: rampTimeoutID, // Created automatically on-demand.
    // },

setupAudioConnections('finalClick', false, 0.5);
serverFileAudioSource('click', 'click12msec2000msec.mp3', true)
.then(audioBuffer => audioSources.finalClick.bufferData = audioBuffer) // Copy buffer data from audioSources.click.
.catch(e => console.error(e));
//
serverFileAudioSource('fastForward', 'fast-forward.mp3', true, 1.3);
serverFileAudioSource('spin', 'spin.mp3', true);
serverFileAudioSource('slide', 'slide.mp3', true);
serverFileAudioSource('land', 'land.mp3', false, 1.5);
serverFileAudioSource('glitch', 'glitch.mp3', false);
serverFileAudioSource('layerComplete', 'layer-complete.mp3', false);
whiteNoiseAudioSource('noise', true);


// AUDIO GAIN LEVELS
audioSources.fastForward.gainNode2.gain.setValueAtTime(dbToPcm(-6), audioCtx.currentTime);
audioSources.spin.gainNode2.gain.setValueAtTime(dbToPcm(-7), audioCtx.currentTime);
audioSources.slide.gainNode2.gain.setValueAtTime(dbToPcm(-24), audioCtx.currentTime);
audioSources.finalClick.gainNode2.gain.setValueAtTime(dbToPcm(-2), audioCtx.currentTime);
audioSources.click.gainNode2.gain.setValueAtTime(dbToPcm(-15), audioCtx.currentTime);
audioSources.land.gainNode2.gain.setValueAtTime(dbToPcm(0), audioCtx.currentTime);
audioSources.glitch.gainNode2.gain.setValueAtTime(dbToPcm(-9), audioCtx.currentTime);
audioSources.layerComplete.gainNode2.gain.setValueAtTime(dbToPcm(0), audioCtx.currentTime);
audioSources.noise.gainNode2.gain.setValueAtTime(dbToPcm(-21), audioCtx.currentTime);


// INIT VARIABLES
var canvasConsoleLines = []; // Each item in array is rendered as a new line.
var lastFrame = -1; // When equal to -1, intervalSinceLastFrame is set at 0.
var circle = { radPos: 0, grid: [], layersAddedHeight: [], };
var rotation = 0; // counter-clockwise rotation = -1 // no rotation = 0 // clockwise rotation = 1
var circleRotCurrentSpeed = 0;
var movingBlock = null;
var paused = false;
var gameInProgress = false;
var animationSpeedFactor = 1;
var ffCirclePhase = 0;
var changeCircleHue;
var circleColor;
var glitchColor = '#ffffff';
var slideHue = blockSlideHueMean;
var lastNewTreeCells = null; // LastNewTreeCells is an array of all cells from last new tree. Each cell is an array: [layer, radPos].
var windowScaling; // WindowScaling is equal to the number of pixels high the aspect ratio is.
    // WindowScaling * minAspectRatio is equal to the number of pixels wide the aspect ratio is.
var resizeLagTimeoutId; //
var mousemoveHoverUpdateBlocked = false;
var controlIconsOpacity = 0;
var arrowLeftRelWidth = arrowOffRelWidth;
var arrowRightRelWidth = arrowOffRelWidth;
var ffArrowRelWidth = ffArrowOffRelWidth;
var ffArrowImgCoordY = 0;
var audioIconCoordX = 0;
var audioIconCoordY = 0;
var controls = {
    ArrowDown: { blocked: false, },
            // Blocking key prevents key from being triggered more than once when held down.
    ArrowLeft: {
        lastActiveRank: -1, // 0-3 is active // -1 is inactive
        blocked: false,
            // Blocking key prevents key from being triggered more than once when held down.
    },
    ArrowRight: {
        lastActiveRank: -1, // 0-3 is active // -1 is inactive
        blocked: false,
            // Blocking key prevents key from being triggered more than once when held down.
    },
    mouse: {
        lastActiveRank: -1, // 0-3 is active // -1 is inactive // -2 is active in fast-forward/audio area.
        position: null, // -1 = left // 1 = right // 0 = fast-forward // 11 = audio-icon
    },
    touch: {
        lastActiveRank: -1, // 0-3 is active // -1 is inactive // -2 is active in fast-forward/audio area.
        position: null, // -1 = left // 1 = right // 0 = fast-forward // 11 = audio-icon
        activeIDs: [], // Stores touch identifiers in the order that they were created.
            // First touch in the array is the most recent.
    },
};


// INIT VARIABLES THAT CHANGE AUTOMATICALLY AS LEVEL NUMBER CHANGES
var level = -1;
var levelsPerNewTree = null;
var blockSlideTime = null; // seconds
var blockFallTimeOffset = null; // seconds
var glitchExponCurve = null; // 0<X<1 is decelerating curve. X=1 is linear. X>1 is accelerating curve.


// Admin alerts
var userStartMsec = null;
var nextAlertMsec = 0;


// EVENT LISTENERS

window.addEventListener('resize', () => {
    clearTimeout(resizeLagTimeoutId);
    resizeWindow();
    resizeLagTimeoutId = setTimeout(function() { resizeWindow(); }, 400);
        // Resizes window again after delay to account for lag (debugged for iPhone 7).
});

window.addEventListener('blur', () => { // Triggered when window loses focus.
    allControlsUntrigger();
    controls.ArrowLeft.blocked = true;
    controls.ArrowRight.blocked = true;
    stopAllAudio();
});

window.addEventListener('focus', allControlsUntrigger); // Triggered when window regains focus.

window.addEventListener('keydown', event => triggerUpdateControls(event.key));

window.addEventListener('keyup', event => untriggerUpdateControls(event.key));

window.addEventListener('mousedown', event => {

    if (event.ctrlKey === false && event.button === 0) {
        controls.mouse.position = determineControlArea(event.clientX, event.clientY);
        triggerUpdateControls('mouse');

    } else { allControlsUntrigger(); };

});

window.addEventListener('mousemove', event => {

    if (document.hasFocus() === false) { return; };

    let mousePosition = determineControlArea(event.clientX, event.clientY);

    if (controls.mouse.position !== mousePosition) { // Mouse moved to new area.

        controls.mouse.position = mousePosition; // Update mouse position.

        // If mouse is down at time of position change, move mouse back to top of lastActiveRank.
        if (controls.mouse.lastActiveRank !== -1) { triggerUpdateControls('mouse');
         // Else update arrow appearance with arrowHover === true.
        } else { updateArrowsAppearance(true); };

    } else if (controls.mouse.lastActiveRank === -1 && mousemoveHoverUpdateBlocked === false) {
        updateArrowsAppearance(true);
        mousemoveHoverUpdateBlocked = true;
    };
});

window.addEventListener('mouseup', event => {
    if (event.button === 0) { untriggerUpdateControls('mouse'); };
});

window.addEventListener('touchstart', event => {
    event.preventDefault();
    touchUpdateControls(event);
});

window.addEventListener('touchmove', event => {
    event.preventDefault();
    touchUpdateControls(event);
});

window.addEventListener('touchend', event => {
    event.preventDefault();
    if (event.touches.length > 0) { touchUpdateControls(event);
    } else { untriggerUpdateControls('touch'); };
});

window.addEventListener('touchcancel', event => {
    event.preventDefault();
    if (event.touches.length > 0) { touchUpdateControls(event);
    } else { untriggerUpdateControls('touch'); };
});


// RUN GAME
changeCircleColor('none');
updateArrowsAppearance(false); // Adjusts to correct arrow transparency and size before game start.
resizeWindow();
keysIcon.style.display = 'block';
mouseIcon.style.display = 'block';
touchIcon.style.display = 'block';
arrowLeftImg.style.display = 'block';
arrowRightImg.style.display = 'block';
ffArrowImg.style.display = 'block';
audioMuteIcon.style.display = 'block';
window.requestAnimationFrame(animationFrame); // Begin animation loop.


// CONTROL FUNCTIONS (left/right arrow keys, mouse, and touch)

function determineControlArea(x, y) {

    let areaNumber = Math.round(x / window.innerWidth) * 2 - 1; // -1 is left rotation, 1 is right rotation.

    // Check if coordinate is in fast-forward area.
    let ffRadPx = ffArrowClickWidth * windowScaling / 2;
    let ffInRangeX = x > window.innerWidth / 2 - ffRadPx && x < window.innerWidth / 2 + ffRadPx;
    let ffInRangeY = y > ffArrowImgCoordY - ffRadPx && y < ffArrowImgCoordY + ffRadPx;
    if (ffInRangeX && ffInRangeY) { areaNumber = 0; // 0 is fast-forward.

    } else { // Check if coordinate is in audio icon area.
        let audioRadPx = audioIconClickWidth * windowScaling / 2;
        let audioInRangeX = x > audioIconCoordX - audioRadPx && x < audioIconCoordX + audioRadPx;
        let audioInRangeY = y > audioIconCoordY - audioRadPx && y < audioIconCoordY + audioRadPx;
        if (audioInRangeX && audioInRangeY) { areaNumber = 11; }; // 11 is audio icon.
    };

    return areaNumber;
};

function touchUpdateControls(event) {

    // Check for new touches to add to controls.touch.activeIDs.
    let activeTouchIds = []; // Touch.identifier array
    for (const touch of event.touches) {
        activeTouchIds.push(touch.identifier);
        let oldTouch = controls.touch.activeIDs.includes(touch.identifier); // Boolean
        if (oldTouch === false) { controls.touch.activeIDs.unshift(touch.identifier); };
    };

    // Check for ended touches to delete from controls.touch.activeIDs.
    for (let touchIndex = controls.touch.activeIDs.length - 1; touchIndex >= 0; touchIndex--) {
        let activeTouch = activeTouchIds.includes(controls.touch.activeIDs[touchIndex]); // Boolean
        if (activeTouch === false) { controls.touch.activeIDs.splice(touchIndex, 1); };
    };

    let latestTouchPos = 1;
    // Find latest touch in event.touches by identifier, and calculate latestTouchPos.
    for (const touch of event.touches) {
        if (controls.touch.activeIDs[0] === touch.identifier) {
            latestTouchPos = determineControlArea(touch.clientX, touch.clientY);
            break;
        };
    };

    if (controls.touch.position !== latestTouchPos || controls.touch.lastActiveRank > 0 || controls.touch.lastActiveRank === -1) {
        controls.touch.position = latestTouchPos;
        triggerUpdateControls('touch');
    };
};

function triggerUpdateControls(triggeredControl) {

    // // Pause & Unpause
    // if (triggeredControl === ' ') {

    //     if (paused) {
    //         paused = false;
    //         lastFrame = -1;
    //         window.requestAnimationFrame(animationFrame);
    //     } else { paused = true; };

    //     return;
    // };

    if (audioCtx.state === 'suspended' && audioMuted === false) {
        audioCtx.resume();
    };

    // Handle blocking all but initial event when key is held down.
    if (triggeredControl === 'ArrowLeft' || triggeredControl === 'ArrowRight' || triggeredControl === 'ArrowDown') {
        if (controls[triggeredControl].blocked) { return;
        } else { controls[triggeredControl].blocked = true; };

    } else if (triggeredControl !== 'mouse' && triggeredControl !== 'touch') { return; };

    adminAlert();

    // Determine if fast-forward or audio control has been triggered.
    if (triggeredControl === 'ArrowDown' || triggeredControl === 'mouse' || triggeredControl === 'touch') {

        if (triggeredControl === 'ArrowDown' || controls[triggeredControl].position === 0) {

            // Fast-forward control has been triggered.
            if (gameInProgress === false) { startNewGame(); };
            fastForwardOn();
            if (triggeredControl !== 'ArrowDown') {
                untriggerUpdateControls(triggeredControl);
                controls[triggeredControl].lastActiveRank = -2;
            };
            return;

        } else if (controls[triggeredControl].position === 11) {

            // Audio control has been triggered.
            if (audioMuted) {
                audioMuted = false;
                audioMuteIcon.style.display = 'none';
                audioOnIcon.style.display = 'block';
                audioCtx.resume();
                masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
                masterGain.gain.setValueAtTime(0, audioCtx.currentTime + 0.001);
                masterGain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + 0.041);
            } else {
                audioMuted = true;
                audioMuteIcon.style.display = 'block';
                audioOnIcon.style.display = 'none';
                masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
                masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime + 0.001);
                masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.041);
            };
            untriggerUpdateControls(triggeredControl);
            controls[triggeredControl].lastActiveRank = -2;
            return;
        };
    };

    let triggeredCtrlRank = controls[triggeredControl].lastActiveRank;

    for (control in controls) {

        if (control === 'ArrowDown') { continue; };

        let higherRanked = controls[control].lastActiveRank < triggeredCtrlRank || triggeredCtrlRank < 0;
        if (higherRanked && controls[control].lastActiveRank >= 0) {
            controls[control].lastActiveRank += 1;
        };
    };

    controls[triggeredControl].lastActiveRank = 0;

    updateRotation(triggeredControl);
};

function untriggerUpdateControls(untriggeredControl) {

    if (untriggeredControl === 'Meta') {
        allControlsUntrigger();
        return;
    };

    if (untriggeredControl === 'ArrowLeft' || untriggeredControl === 'ArrowRight' || untriggeredControl === 'ArrowDown') {
        controls[untriggeredControl].blocked = false;
        if (untriggeredControl === 'ArrowDown') { return; };

    } else if (untriggeredControl !== 'mouse' && untriggeredControl !== 'touch') { return; };

    let highestRank = -1;
    let highestRankControl = null;
    let untriggeredControlRank = controls[untriggeredControl].lastActiveRank;
    if (untriggeredControlRank === -1) { return; };
    controls[untriggeredControl].lastActiveRank = -1;

    for (control in controls) {

        if (control === 'ArrowDown') { continue; };

        if (controls[control].lastActiveRank > untriggeredControlRank && controls[control].lastActiveRank > 0) {
            controls[control].lastActiveRank += -1;
        };

        let rotationControl = controls[control].position !== 0 && controls[control].position !== 11;
        let highestSoFar = controls[control].lastActiveRank < highestRank || highestRank < 0;
        if (rotationControl && highestSoFar && controls[control].lastActiveRank >= 0) {
            highestRank = controls[control].lastActiveRank;
            highestRankControl = control;
        };
    };

    if (highestRank < 0) { // No active controls.

        rotation = 0;
        mousemoveHoverUpdateBlocked = false;
        updateArrowsAppearance(untriggeredControl === 'mouse');
        stopAudio('spin');

    } else { updateRotation(highestRankControl); }; // There is a [next-highest-ranking] control currently active.
};

function allControlsUntrigger() {
    untriggerUpdateControls('touch');
    untriggerUpdateControls('mouse');
    untriggerUpdateControls('ArrowLeft');
    untriggerUpdateControls('ArrowRight');
    updateArrowsAppearance(false);
};

function updateRotation(triggeredControl) { // Pass in a string that is a valid key (name of control) in the controls object.

    if (rotation === 0) { playAudio('spin'); };

    let rightTouch = (triggeredControl === 'touch' && controls.touch.position === 1);
    let rightMouse = (triggeredControl === 'mouse' && controls.mouse.position === 1);

    if (rightTouch || rightMouse || triggeredControl === 'ArrowRight') { rotation = 1;
    } else { rotation = -1; };

    updateArrowsAppearance(false);

    if (gameInProgress === false) { startNewGame(); };
};

function updateArrowsAppearance(arrowHover) {
    // arrowHover is a boolean, which determines whether or not to use the arrow hover styling on the arrow nearest to the mouse.

    let arrows = {
        '11': {},
        '0': { image: ffArrowImg, },
        '-1': { image: arrowLeftImg, },
        '1': { image: arrowRightImg, },
    };

    for (arrowNumber in arrows) {

        // Audio control arrow
        if (arrowNumber == '11') {

            if (arrowHover && controls.mouse.position === 11) { // Hover styling
                audioMuteIcon.style.opacity = arrowOnOpacity;
                audioOnIcon.style.opacity = arrowOnOpacity;

            } else { // Non-hover styling
                audioMuteIcon.style.opacity = arrowOffOpacity;
                audioOnIcon.style.opacity = arrowOffOpacity;
            };

        // Fast-forward arrow
        } else if (arrowNumber == '0') {

            if (animationSpeedFactor !== 1) { // On styling
                arrows[0].image.style.opacity = arrowOnOpacity;
                arrows[0].width = ffArrowOnRelWidth;

            } else if (arrowHover && controls.mouse.position === 0) { // Hover styling
                arrows[0].image.style.opacity = arrowHoverOpacity;
                arrows[0].width = ffArrowHoverRelWidth;

            } else { // Off styling
                arrows[0].image.style.opacity = arrowOffOpacity;
                arrows[0].width = ffArrowOffRelWidth;
            };

        // Rotation arrow
        } else {

            if (arrowHover && arrowNumber == controls.mouse.position) { // Hover styling
                arrows[arrowNumber].image.style.opacity = arrowHoverOpacity;
                arrows[arrowNumber].width = arrowHoverRelWidth;

            } else if (arrowNumber == rotation) { // On styling
                arrows[arrowNumber].image.style.opacity = arrowOnOpacity;
                arrows[arrowNumber].width = arrowOnRelWidth;

            } else { // Off styling
                arrows[arrowNumber].image.style.opacity = arrowOffOpacity;
                arrows[arrowNumber].width = arrowOffRelWidth;
            };
        };
    };

    ffArrowRelWidth = arrows['0'].width;
    arrowLeftRelWidth = arrows['-1'].width;
    arrowRightRelWidth = arrows['1'].width;

    resizeArrows();
};

function resizeArrows() {

    let arrowsFromSide = window.innerWidth / 2 - (ringRadius + arrowsDistBesideRing) * windowScaling;
    let arrowLeftWidth = arrowLeftRelWidth * windowScaling;
    let arrowLeftHeight = arrowSourceHeightPx * arrowLeftWidth / arrowSourceWidthPx;
    let arrowRightWidth = arrowRightRelWidth * windowScaling;
    let arrowRightHeight = arrowSourceHeightPx * arrowRightWidth / arrowSourceWidthPx;
    let ffArrowWidth = ffArrowRelWidth * windowScaling;
    let ffArrowHeight = ffArrowImgSourceHeightPx * ffArrowWidth / ffArrowImgSourceWidthPx;

    ffArrowImgCoordY = window.innerHeight / 2 + (ringRadius + ffArrowImgDistBelowRing) * windowScaling;

    arrowLeftImg.style.width = arrowLeftWidth + 'px';
    arrowLeftImg.style.transform = 'scaleX(-1)';
    arrowLeftImg.style.left = arrowsFromSide - arrowLeftWidth / 2 + 'px';
    arrowLeftImg.style.top = (window.innerHeight - arrowLeftHeight) / 2 + 'px';

    arrowRightImg.style.width = arrowRightWidth + 'px';
    arrowRightImg.style.right = arrowsFromSide - arrowRightWidth / 2 + 'px';
    arrowRightImg.style.top = (window.innerHeight - arrowRightHeight) / 2 + 'px';

    ffArrowImg.style.width = ffArrowWidth + 'px';
    ffArrowImg.style.left = (window.innerWidth - ffArrowWidth) / 2 + 'px';
    ffArrowImg.style.top = ffArrowImgCoordY - ffArrowHeight / 2 + 'px';
};


// RESPONSIVE WINDOW SIZE

function resizeWindow() {

    windowScaling = Math.min(window.innerWidth / minAspectRatio, window.innerHeight);

    canvas1.width = window.innerWidth;
    canvas1.height = window.innerHeight;
    ctx1.translate(window.innerWidth / 2, window.innerHeight / 2);
    ctx1.scale(windowScaling, windowScaling);

    audioIconCoordX = window.innerWidth / 2 + (ringRadius + audioIconsDistBesideRing) * windowScaling;
    audioIconCoordY = window.innerHeight / 2 + (ringRadius + audioIconsDistBelowRing) * windowScaling;
    audioMuteIcon.style.left = audioIconCoordX - audioIconsHeight * audioIconsAspRatio * windowScaling / 2 + 'px';
    audioOnIcon.style.left = audioIconCoordX - audioIconsHeight * audioIconsAspRatio * windowScaling / 2 + 'px';
    audioMuteIcon.style.top = audioIconCoordY - audioIconsHeight * windowScaling / 2 + 'px';
    audioOnIcon.style.top = audioIconCoordY - audioIconsHeight * windowScaling / 2 + 'px';
    audioMuteIcon.style.height = audioIconsHeight * windowScaling + 'px';
    audioOnIcon.style.height = audioIconsHeight * windowScaling + 'px';

    gameOverText.style.fontSize = Math.round(gameOverTextSize * windowScaling) + 'px';

    let levelTextFontSize = Math.round(levelTextSize * windowScaling);
    levelText.style.fontSize = levelTextFontSize + 'px';
    levelText.style.top = (window.innerHeight - levelTextFontSize) / 2 - (ringRadius + levelTextDistAboveRing) * windowScaling + 'px';

    if (level === -1) { // Adjust only before game start.

        keysIcon.style.height = controlIconsHeight * windowScaling + 'px';
        keysIcon.style.left = window.innerWidth / 2 - (controlIconsSpacing + controlIconsHeight * keysIconAspRatio / 2) * windowScaling + 'px';
        keysIcon.style.top = window.innerHeight / 2 - (ringRadius + controlIconsDistAboveRing + controlIconsHeight / 2) * windowScaling + 'px';

        mouseIcon.style.height = controlIconsHeight * windowScaling + 'px';
        mouseIcon.style.left = window.innerWidth / 2 - (controlIconsHeight * mouseIconAspRatio / 2) * windowScaling + 'px';
        mouseIcon.style.top = window.innerHeight / 2 - (ringRadius + controlIconsDistAboveRing + controlIconsHeight / 2) * windowScaling + 'px';

        touchIcon.style.height = controlIconsHeight * windowScaling + 'px';
        touchIcon.style.right = window.innerWidth / 2 - (controlIconsSpacing + controlIconsHeight * touchIconAspRatio / 2) * windowScaling + 'px';
        touchIcon.style.top = window.innerHeight / 2 - (ringRadius + controlIconsDistAboveRing + controlIconsHeight / 2) * windowScaling + 'px';
    };

    resizeArrows();
};


// GAMEPLAY FUNCTIONS

function newMovingBlock() {

    newBlock = {
        width: randInt(minBlockWidth, maxBlockWidth, 2), // Random integer; either 2, 3, or 4.
        radPos: randFloat(0, numRadPos), // 0 <= radPos (radial position units) < numRadPos
        height: blockStartHeight + layerHeights[layerHeights.length - 2], // windowScaling factors
        state: 'fixed', // moving or fixed
        friction: 0, // 0 (no rotation with circle) <= friction <= 1 (same rotation as circle)
        layer: maxNumLayers - 1, // 0 is the lowest layer (touching circle).
    };

    return newBlock;
};

function glitchSequence() {

    let numGlitches = randInt(1, 12, glitchExponCurve);
    let lastGlitchTime = 0.4; // Seconds before glitchSequence begins. (Additional random duration added to this before first glitch.)

    for (let glitch = 0; glitch < numGlitches; glitch++) {

        let thisGlitchTime = lastGlitchTime + randFloat(0.07, 0.4, 4); // random timing setting

        // Schedule remove previously created glitch block.
        if (glitch > 0) {
            erasePrevGlitchTime = lastGlitchTime + (thisGlitchTime - lastGlitchTime) * randFloat(0.3, 0.8);
                // RandFloat above represents percentage of duration between glitches.
            setTimeout(function() { movingBlock = null; }, erasePrevGlitchTime * 1000);
                // Erase previous glitch at random moment that is after lastGlitchTime and before thisGlitchTime.
        };

        // Schedule create current glitch block.
        setTimeout(function() {
            movingBlock = newMovingBlock();
            let saturation = 0;
            if (Math.random() < 0.4) { saturation = 0.8; };
                // Saturation settings: probability and saturation/lightness level.
            glitchColor = `hsl(${randInt(0, 359)}, ${saturation * 100}%, ${100 - saturation * 50}%)`;
            triggerGlitchAudio();
        }, thisGlitchTime * 1000);

        lastGlitchTime = thisGlitchTime;
    };

    // Determine whether or not to generate new tree.
    if (mod(level + 1, levelsPerNewTree) === 0) {

        let newTreeCreated = newTree(); // Returns boolean.

        if (newTreeCreated && animationSpeedFactor === 1) {

            let now = audioCtx.currentTime;

            // New tree audio.
            audioSourceStart('noise');
            audioSources.noise.gainNode1.gain.setValueAtTime(dbToPcm(treeGainRampStart), now);
            audioSources.noise.gainNode1.gain.exponentialRampToValueAtTime(dbToPcm(treeGainRampEnd), now + lastGlitchTime);
            audioSources.noise.gainNode1.gain.setValueAtTime(dbToPcm(treeGainJump), now + lastGlitchTime + 0.001);
            audioSources.noise.gainNode1.gain.setValueAtTime(0, now + lastGlitchTime + 0.001 + treeGainJumpDuration);
        };
    };

    setTimeout(function() {

        fastForwardOff();
        movingBlock.state = 'moving'; // Change the last glitch block to moving state.

        if (lastNewTreeCells !== null) { // Change tree to final lightness value.

            let randLightness = randFloat(0, 1); // Adds random fractional amount to layer to determine lightness variation.

            for (const treeCell of lastNewTreeCells) {
                let blockLightness = (treeCell[0] + randLightness) / (maxNumLayers - 1) * blockLightnessMaxChange + blockLowestLayerLightness;
                let thisBlock = circle.grid[treeCell[0]][treeCell[1]];
                thisBlock.hsl = [0, 0, blockLightness, ];
            };

            lastNewTreeCells = null;
        };

    }, lastGlitchTime * 1000);
};

function nextLevel() {

    level += 1;
    levelText.innerText = level;

    // Increase difficulty.
    blockFallTimeOffset = Math.pow(2, -level / halfLifeLevels) * (startBlockFallTimeOffset - limitBlockFallTimeOffset) + limitBlockFallTimeOffset;
    glitchExponCurve = Math.pow(2, -level / halfLifeLevels) * (startGlitchExponCurve - limitGlitchExponCurve) + limitGlitchExponCurve;
    blockSlideTime = Math.pow(2, -level / halfLifeLevels) * (startBlockSlideTime - limitBlockSlideTime) + limitBlockSlideTime;
    levelsPerNewTree = Math.round(Math.pow(2, -level / halfLifeLevels) * (startLevelsPerNewTree - limitLevelsPerNewTree) + limitLevelsPerNewTree);

    glitchSequence();
};

function initLayer() {

    function initBlock() { return { blockHere: false, height: 0, hsl: [0, 0, 50, ], }; };
    let layerArray = []; // Initialize circle.grid.
    for (let i = 0; i < numRadPos; i++) { layerArray.push(initBlock()); };
    return layerArray;
};

function startNewGame() {

    cancelScheduledAudioEvents('glitch');
    audioSources.glitch.gainNode1.gain.setValueAtTime(1, audioCtx.currentTime);

    gameInProgress = true;
    movingBlock = null;
    level = -1;

    ffCirclePhase = 0;
    changeCircleColor('none');

    circle = {
        radPos: 0, // radial position units
        grid: [], // Encodes the spaces taken up by all blocks in the circle state.
            //  Array of arrays: circle.grid[layerNumber][radPosNumber][key] // keys: blockHere, height, hsl
        layersAddedHeight: [], // Additional height above default layerHeights.
            // This value is non-zero for a layer after a layer below has been completed/removed and the layer is falling.
    };

    // Populate beginning values of circle.grid and circle.layersAddedHeight.
    for (let i = 0; i < maxNumLayers; i++) {
        circle.grid.push(initLayer()); // circle.grid has empty layer array for each layer.
        circle.layersAddedHeight.push(0); // layersAddedHeight is 0 for each layer.
    };

    levelText.style.display = 'block';
    keysIcon.style.display = 'none';
    mouseIcon.style.display = 'none';
    touchIcon.style.display = 'none';
    gameOverText.style.display = 'none';

    nextLevel();
};

function changeCircleColor(hue) { // For no saturation, set hue to 'none'.

    let saturation = 100;
    let centerLightness = 50;

    if (hue === 'none') {
        hue = 0;
        saturation = 0;
        centerLightness = 66;
    };

    circleColor = ctx1.createLinearGradient(0, circleRadius * (ffCirclePhase * 2 + 1), 0, circleRadius * (ffCirclePhase * 2 - 3));
    circleColor.addColorStop(0, `hsl(${hue}, ${saturation}%, 20%)`);
    circleColor.addColorStop(0.25, `hsl(${hue}, ${saturation}%, ${centerLightness}%)`);
    circleColor.addColorStop(0.5, `hsl(${hue}, ${saturation}%, 20%)`);
    circleColor.addColorStop(0.75, `hsl(${hue}, ${saturation}%, ${centerLightness}%)`);
    circleColor.addColorStop(1, `hsl(${hue}, ${saturation}%, 20%)`);
};

function moveObjects(intervalSinceLastFrame) {

    // Change background rectangle transparencies.
    if (movingBlock !== null) {
        if (movingBlock.friction !== 0) {
            for (let rect = 0; rect < bgTexture.length; rect++) {
                let opacityChangeRate = rect / (bgTexture.length - 1) * (bgRectsOpacityMaxChangeRate - bgRectsOpacityMinChangeRate) + bgRectsOpacityMinChangeRate;
                let newOpacity = bgTexture[rect].opacity + 2 * intervalSinceLastFrame / opacityChangeRate;
                if (newOpacity > 1) { newOpacity += -2; };
                bgTexture[rect].opacity = newOpacity;
            };
        };
    };

    // Move circle gradient phase during fast-forward.
    if (animationSpeedFactor !== 1) {
        ffCirclePhase = mod(ffCirclePhase + intervalSinceLastFrame * ffCircleChangeRate, 1);
        changeCircleHue = 'none'; // Change circle color to have no saturation/hue.
    };

    let rotationThisFrame = rotation;

    // Update variable circle rotation speed.
    if (rotationThisFrame === 0) { circleRotCurrentSpeed = 0;
    } else if (circleRotCurrentSpeed === 0) { circleRotCurrentSpeed = circleRotInitSpeed;
    } else { // Circle rotation speed is accelerating from initial speed to terminal speed.
        // Calculate current speed.
        prevAccelTime = Math.pow((circleRotCurrentSpeed - circleRotInitSpeed) / (circleRotTermSpeed - circleRotInitSpeed), 1 / circleRotAccelExponCurve);
        currentAccelTime = Math.min(prevAccelTime + (intervalSinceLastFrame / circleRotAccelTime), 1);
        circleRotCurrentSpeed = Math.pow(currentAccelTime, circleRotAccelExponCurve) * (circleRotTermSpeed - circleRotInitSpeed) + circleRotInitSpeed;
    };

    // Move circle.
    circleRotateAmount = circleRotCurrentSpeed * intervalSinceLastFrame * rotationThisFrame / animationSpeedFactor; // negative (left) or positive (right)
    circle.radPos = mod(circle.radPos + circleRotateAmount, numRadPos);

    // Check each layer to see if complete.
    for (let layer = 0; layer < circle.grid.length; layer++) {

        // Test if this layer is complete.
        let layerComplete = true; // Initialized to true. Then checked if false in for loop below.
        for (const position of circle.grid[layer]) {
            if (position.blockHere === false) {
                layerComplete = false;
                break;
            };
        };

        if (layerComplete) {

            playAudio('layerComplete');

            circle.grid.splice(layer, 1); // Delete completed layer in circle.grid.
            circle.grid.push(initLayer()); // Add empty top layer.

            // For all layers above deleted layer.
            for (let fallingLayer = layer; fallingLayer < maxNumLayers; fallingLayer++) {

                // Add height to layers above deleted layer.
                circle.layersAddedHeight[fallingLayer] = layerHeights[fallingLayer + 1] - layerHeights[fallingLayer];

                // Change lightness for layers above deleted layer.
                for (let radPos = 0; radPos < numRadPos; radPos++) {
                    let newLightness = circle.grid[fallingLayer][radPos].hsl[2] - blockLightnessMaxChange / maxNumLayers;
                    circle.grid[fallingLayer][radPos].hsl[2] = Math.max(newLightness, 0);
                };
            };

            if (lastNewTreeCells !== null) { // Delete or update layer numbers in lastNewTreeCells.
                for (let treeCell = lastNewTreeCells.length - 1; treeCell >= 0; treeCell--) {
                    if (lastNewTreeCells[treeCell][0] === layer) {
                        lastNewTreeCells.splice(treeCell, 1);
                    } else if (lastNewTreeCells[treeCell][0] > layer) {
                        lastNewTreeCells[treeCell][0] += -1;
                    };
                };
            };
        };
    };

    // Move fixed blocks (after layer completion).
    for (let layer = 0; layer < maxNumLayers; layer++) {

        let height = layerHeights[layer] + circle.layersAddedHeight[layer];
        let newHeight = calculateFallingHeight(height);
        let newAddedHeight = Math.max(newHeight - layerHeights[layer], 0)
        circle.layersAddedHeight[layer] = newAddedHeight;
    };

    // MOVE movingBlock (here to end of function).

    // Don't continue calculation unless movingBlock.state === 'moving'.
    if (movingBlock === null) { return;
    } else if (movingBlock.state === 'fixed') {
        movingBlock.radPos += -circleRotateAmount;
        return;
    };

    // Calculate snapDirection.
    let snapDirection = 0; // init before calc
    let blockSnapTargetDistance = Math.round(movingBlock.radPos) - movingBlock.radPos;
    if (blockSnapTargetDistance > 0) { snapDirection = 1; // Positive snap direction.
    } else if (blockSnapTargetDistance < 0) { snapDirection = -1; }; // Negative snap direction.

    // Logic tests to determine whether or not to perform fallSnap.
    let hypoSnapBlock = { radPos: Math.round(movingBlock.radPos), layer: movingBlock.layer, width: movingBlock.width };
    let canFallAtSnapTarget = limitDown(hypoSnapBlock) < movingBlock.height;
    let cantFallHere = limitDown(movingBlock) >= movingBlock.height;
    let withinRange = Math.abs(blockSnapTargetDistance) <= autoSnapMaxDistance;
    let fallSnap = (canFallAtSnapTarget && cantFallHere && withinRange && rotationThisFrame === 0);

    // Determine snap amount.
    let snapAmount = 0; // init before calc
    if (movingBlock.friction === 1 || fallSnap) {
        // Snap toward integer radPos.
        snapAmount = Math.min(snapSpeed * intervalSinceLastFrame, Math.abs(blockSnapTargetDistance)) * snapDirection;
    };

    // Rotation limit variables
    let radPosToLeft = Math.floor(movingBlock.radPos - 1); //  NO MODULUS! Initialize radPosToLeft as next cell.
    let radPosToRight = Math.ceil(movingBlock.radPos + movingBlock.width); // NO MODULUS! Initialize radPosToRight as next cell.
    let limitLeft = radPosToLeft - movingBlock.radPos; // init before possible change
    let limitRight = radPosToRight - movingBlock.width + 1 - movingBlock.radPos; // init before possible change

    if (movingBlock.layer !== maxNumLayers) {
        // Change limitLeft and limitRight.

        if (blockedRadPos(radPosToLeft)) { limitLeft = radPosToLeft + 1 - movingBlock.radPos;
        } else { limitLeft = radPosToLeft - movingBlock.radPos; };

        if (blockedRadPos(radPosToRight)) { limitRight = radPosToRight - movingBlock.width - movingBlock.radPos;
        } else { limitRight = radPosToRight - movingBlock.width + 1 - movingBlock.radPos; };
    };

    let limitDownward; // Calculated within either if or else blocks below.

    if (movingBlock.friction < 1 || snapAmount !== 0) {
        // Continue normal block rotation.

        blockRotateAmountUnlimited = circleRotateAmount * (movingBlock.friction - 1) + snapAmount;
        blockRotateAmountLimited = Math.min(Math.max(blockRotateAmountUnlimited, limitLeft), limitRight);
        newMovingBlockRadPos = mod(movingBlock.radPos + blockRotateAmountLimited, numRadPos);

        // Mute/unmute click audio.
        if (movingBlock.friction !== 0) {
            if (movingBlock.radPos === newMovingBlockRadPos) {
                if (audioSources.click.gainNode1.gain.value !== 0) { audioSources.click.gainNode1.gain.setValueAtTime(0, audioCtx.currentTime); }; // Mute clicks.
            } else if (audioSources.click.gainNode1.gain.value !== 1) { audioSources.click.gainNode1.gain.setValueAtTime(1, audioCtx.currentTime); }; // Unmute clicks.
        };

        movingBlock.radPos = newMovingBlockRadPos;
        limitDownward = limitDown(movingBlock);

    } else { // Complete snap motion.

        stopAudio('slide');
        audioSources.click.gainNode1.gain.setValueAtTime(0, audioCtx.currentTime); // Mute clicks.
        audioSourceStart('finalClick');
        audioSources.finalClick.gainNode1.gain.setValueAtTime(1, audioCtx.currentTime);

        movingBlock.radPos = Math.round(movingBlock.radPos);
        limitDownward = limitDown(movingBlock);

        if (limitDownward >= movingBlock.height) {
            // MovingBlock will not resume falling next frame.

            if (movingBlock.layer >= maxNumLayers - 1) {

                // Game over.
                gameInProgress = false;
                animationSpeedFactor = 1;
                stopAllAudio();
                controlIconsOpacity = 0;
                arrowLeftImg.style.opacity = arrowOffOpacity;
                arrowLeftRelWidth = arrowOffRelWidth;
                arrowRightImg.style.opacity = arrowOffOpacity;
                arrowRightRelWidth = arrowOffRelWidth;
                ffArrowImg.style.opacity = arrowOffOpacity;
                ffArrowRelWidth = ffArrowOffRelWidth;
                resizeArrows();
                gameOverText.style.display = 'block';

            } else { // Next level.

                fastForwardOff();
                changeCircleHue = 'none'; // Change circle color to have no saturation/hue.

                let randLightness = randFloat(0, 1); // Add a random fractional amount to layer number to add variation to blockLightness
                let blockLightness = (movingBlock.layer + randLightness) / (maxNumLayers - 1) * blockLightnessMaxChange + blockLowestLayerLightness;

                // Loop through cells of movingBlock and add cells to circle.grid.
                for (let cell = 0; cell < movingBlock.width; cell++) {
                    let block = circle.grid[movingBlock.layer][mod(Math.round(movingBlock.radPos + cell), numRadPos)];
                    block.blockHere = true;
                    block.hsl[2] = blockLightness;
                };

                movingBlock = null;
                nextLevel();
            };

            return; // Skip fall calculation (here to end of function).
        };
    };

    let newBlockHeight = Math.max(calculateFallingHeight(movingBlock.height), limitDownward);

    if (movingBlock.height > newBlockHeight) { // Block can fall.

        if (movingBlock.friction !== 0) { // First frame falling.

            changeCircleHue = 'none'; // Change circle color to have no saturation/hue.

            fastForwardOff();
            stopAudio('slide');
            cancelClickAudio();
            hardRamp('land', 0, 0.040);
            triggerGlitchAudio();
        };

        movingBlock.friction = 0;

        // If block would fall to or past the base of the layer on this frame.
        if (movingBlock.height > layerHeights[movingBlock.layer] && newBlockHeight <= layerHeights[movingBlock.layer]) {
            // Limit fall to base of current layer to allow for a slide between two existing blocks.
            newBlockHeight = layerHeights[movingBlock.layer];
        };

        movingBlock.height = newBlockHeight; // Change value of block.height.

        // Update layer number.
        movingBlock.layer = maxNumLayers; // Initialized to layer above highest. Remains if found not lower than any defined layer.
        for (let layerNumber = 0; layerNumber < maxNumLayers; layerNumber++) {

            if (movingBlock.height < layerHeights[layerNumber + 1]) {
                movingBlock.layer = layerNumber;
                break;
            };
        };

    } else { // Block cannot fall.

        if (movingBlock.layer === maxNumLayers - 1) {
            // If in danger of game over, circle through all hues 30 times total, starting/ending at hue 237.
            slideHue = mod(237 + (1 - Math.pow(movingBlock.friction, 0.04)) * 360 * 30, 360);

        } else if (Math.abs(blockSlideHueMean - slideHue) > blockSlideHueMaxChange) {
            // If slideHue is out of range, reassign random slideHue within range.
            slideHue = blockSlideHueMean + blockSlideHueMaxChange * (Math.random() * 2 - 1);

        } else {
            // Randomized change to slideHue.
            let newSlideHueChange = blockSlideHueChangeRate * intervalSinceLastFrame * (Math.floor(Math.random() * 2) * 2 - 1);
            if (Math.abs(slideHue + newSlideHueChange - blockSlideHueMean) > blockSlideHueMaxChange) { newSlideHueChange *= -1; };
            slideHue += newSlideHueChange;
        };

        if (fallSnap === false) { changeCircleHue = slideHue; }; // Change circle color to slideHue.

        if (movingBlock.friction === 0 && fallSnap === false) { // First frame not falling.

            movingBlock.height = layerHeights[movingBlock.layer];

            fastForwardOff();
            playAudio('land');
            playAudio('slide');
            triggerClickAudio();
        };

        if (fallSnap === false) {

            // Increase friction.
            newLinearFriction = Math.pow(movingBlock.friction, 1 / blockFrictionexponCurve) + intervalSinceLastFrame / blockSlideTime;
            movingBlock.friction = Math.min(Math.pow(newLinearFriction, blockFrictionexponCurve), 1);
        };
    };

    function blockedRadPos(radPos) { // Test for blockHere at positions adjacent to movingBlock. Returns boolean.

        occupiedThisLayer = circle.grid[movingBlock.layer][mod(radPos, numRadPos)].blockHere; // Adjacent position in same layer is occupied.
        blockAlsoInLayerAbove = movingBlock.height !== layerHeights[movingBlock.layer]; // MovingBlock is occupying some space in layer above.
        occupiedLayerAbove = circle.grid[Math.min(movingBlock.layer + 1, maxNumLayers - 1)][mod(radPos, numRadPos)].blockHere;
            // Adjacent position in layer above is occupied.
        return occupiedThisLayer || (blockAlsoInLayerAbove && occupiedLayerAbove); // boolean
    };

    function limitDown(block) { // Returns the limit of downward motion of a given block object.

        let layerBelow = Math.max(block.layer - 1, 0);
        let fallFloor = layerHeights[layerBelow];
            // Fall floor is initialized to be the floor of the layer below.
            // Might be changed to the floor of the current layer.

        for (let cellNumber = 0; cellNumber < block.width; cellNumber++) {

            // If the left-most position beneath each cell is occupied.
            if (circle.grid[layerBelow][mod(Math.floor(block.radPos + cellNumber), numRadPos)].blockHere) {
                fallFloor = layerHeights[layerBelow + 1]; // Fall floor is changed to be the floor of the current layer.
                break;
            };
        };

        // If the right-most position beneath the right-most cell is occupied.
        if (circle.grid[layerBelow][mod(Math.ceil(block.radPos + block.width - 1), numRadPos)].blockHere) {
            fallFloor = layerHeights[layerBelow + 1]; // Fall floor is changed to be the floor of the current layer.
        };

        return fallFloor;
    };

    function calculateFallingHeight(blockHeight) { // Returns updated height.

        let elapsedFallDistance = blockStartHeight + layerHeights[layerHeights.length - 2] - blockHeight;
        let elapsedFallTime = Math.pow(elapsedFallDistance / blockFallAccelRate + Math.pow(blockFallTimeOffset, 2), 0.5) - blockFallTimeOffset;
        let newElapsedFallTime = elapsedFallTime + intervalSinceLastFrame;
        let newElapsedFallDistance = newElapsedFallTime * (newElapsedFallTime + 2 * blockFallTimeOffset) * blockFallAccelRate;
        let newHeight = blockStartHeight + layerHeights[layerHeights.length - 2] - newElapsedFallDistance;
        return newHeight;
    };
};

function animationFrame(timestamp) {

    let intervalSinceLastFrame = (timestamp / 1000 - lastFrame) * animationSpeedFactor;
    if (lastFrame === -1) { intervalSinceLastFrame = 0; };
    lastFrame = timestamp / 1000;

    changeCircleHue = false; // Initialized to false.

    if (gameInProgress) { moveObjects(intervalSinceLastFrame);

    } else { // Changing control icon and game over text opacity.

        controlIconsOpacity = mod(controlIconsOpacity + intervalSinceLastFrame / 1.5, 3);

        if (level === -1) {
            keysIcon.style.opacity = 0.2 + (1 - mod(controlIconsOpacity - 0, 3) / 3) * 0.8;
            mouseIcon.style.opacity = 0.2 + (1 - mod(controlIconsOpacity - 1, 3) / 3) * 0.8;
            touchIcon.style.opacity = 0.2 + (1 - mod(controlIconsOpacity - 2, 3) / 3) * 0.8;

        } else {
            let gameOverTextOpacity = 0.2 + (1 - mod(controlIconsOpacity - 0, 3) / 3) * 0.8;
            gameOverText.style.color = `hsla(0, 0%, 100%, ${gameOverTextOpacity})`;
        };
    };

    // Draw black background (rectangle).
    ctx1.fillStyle = '#000000';
    ctx1.fillRect(canvas1.width / -2, canvas1.height / -2, canvas1.width, canvas1.height);

    drawObjects(intervalSinceLastFrame);

    if (animationSpeedFactor !== 1 || gameInProgress === false) {

        // Draw blur.
        ctx1.save();
        ctx1.scale(0.96, 0.96);
        ctx1.globalAlpha = 0.4;
        drawObjects(intervalSinceLastFrame);
        ctx1.restore();
        //
        ctx1.save();
        ctx1.scale(0.91, 0.91);
        ctx1.globalAlpha = 0.15;
        drawObjects(intervalSinceLastFrame);
        ctx1.restore();

        if (gameInProgress === false) {

            // Dim screen.
            ctx1.save();
            ctx1.fillStyle = `hsla(0, 0%, 0%, ${gameOverDimLevel})`;
            ctx1.fillRect(canvas1.width / -2, canvas1.height / -2, canvas1.width, canvas1.height);
            ctx1.restore();
        };
    };

    // // Show Aspect Ratio
    // ctx1.save();
    // ctx1.fillStyle = 'hsla(60, 100%, 50%, 0.06)';
    // ctx1.fillRect(minAspectRatio / -2 * 0.96, -0.5 * 0.96, minAspectRatio * 0.96, 1 * 0.96);
    // ctx1.fillRect(minAspectRatio / -2, -0.5, minAspectRatio, 1);
    // ctx1.restore();

    // // Show fast-forward click area.
    // ctx1.save();
    // ctx1.fillStyle = 'hsla(60, 100%, 50%, 0.06)';
    // ctx1.fillRect(ffArrowClickWidth / -2, (ffArrowImgCoordY - window.innerHeight / 2) / windowScaling - ffArrowClickWidth / 2, ffArrowClickWidth, ffArrowClickWidth);
    // ctx1.restore();

    // // Show audio icon click area.
    // ctx1.save();
    // ctx1.fillStyle = 'hsla(60, 100%, 50%, 0.06)';
    // ctx1.fillRect((audioIconCoordX - window.innerWidth / 2) / windowScaling - audioIconClickWidth / 2, (audioIconCoordY - window.innerHeight / 2) / windowScaling - audioIconClickWidth / 2, audioIconClickWidth, audioIconClickWidth);
    // ctx1.restore();

    // // Show canvas console.
    // ctx1.font = canvasConsoleFontSize + 'px serif';
    // ctx1.fillStyle = '#ffffff';
    // for (let i = canvasConsoleLines.length - 1; i >= 0; i--) {
    //     ctx1.fillText(`${i}: ${canvasConsoleLines[i]}`, minAspectRatio / -2 + canvasConsoleFontSize, -0.5 + canvasConsoleFontSize * (canvasConsoleLines.length - i + 1))
    // };

    if (paused === false) { window.requestAnimationFrame(animationFrame); };
};


// REQUEST ANIMATION FRAME FUNCTION
function drawObjects(intervalSinceLastFrame) {

    // Initialize alert ring settings in case movingBlock is null.
    let blockRotationAmount = 0;
    let alertArcLength = 2 * Math.PI;
    let blockAboveRing = false;

    if (movingBlock !== null) {

        if (movingBlock.friction > 0) {

            // Draw background texture.
            ctx1.save();
            ctx1.rotate((circle.radPos + movingBlock.radPos) / numRadPos * 2 * Math.PI);
            for (const rect of bgTexture) {
                ctx1.fillStyle = `hsla(${bgRectsHue}, 100%, 50%, ${Math.abs(rect.opacity)})`;
                ctx1.fillRect(rect.x, rect.y, rect.width, rect.height);
            };
            ctx1.restore();

            // Clear background texture inside ring.
            ctx1.save();
            ctx1.fillStyle = '#000000';
            ctx1.beginPath();
            ctx1.arc(0, 0, ringRadius - ringThickness / 2, 0, 2 * Math.PI, true); // counter-clockwise
            ctx1.fill();
            ctx1.restore();

            // // Draw Gridlines
            // ctx1.save();
            // ctx1.rotate(circle.radPos / numRadPos * 2 * Math.PI);
            // ctx1.lineWidth = 0.001;
            // ctx1.strokeStyle = 'hsl(237, 100%, 75%)';
            // for (let x = -3; x <= 3; x += 6) {
            //     for (let y = -3; y <= 3; y += 6) {
            //         ctx1.beginPath();
            //         ctx1.moveTo(0, 0);
            //         ctx1.lineTo(x, y);
            //         ctx1.stroke();
            //     };
            // };
            // ctx1.restore();
        };

        // Update/init variables used for drawing movingBlock and Outer Ring when movingBlock !== null.
        blockRotationAmount = mod(movingBlock.radPos + circle.radPos, numRadPos);
        alertArcLength = movingBlock.width / numRadPos * 2 * Math.PI + 1 / (layerHeights[maxNumLayers - 1] * windowScaling);
        blockAboveRing = movingBlock.height > layerHeights[maxNumLayers - 2];
        let blockTopHeight = movingBlock.height + movingBlock.height * blockRelThickness + 1 / windowScaling;
        let blockTopRadialOverlap = 1 / (blockTopHeight * windowScaling);
        let blockBottomRadialOverlap = 1 / (movingBlock.height * windowScaling);

        ctx1.save();
        ctx1.rotate(blockRotationAmount / numRadPos * 2 * Math.PI);

        if (movingBlock.state === 'moving') {

            // Draw Block Light
            ctx1.save();
            ctx1.fillStyle = blockLightColor;
            ctx1.beginPath();
            ctx1.arc(0, 0, movingBlock.height + 1 / windowScaling, movingBlock.width / numRadPos * 2 * Math.PI + blockBottomRadialOverlap, 0, true);
            ctx1.lineTo(0, 0);
            ctx1.fill();
            ctx1.restore();
        };

        // Glitch block fill
        if (movingBlock.state === 'fixed') {
            ctx1.fillStyle = glitchColor;

        // Falling block fill
        } else if (movingBlock.friction === 0) {
            ctx1.fillStyle = blockFallColor;

        } else { // Sliding block fill (changing hue)

            let slideBlockTargetLightness = (movingBlock.layer + 0.5) / (maxNumLayers - 1) * blockLightnessMaxChange + blockLowestLayerLightness;
            let slideBlockCurrentSaturation = 100 - movingBlock.friction * 100;
            if (movingBlock.layer === maxNumLayers - 1) {
                slideBlockTargetLightness = 12;
                slideBlockCurrentSaturation = 100;
            };
            let slideBlockCurrentLightness = 50 + (slideBlockTargetLightness - 50) * movingBlock.friction;
            ctx1.fillStyle = `hsl(${mod(slideHue, 360)}, ${slideBlockCurrentSaturation}%, ${slideBlockCurrentLightness}%)`;
        };

        // Draw moving block.
        ctx1.beginPath();
        ctx1.arc(0, 0, movingBlock.height, 0, movingBlock.width / numRadPos * 2 * Math.PI + blockBottomRadialOverlap, false); // Adding 1 to width-rotation and height to cover overlap.
        ctx1.arc(0, 0, blockTopHeight, movingBlock.width / numRadPos * 2 * Math.PI + blockTopRadialOverlap, 0, true);
        ctx1.fill();
        ctx1.restore();
    };

    // Draw fixed blocks.
    for (let layer = circle.grid.length - 1; layer >= 0; layer--) {
        let blockBottomRadialOverlap = 1 / (layerHeights[layer] * windowScaling); // Calculates adding 1 pixel radially for overlap.
        let blockTopRadialOverlap = 1 / (layerHeights[layer + 1] * windowScaling); // Calculates adding 1 pixel radially for overlap.
        let height = layerHeights[layer] + circle.layersAddedHeight[layer];
        for (let radPos = 0; radPos < numRadPos; radPos++) {
            let block = circle.grid[layer][radPos];
            if (block.blockHere === false) { continue; };
            let blockRotationAmount = mod(radPos + circle.radPos, numRadPos);
            ctx1.save();
            ctx1.rotate(blockRotationAmount / numRadPos * 2 * Math.PI);
            ctx1.fillStyle = `hsl(${block.hsl[0]}, ${block.hsl[1]}%, ${block.hsl[2]}%)`;
            ctx1.beginPath();
            ctx1.arc(0, 0, height, 0, 2 * Math.PI / numRadPos + blockBottomRadialOverlap, false);
                // Adding 1 to width-rotation and height to cover overlap.
            ctx1.arc(0, 0, height + height * blockRelThickness + 1 / windowScaling, 2 * Math.PI / numRadPos + blockTopRadialOverlap, 0, true);
            ctx1.fill();
            ctx1.restore();
        };
    };

    // Draw outer ring.
    ctx1.save();
    ctx1.lineWidth = ringThickness;
    ctx1.strokeStyle = ringColor;
    ctx1.rotate(blockRotationAmount / numRadPos * 2 * Math.PI);
    ctx1.beginPath();
    ctx1.arc(0, 0, ringRadius, 0, alertArcLength, true); // counter-clockwise
    ctx1.stroke();
    if (blockAboveRing) { ctx1.strokeStyle = ringAlertColor; }; // Change ring color if movingBlock.height meets threshold.
    ctx1.beginPath();
    ctx1.arc(0, 0, ringRadius, alertArcLength, 2 * Math.PI, true); // counter-clockwise
    ctx1.stroke();
    ctx1.restore();

    // Adjust circle gradient/fill.
    if (changeCircleHue) { changeCircleColor(changeCircleHue); };

    // Draw circle.
    ctx1.save();
    ctx1.rotate(circle.radPos / numRadPos * 2 * Math.PI);
    ctx1.fillStyle = circleColor;
    ctx1.beginPath();
    ctx1.arc(0, 0, circleRadius + 1 / windowScaling, 0, 2 * Math.PI, false); // Adds 1 pixel to defined circleRadius.
    ctx1.fill();
    ctx1.restore();

    // // Invert all colors.
    // ctx1.save();
    // ctx1.globalCompositeOperation = 'difference';
    // ctx1.fillStyle = '#ffffff';
    // ctx1.fillRect(canvas1.width / -2, canvas1.height / -2, canvas1.width, canvas1.height);
    // ctx1.restore();
};

function newTree() {
    // Returns boolean representing whether or not a new tree was able to be generated.

    let validTrunks = []; // Populated in for loop below.

    for (let radPos = 0; radPos < numRadPos; radPos++) {

        let trunkLayer = 0; // Initialized to 0. Remains 0 if for loop below doesn't find layer with blockHere.

        // Determine which layer the trunk would be placed at this radPos.
        for (let layerNumber = maxNumLayers - 2; layerNumber >= 0; layerNumber--) {
            if (circle.grid[layerNumber][radPos].blockHere) {
                trunkLayer = layerNumber + 1;
                break;
            };
        };

        if (trunkLayer === maxNumLayers - 1) { continue; }; // There is not a valid layer to place trunk at this radPos.

        let minGapClear = true; // Initialized to true. Changed to false in for loop below if blockHere found.

        // If there are any blocks within treeMinGap on trunkLayer or on the layer above trunkLayer, then minGapClear is false.
        for (let offset = -treeMinGap; offset <= treeMinGap; offset++) {
            let thisLayerCell = circle.grid[trunkLayer][mod(radPos + offset, numRadPos)];
            let layerAboveCell = circle.grid[trunkLayer + 1][mod(radPos + offset, numRadPos)];
            if (thisLayerCell.blockHere || layerAboveCell.blockHere) {
                minGapClear = false;
                break;
            };
        };

        if (minGapClear) {
            let thisTrunk = { radPos: radPos, layer: trunkLayer, };
            validTrunks.push(thisTrunk);
        };
    };

    if (treeSizeLimit <= 0 || validTrunks.length <= 0) { return false; }; // Terminate growing tree here.

    let trunk = randChoice(validTrunks); // trunk keys: radPos, layer

    // Add trunk.
    circle.grid[trunk.layer][trunk.radPos].blockHere = true;
    circle.grid[trunk.layer][trunk.radPos].hsl = treeInitialHSL;
    lastNewTreeCells = [[trunk.layer, trunk.radPos, ], ];

    if (treeSizeLimit <= 1 || trunk.layer + 1 >= maxNumLayers - 1) { return true; };
        // Size limit or height limit reached. Terminate growing tree here.

    // Determine limits to branch position/width.
    let leftBlockedAtOffsetNum = 0; // Initialized to 0, and possibly increased after tests in for loop below.
    let rightBlockedAtOffsetNum = 0; // Initialized to 0, and possibly increased after tests in for loop below.

    // Check surrounding cells within treeMinGap for blocks that are too close at distance offset.
    for (let offset = 0; offset < numRadPos; offset++) {

        let leftOffsetBlocked = false;
        let rightOffsetBlocked = false;

        // Check layers at this offset to see if this offset is blocked (left and right).
        for (let layer = trunk.layer; layer <= trunk.layer + 2; layer++) {
            if (layer === trunk.layer && offset === 0) { continue; };
            if (circle.grid[layer][mod(trunk.radPos - offset, numRadPos)].blockHere) { // minus offset
                leftOffsetBlocked = true;
            };
            if (circle.grid[layer][mod(trunk.radPos + offset, numRadPos)].blockHere) { // plus offset
                rightOffsetBlocked = true;
            };
            if (leftOffsetBlocked && rightOffsetBlocked) { break; };
        };

        if (leftOffsetBlocked === false) { leftBlockedAtOffsetNum = offset + 1; };

        if (rightOffsetBlocked === false) {
            rightBlockedAtOffsetNum = offset + 1;

        } else if (leftOffsetBlocked) { break; }; // If left and right blocked at this offset, break for loop.
    };

    leftBlockedAtOffsetNum += treeMinGap * -1; // Account for treeMinGap.
    rightBlockedAtOffsetNum += treeMinGap * -1; // Account for treeMinGap.

    if (leftBlockedAtOffsetNum <= 0 || rightBlockedAtOffsetNum <= 0) { return true; }; // No room to grow branch. Terminate growing tree here.

    let maxBranchWidth = Math.min(rightBlockedAtOffsetNum + leftBlockedAtOffsetNum - 1, treeSizeLimit - 1, numRadPos - treeMinGap);

    if (maxBranchWidth < treeMinBranchWidth) { return true; }; // No valid branch size. Terminate growing tree here.

    let branchWidth = randInt(treeMinBranchWidth, maxBranchWidth);
    let leftmostPossibleBranchPositionOffset = Math.max(leftBlockedAtOffsetNum * -1 + 1, 1 - branchWidth);
    let rightmostPossibleBranchPositionOffset = Math.min(rightBlockedAtOffsetNum - branchWidth, 0);
    let branchPositionOffset = randInt(leftmostPossibleBranchPositionOffset, rightmostPossibleBranchPositionOffset);

    // Add branch.
    for (let cell = 0; cell < branchWidth; cell++) {

        let radPos = mod(trunk.radPos + branchPositionOffset + cell, numRadPos);
        circle.grid[trunk.layer + 1][radPos].blockHere = true;
        circle.grid[trunk.layer + 1][radPos].hsl = treeInitialHSL;
        lastNewTreeCells.push([trunk.layer + 1, radPos, ]);
    };

    return true;
};


// AUDIO FUNCTIONS

function setupAudioConnections(audioSourceKey, loop, playbackRate=1) {
    // AudioSourceKey is the key name to setup within audioSources. Loop is a boolean.

    audioSources[audioSourceKey] = {};
    audioSources[audioSourceKey].loop = loop;
    audioSources[audioSourceKey].playbackRate = playbackRate;
    audioSources[audioSourceKey].rampTimeoutID = null;
    audioSources[audioSourceKey].gainNode1 = audioCtx.createGain();
    audioSources[audioSourceKey].gainNode1.gain.setValueAtTime(0, audioCtx.currentTime);
    audioSources[audioSourceKey].gainNode2 = audioCtx.createGain();
    audioSources[audioSourceKey].gainNode2.gain.setValueAtTime(1, audioCtx.currentTime);
    audioSources[audioSourceKey].gainNode1.connect(audioSources[audioSourceKey].gainNode2);
    audioSources[audioSourceKey].gainNode2.connect(masterGain);
};

function serverFileAudioSource(audioSourceKey, fileName, loop, playbackRate=1) {
    // AudioSourceKey is the key name to setup within audioSources. FileName is file within the source folder. Loop is a boolean.

    setupAudioConnections(audioSourceKey, loop, playbackRate);

    let path = `/static/${fileName}`;

    let request = new XMLHttpRequest();
    request.responseType = 'arraybuffer';
    request.open('GET', path, true);
    request.send();

    return new Promise((resolve, reject) => {

        request.onload = function() {
            audioCtx.decodeAudioData(request.response)
            .then(audioBuffer => {
                audioSources[audioSourceKey].bufferData = audioBuffer;
                resolve(audioBuffer);
            })
            .catch(e => {
                console.error(e);
                reject();
            });
        };
    });
};

function whiteNoiseAudioSource(audioSourceKey, loop) {

    setupAudioConnections(audioSourceKey, loop);

    let audioBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * 2, audioCtx.sampleRate); // 2 seconds long.

    // Generate random value at each sample for each channel.
    for (let channel = 0; channel < 2; channel++) {

        let bufferChannelArray = audioBuffer.getChannelData(channel);

        for (let sample = 0; sample < audioBuffer.length; sample++) {
            bufferChannelArray[sample] = Math.random() * 2 - 1;
        };
    };

    audioSources[audioSourceKey].bufferData = audioBuffer;
};

function cancelScheduledAudioEvents(audioSourceKey) {

    clearTimeout(audioSources[audioSourceKey].rampTimeoutID);
    audioSources[audioSourceKey].gainNode1.gain.cancelScheduledValues(audioCtx.currentTime);
};

function hardRamp(audioSourceKey, targetValue, angle) { // Angle = seconds to traverse values from 0 to 1.
    // Hard ramp waits 1 msec to begin ramp, and waits 1 msec after ramp ends to resolve promise.
    // So total time is duration + 2 msecs.

    let currentGain = audioSources[audioSourceKey].gainNode1.gain.value;
    let duration = Math.abs(currentGain - targetValue) * angle;

    cancelScheduledAudioEvents(audioSourceKey);
    audioSources[audioSourceKey].gainNode1.gain.setValueAtTime(currentGain, audioCtx.currentTime + 0.001); // Needed to prevent click at ramp start.
    audioSources[audioSourceKey].gainNode1.gain.linearRampToValueAtTime(targetValue, audioCtx.currentTime + duration + 0.001);

    return new Promise((resolve, reject) => {
        audioSources[audioSourceKey].rampTimeoutID = setTimeout(function() { resolve(); }, duration * 1000 + 2);
    });
};

function stopAudio(audioSourceKey) {

    hardRamp(audioSourceKey, 0, 0.040)
    .then(() => {
        if (audioSources[audioSourceKey].source !== undefined) {
            audioSources[audioSourceKey].source.stop();
        };
        if (audioSourceKey === 'glitch') {
            audioSources.glitch.gainNode1.gain.setValueAtTime(1, audioCtx.currentTime + 0.001);
        };
    })
    .catch(e => console.error(e));
};

function stopAllAudio() {
    for (audioSourceKey in audioSources) { stopAudio(audioSourceKey); };
};

function audioSourceStart(audioSourceKey) {

    if (audioMuted) { return; };

    cancelScheduledAudioEvents(audioSourceKey);

    if (audioSources[audioSourceKey].source !== undefined) { audioSources[audioSourceKey].source.stop(); };

    audioSources[audioSourceKey].source = audioCtx.createBufferSource();
    audioSources[audioSourceKey].source.buffer = audioSources[audioSourceKey].bufferData;
    audioSources[audioSourceKey].source.loop = audioSources[audioSourceKey].loop;
    audioSources[audioSourceKey].source.playbackRate.setValueAtTime(audioSources[audioSourceKey].playbackRate, audioCtx.currentTime);
    audioSources[audioSourceKey].source.connect(audioSources[audioSourceKey].gainNode1);

    let startSec = 0;
    if (audioSourceKey === 'slide' || audioSourceKey === 'fastForward') {
        startSec = randFloat(0, audioSources[audioSourceKey].source.buffer.duration);
    };

    audioSources[audioSourceKey].source.start(0, startSec);
};

function playAudio(audioSourceKey) {

    if (audioMuted) { return; };

    hardRamp(audioSourceKey, 0, 0.040)

    .then(() => {

        audioSourceStart(audioSourceKey);

        if (audioSourceKey === 'slide' || audioSourceKey === 'fastForward') {
            // Slide and fastForward start at random point, and need a ramp.
            hardRamp(audioSourceKey, 1, 0.040);
        } else {
            cancelScheduledAudioEvents(audioSourceKey);
            audioSources[audioSourceKey].gainNode1.gain.setValueAtTime(1, audioCtx.currentTime);
        };
    })
    .catch(e => console.error(e));
};

function triggerGlitchAudio() {

    if (audioMuted) { return; };

    let currentGain = audioSources.glitch.gainNode1.gain.value;

    audioSourceStart('glitch');
    let pbRate = Math.pow(2, Math.pow(randFloat(0, glitchAudioHighestOctaveShift - glitchAudioLowestOctaveShift) + glitchAudioLowestOctaveShift, glitchAudioOctaveShiftExponCurve));
    audioSources.glitch.source.playbackRate.setValueAtTime(pbRate, audioCtx.currentTime);
};

function cancelClickAudio() {

    cancelScheduledAudioEvents('click');
    clearInterval(cancelClickIDs.interval);
    clearTimeout(cancelClickIDs.timeout);
    cancelClickIDs = { interval: null, timeout: null, };

    if (audioSources.click.source !== undefined) {

        audioSources.click.source.playbackRate.cancelScheduledValues(audioCtx.currentTime);
        audioSources.click.source.stop();
    };
};

function triggerClickAudio() {

    if (audioMuted) { return; };

    const intervalMsecs = 50;
        // Frequency in milliseconds at which the playback rate and loop frequency values are updated.

    let startTime = audioCtx.currentTime;

    cancelClickAudio();
    audioSourceStart('click');

    audioSources.click.source.playbackRate.setValueAtTime(clickAudioInitPitch, audioCtx.currentTime);
    audioSources.click.source.playbackRate.linearRampToValueAtTime(clickAudioFinalPitch, startTime + blockSlideTime / animationSpeedFactor);

    audioSources.click.source.loopEnd = clickAudioInitFreq * clickAudioInitPitch / animationSpeedFactor;

    cancelClickIDs.interval = setInterval(function() {
        let relTimeElapsed = (audioCtx.currentTime - startTime + intervalMsecs / 2000) * animationSpeedFactor / blockSlideTime;
        let currentPbRate = (clickAudioFinalPitch - clickAudioInitPitch) * relTimeElapsed + clickAudioInitPitch;
        let currentFreq = (clickAudioFinalFreq - clickAudioInitFreq) * Math.pow(relTimeElapsed, clickAudioFreqExponCurve) + clickAudioInitFreq;
        audioSources.click.source.loopEnd = currentFreq * currentPbRate / animationSpeedFactor;
    }, intervalMsecs);

    cancelClickIDs.timeout = setTimeout(function() { cancelClickAudio(); }, blockSlideTime * 1000 / animationSpeedFactor);
};

function fastForwardOn() {

    if (animationSpeedFactor !== 1) { return; };

    animationSpeedFactor = fastForwardSpeed;
    updateArrowsAppearance(false);
    cancelClickAudio();
    playAudio('fastForward');
};

function fastForwardOff() {

    if (animationSpeedFactor === 1 || controls.ArrowDown.blocked) { return; };
    if (controls.mouse.lastActiveRank === -2 || controls.touch.lastActiveRank === -2) { return; };

    animationSpeedFactor = 1;
    ffCirclePhase = 0;
    changeCircleColor('none');
    ffCirclePhase = 0;
    updateArrowsAppearance(rotation === 0 && controls.mouse.position === 0);
    stopAudio('fastForward');
};

function adminAlert () {

    const firstAlertSec = 30;  // Send first alert after X seconds.
    const alertSpacing = 3;  // exponential proportion for consecutive alert times.
    // thisAlertSec = firstAlertSec * alertSpacing ^ alertNum

    if (Date.now() < nextAlertMsec) { return; };  // Not time for alert yet.

    if (userStartMsec === null) {
        userStartMsec = Date.now();
        nextAlertMsec = userStartMsec + firstAlertSec * 1000;        
    } else {
        nextAlertMsec = userStartMsec + (nextAlertMsec - userStartMsec) * alertSpacing;
    };

    if (Date.now() > nextAlertMsec) {
        // User was idle past threshold. Reset timer.
        userStartMsec = Date.now();
        nextAlertMsec = userStartMsec + firstAlertSec * 1000;     
    };

    let request = new XMLHttpRequest();
    request.open("POST", '/serverterminal', true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    let userSecs = Math.floor((Date.now() - userStartMsec) / 1000);
    let requestContent = `userstartmsec=${userStartMsec}&usersecs=${Math.floor(userSecs)}`;
    request.send(requestContent);
};


// UTILITY FUNCTIONS

function mod(a, n) { return ((a % n) + n) % n; }; // Always returns positive result.

function randChoice(array) {
    index = Math.floor(Math.random() * array.length);
    return array[index];
};

function randInt(min, max, exponCurve=1) {
    // min <= randInt <= max // exponCurve is any positive real number. >1 curves toward min. <1 curves toward max.
    return Math.floor(Math.pow(Math.random(), exponCurve) * (max - min + 1) + min);
};

function randFloat(min, max, exponCurve=1) {
    // min <= randFloat < max // exponCurve is any positive real number. >1 curves toward min. <1 curves toward max.
    return Math.pow(Math.random(), exponCurve) * (max - min) + min;
};

function dbToPcm(db) { return Math.pow(10, db / 20); };

function pcmToDb(pcm) { return Math.log10(pcm) * 20; };

function consoleLog(text) {

    console.log(text);

    canvasConsoleLines.push(text);
    canvasConsoleLines = canvasConsoleLines.slice(-50); // Only keep the most recent 50 lines.

    htmlConsole.style.display = 'block';
    let fullText = text + '\n' + htmlConsole.innerText;
    htmlConsole.innerText = fullText.slice(0, 1500); // Only keep the most recent 1500 characters.
};
