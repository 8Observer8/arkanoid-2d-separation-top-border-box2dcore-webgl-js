import { mat4 } from "gl-matrix";
import { b2BodyType, b2PolygonShape, b2Vec2 } from "@box2d/core";
import { b2World, DrawShapes } from "@box2d/core";
import { gl, initWebGLContext } from "./webgl-context.js";
import createProgram from "./shader-program.js";
import getSpriteInfo from "./get-sprite-info.js";
import loadTexture from "./load-texture.js";
import ContactListener from "./contact-listener.js";
import DebugDrawer from "./debug-drawer.js";
import Keyboard from "./keyboard.js";
import Sprite from "./sprite.js";

let blockBody;
let ballBody;
let currentBallXPos = 0;
const pixelsPerMeter = 30;

const ballXPosElement = document.getElementById("ballXPos");
const blockYPosElement = document.getElementById("blockYPos");
const yPosSliderElement = document.getElementById("yPosSlider");

function setBlockYPos() {
    const px = blockBody.GetPosition().x;

    const py = yPosSliderElement.value;
    blockYPosElement.value = py;

    blockBody.SetTransformXY(px, py / pixelsPerMeter, 0);
}

blockYPosElement.addEventListener("input", function (evt) {
    setBlockYPos();
});

yPosSliderElement.addEventListener("input", () => {
    setBlockYPos();
});

async function init() {

    if (!initWebGLContext("renderCanvas")) {
        return;
    }

    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const projMatrix = mat4.create();
    mat4.ortho(projMatrix, -115, 115, -115, 115, 1, -1);
    const viewMatrix = mat4.create();
    mat4.lookAt(viewMatrix, [0, 0, 1], [0, 0, 0], [0, 1, 0]);
    const projViewMatrix = mat4.create();
    mat4.mul(projViewMatrix, projMatrix, viewMatrix);

    const gravity = { x: 0, y: 0 };
    const world = b2World.Create(gravity);

    const colorProgram = await createProgram("assets/shaders/",
        "color.vert", "color.frag");
    const debugDrawer = new DebugDrawer(colorProgram, pixelsPerMeter);
    debugDrawer.projViewMatrix = projMatrix;

    const textureProgram = await createProgram("assets/shaders/",
        "texture.vert", "texture.frag");

    const texturePath = "assets/sprites/texture.png";
    const texture = await loadTexture(texturePath);
    const textureResponse = await fetch("assets/sprites/texture.json");
    const textureContent = await textureResponse.text();
    const atlasJson = JSON.parse(textureContent);
    const spriteNames = ["border_left.png", "border_right.png", "border_top.png",
        "hexagon_pattern.png", "racket.png", "ball.png", "block_blue.png",
        "block_green.png", "block_pink.png", "block_red.png", "block_yellow.png"
    ];
    const spriteInfo = getSpriteInfo(atlasJson, spriteNames);
    const sprite = new Sprite(textureProgram, spriteNames, spriteInfo, texture);

    // Left border
    const leftBorderPosX = -107;
    sprite.setTextureRect("border_left.png");
    const leftBorderHalfW = sprite.w / 2;
    const leftBorderHalfH = sprite.h / 2;
    const leftBorderBodyDef = {
        position: new b2Vec2(leftBorderPosX / pixelsPerMeter, 0 / pixelsPerMeter),
        type: b2BodyType.b2_staticBody
    };
    const leftBorderBody = world.CreateBody(leftBorderBodyDef);
    const leftBorderShape = new b2PolygonShape();
    leftBorderShape.SetAsBox(leftBorderHalfW / pixelsPerMeter,
        leftBorderHalfH / pixelsPerMeter);
    const leftBorderFixtureDef = {
        shape: leftBorderShape,
        density: 0,
        friction: 0,
        restitution: 1
    };
    const leftBorderFixture = leftBorderBody.CreateFixture(leftBorderFixtureDef);
    leftBorderFixture.SetUserData({ name: "leftBorder" });

    // Right border
    const rightBorderPosX = 107;
    sprite.setTextureRect("border_right.png");
    const rightBorderHalfW = sprite.w / 2;
    const rightBorderHalfH = sprite.h / 2;
    const rightBorderBodyDef = {
        position: new b2Vec2(rightBorderPosX / pixelsPerMeter, 0 / pixelsPerMeter),
        type: b2BodyType.b2_staticBody
    };
    const rightBorderBody = world.CreateBody(rightBorderBodyDef);
    const rightBorderShape = new b2PolygonShape();
    rightBorderShape.SetAsBox(rightBorderHalfW / pixelsPerMeter,
        rightBorderHalfH / pixelsPerMeter);
    const rightBorderFixtureDef = {
        shape: rightBorderShape,
        density: 0,
        friction: 0,
        restitution: 1
    };
    const rightBorderFixture = rightBorderBody.CreateFixture(rightBorderFixtureDef);
    rightBorderFixture.SetUserData({ name: "rightBorder" });

    // Top border
    const topBorderPosY = 112;
    sprite.setTextureRect("border_top.png");
    const topBorderHalfW = sprite.w / 2;
    const topBorderHalfH = sprite.h / 2;
    const topBorderBodyDef = {
        position: new b2Vec2(0 / pixelsPerMeter, topBorderPosY / pixelsPerMeter),
        type: b2BodyType.b2_staticBody
    };
    const topBorderBody = world.CreateBody(topBorderBodyDef);
    const topBorderShape = new b2PolygonShape();
    topBorderShape.SetAsBox(topBorderHalfW / pixelsPerMeter,
        topBorderHalfH / pixelsPerMeter);
    const topBorderFixtureDef = {
        shape: topBorderShape,
        density: 0,
        friction: 0,
        restitution: 1
    };
    const topBorderFixture = topBorderBody.CreateFixture(topBorderFixtureDef);
    topBorderFixture.SetUserData({ name: "topBorder" });

    // Bottom border
    const bottomBorderPosY = -112;
    const bottomBorderHalfW = topBorderHalfW;
    const bottomBorderHalfH = topBorderHalfH;
    const bottomBorderBodyDef = {
        position: new b2Vec2(0 / pixelsPerMeter, bottomBorderPosY / pixelsPerMeter),
        type: b2BodyType.b2_staticBody
    };
    const bottomBorderBody = world.CreateBody(bottomBorderBodyDef);
    const bottomBorderShape = new b2PolygonShape();
    bottomBorderShape.SetAsBox(bottomBorderHalfW / pixelsPerMeter,
        bottomBorderHalfH / pixelsPerMeter);
    const bottomBorderFixtureDef = {
        shape: bottomBorderShape,
        density: 0,
        friction: 0,
        restitution: 1
    };
    const bottomBorderFixture = bottomBorderBody.CreateFixture(bottomBorderFixtureDef);
    bottomBorderFixture.SetUserData({ name: "bottomBorder" });

    // Racket
    sprite.setTextureRect("racket.png");
    const racketHalfW = sprite.w / 2;
    const racketHalfH = sprite.h / 2;
    const racketBodyDef = {
        position: new b2Vec2(0 / pixelsPerMeter, -95 / pixelsPerMeter),
        type: b2BodyType.b2_kinamaticBody
    };
    const racketBody = world.CreateBody(racketBodyDef);
    const racketShape = new b2PolygonShape();
    racketShape.SetAsBox(racketHalfW / pixelsPerMeter,
        racketHalfH / pixelsPerMeter);
    const racketFixtureDef = {
        shape: racketShape,
        density: 1,
        friction: 0,
        restitution: 1
    };
    const racketFixture = racketBody.CreateFixture(racketFixtureDef);
    racketFixture.SetUserData({ name: "racket" });
    const racketVelocity = 5;

    // Ball
    sprite.setTextureRect("ball.png");
    const ballHalfW = sprite.w / 2;
    const ballHalfH = sprite.h / 2;
    const ballBodyDef = {
        position: new b2Vec2(0 / pixelsPerMeter, -80 / pixelsPerMeter),
        type: b2BodyType.b2_dynamicBody
    };
    ballBody = world.CreateBody(ballBodyDef);
    ballBody.SetFixedRotation(true);
    const ballShape = new b2PolygonShape();
    ballShape.SetAsBox(ballHalfW / pixelsPerMeter,
        ballHalfH / pixelsPerMeter);
    const ballFixtureDef = {
        shape: ballShape,
        density: 1,
        friction: 0,
        restitution: 1
    };
    const ballFixture = ballBody.CreateFixture(ballFixtureDef);
    ballFixture.SetUserData({ name: "ball" });
    const ballVelocity = 5;
    ballBody.SetLinearVelocity(new b2Vec2(0, ballVelocity));
    ballBody.SetBullet(true);

    // Block
    sprite.setTextureRect("block_red.png");
    const blockHalfW = sprite.w / 2;
    const blockHalfH = sprite.h / 2;
    const blockBodyDef = {
        position: new b2Vec2(-11.5 / pixelsPerMeter, 0 / pixelsPerMeter),
        type: b2BodyType.b2_staticBody
    };
    blockBody = world.CreateBody(blockBodyDef);
    const blockShape = new b2PolygonShape();
    blockShape.SetAsBox(blockHalfW / pixelsPerMeter,
        blockHalfH / pixelsPerMeter);
    const blockFixtureDef = {
        shape: blockShape,
        density: 0,
        friction: 0,
        restitution: 1
    };
    const blockFixture = blockBody.CreateFixture(blockFixtureDef);
    blockFixture.SetUserData({ name: "block" });

    // world.DestroyBody(blockBody);

    const contactListener = new ContactListener(world, racketHalfW, ballVelocity,
        pixelsPerMeter);
    world.SetContactListener(contactListener);

    let currentTime, lastTime, dt;
    const keyboard = new Keyboard();

    function render() {
        requestAnimationFrame(render);

        currentTime = Date.now();
        dt = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        if (keyboard.pressed("KeyA")) {
            let x = racketBody.GetPosition().x;
            const y = racketBody.GetPosition().y;
            x = x - dt * racketVelocity;
            if (leftBorderPosX + racketHalfW + leftBorderHalfW < x * pixelsPerMeter) {
                racketBody.SetTransform(new b2Vec2(x, y), 0);
            }
        }

        if (keyboard.pressed("KeyD")) {
            let x = racketBody.GetPosition().x;
            const y = racketBody.GetPosition().y;
            x = x + dt * racketVelocity;
            if (x * pixelsPerMeter < rightBorderPosX - racketHalfW - rightBorderHalfW) {
                racketBody.SetTransform(new b2Vec2(x, y), 0);
            }
        }

        world.Step(0.016, { velocityIterations: 3, positionIterations: 2 });

        if (currentBallXPos !== ballBody.GetPosition().x * pixelsPerMeter) {
            currentBallXPos = ballBody.GetPosition().x * pixelsPerMeter;
            ballXPosElement.innerText = currentBallXPos;
        }

        gl.clear(gl.COLOR_BUFFER_BIT);

        sprite.setTextureRect("hexagon_pattern.png");
        sprite.setPosition(0, 0);
        sprite.draw(projViewMatrix);

        sprite.setTextureRect("border_left.png");
        sprite.setPosition(leftBorderPosX, 0);
        sprite.draw(projViewMatrix);

        sprite.setTextureRect("border_right.png");
        sprite.setPosition(rightBorderPosX, 0);
        sprite.draw(projViewMatrix);

        sprite.setTextureRect("border_top.png");
        sprite.setPosition(0, topBorderPosY);
        sprite.draw(projViewMatrix);

        sprite.setTextureRect("racket.png");
        sprite.setPosition(racketBody.GetPosition().x * pixelsPerMeter,
            racketBody.GetPosition().y * pixelsPerMeter);
        sprite.draw(projViewMatrix);

        sprite.setTextureRect("ball.png");
        sprite.setPosition(ballBody.GetPosition().x * pixelsPerMeter,
            ballBody.GetPosition().y * pixelsPerMeter);
        sprite.draw(projViewMatrix);

        // const blockIsVisible = metaData[getPointer(blockFixture)].isVisible;
        // if (blockIsVisible) {
            sprite.setTextureRect("block_red.png");
            sprite.setPosition(blockBody.GetPosition().x * pixelsPerMeter,
                blockBody.GetPosition().y * pixelsPerMeter);
            sprite.draw(projViewMatrix);
        // }

        DrawShapes(debugDrawer, world);
    }

    render();
}

init();
